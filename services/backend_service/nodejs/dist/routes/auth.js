"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const analytics_1 = require("../services/analytics");
const security_1 = require("../middleware/security");
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
        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash
            }
        });
        // Track signup event
        (0, analytics_1.trackSignupSuccess)(user.id, req.ip);
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
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
    }
    catch (error) {
        console.error('Signup error:', error);
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
        const isValidPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Track login event
        (0, analytics_1.trackLoginSuccess)(user.id, req.ip);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            refreshToken,
            twoFactorRequired: user.twoFactorEnabled
        });
    }
    catch (error) {
        console.error('Login error:', error);
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
        console.error('2FA verify error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
