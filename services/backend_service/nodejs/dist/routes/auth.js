"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const crypto_1 = __importDefault(require("crypto"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const analytics_1 = require("../services/analytics");
const security_1 = require("../middleware/security");
const gamification_1 = require("../services/gamification");
const logger_1 = __importDefault(require("../utils/logger"));
const email_1 = __importDefault(require("../utils/email"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Rate limiting for auth
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
});
// Signup
router.post('/signup', authLimiter, security_1.sanitizeInput, security_1.validateSignup, async (req, res) => {
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
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        // Generate email verification token
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
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
            await email_1.default.sendEmail({
                to: email,
                subject: 'Verify Your Email - PolyglotCodeHub',
                html: email_1.default.generateVerificationEmailHtml(emailVerificationToken)
            });
        }
        catch (emailError) {
            logger_1.default.error({ error: emailError, userId: user.id }, 'Failed to send verification email');
            // Don't fail signup if email fails, but log it
        }
        // Track signup event
        (0, analytics_1.trackSignupSuccess)(user.id, req.ip);
        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                emailVerified: false
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Signup error');
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
        const isValidPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Track login event
        (0, analytics_1.trackLoginSuccess)(user.id, req.ip);
        // Award daily login points
        await (0, gamification_1.awardDailyLogin)(user.id);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
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
    }
    catch (error) {
        logger_1.default.error({ error, email }, 'Login error');
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: '2FA not enabled' });
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otp
        });
        if (!verified) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        res.json({ message: '2FA verified successfully' });
    }
    catch (error) {
        logger_1.default.error({ error, userId: decoded?.userId }, '2FA verify error');
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
        logger_1.default.info({ userId: user.id }, 'Email verified successfully');
        res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Email verification error');
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
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken,
                emailVerificationExpires
            }
        });
        // Send verification email
        await email_1.default.sendEmail({
            to: email,
            subject: 'Verify Your Email - PolyglotCodeHub',
            html: email_1.default.generateVerificationEmailHtml(emailVerificationToken)
        });
        res.json({ message: 'Verification email sent' });
    }
    catch (error) {
        logger_1.default.error({ error, email }, 'Resend verification error');
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
        const passwordResetToken = crypto_1.default.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken,
                passwordResetExpires
            }
        });
        // Send password reset email
        await email_1.default.sendEmail({
            to: email,
            subject: 'Reset Your Password - PolyglotCodeHub',
            html: email_1.default.generatePasswordResetEmailHtml(passwordResetToken)
        });
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    catch (error) {
        logger_1.default.error({ error, email }, 'Forgot password error');
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
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });
        logger_1.default.info({ userId: user.id }, 'Password reset successfully');
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Password reset error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Change Password
router.post('/change-password', auth_1.authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, 12);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash }
        });
        logger_1.default.info({ userId }, 'Password changed successfully');
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        logger_1.default.error({ error, userId: req.user?.userId }, 'Change password error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
