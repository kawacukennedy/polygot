import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { trackSignupSuccess, trackLoginSuccess } from '../services/analytics';
import { validateSignup, sanitizeInput } from '../middleware/security';
import { awardDailyLogin } from '../services/gamification';
import logger from '../utils/logger';

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

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    // Track signup event
    trackSignupSuccess(user.id, req.ip);

    // Generate JWT
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

    res.status(201).json({
      message: 'User created successfully',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error({ error, userId: user?.id }, 'Signup error');
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
      twoFactorRequired: user.twoFactorEnabled
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

export default router;