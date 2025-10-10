import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { trackSignupSuccess, trackLoginSuccess } from '../services/analytics';
import { validateSignup, sanitizeInput } from '../middleware/security';
import { awardDailyLogin } from '../services/gamification';
import logger from '../utils/logger';
import emailService from '../utils/email';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Signup
router.post('/signup', authLimiter, sanitizeInput, validateSignup, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    // Send verification email
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Verify Your Email - PolyglotCodeHub',
        html: emailService.generateVerificationEmailHtml(emailVerificationToken)
      });
    } catch (emailError) {
      logger.error({ error: emailError, userId: user.id }, 'Failed to send verification email');
      // Don't fail signup if email fails, but log it
    }

    // Track signup event
    trackSignupSuccess(user.id, req.ip);

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: false
      }
    });
  } catch (error) {
    logger.error({ error }, 'Signup error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Track login event
    trackLoginSuccess(user.id, req.ip);

    // Award daily login points
    await awardDailyLogin(user.id);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      refreshToken,
      twoFactorRequired: user.twoFactorEnabled,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    logger.error({ error, email }, 'Login error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2FA Verify
router.post('/2fa/verify', async (req, res) => {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: '2FA verified successfully' });
  } catch (error) {
    logger.error({ error, userId: decoded?.userId }, '2FA verify error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    logger.info({ userId: user.id }, 'Email verified successfully');

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error({ error }, 'Email verification error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    // Send verification email
    await emailService.sendEmail({
      to: email,
      subject: 'Verify Your Email - PolyglotCodeHub',
      html: emailService.generateVerificationEmailHtml(emailVerificationToken)
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    logger.error({ error, email }, 'Resend verification error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires
      }
    });

    // Send password reset email
    await emailService.sendEmail({
      to: email,
      subject: 'Reset Your Password - PolyglotCodeHub',
      html: emailService.generatePasswordResetEmailHtml(passwordResetToken)
    });

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    logger.error({ error, email }, 'Forgot password error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    logger.info({ userId: user.id }, 'Password reset successfully');

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error({ error }, 'Password reset error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;