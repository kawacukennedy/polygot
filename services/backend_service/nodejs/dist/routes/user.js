"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../utils/upload");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                theme: true,
                privacyLevel: true,
                achievements: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        snippets: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            username: user.username,
            display_name: user.displayName,
            bio: user.bio,
            avatar_url: user.avatarUrl,
            theme: user.theme,
            privacy_level: user.privacyLevel,
            achievements: user.achievements,
            snippets_count: user._count.snippets,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update user profile
router.patch('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { display_name, bio, theme, privacy_level } = req.body;
        // Check if user is updating their own profile
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await prisma.user.update({
            where: { id },
            data: {
                displayName: display_name,
                bio,
                theme,
                privacyLevel: privacy_level
            }
        });
        res.status(200).json({ message: 'updated' });
    }
    catch (error) {
        logger_1.default.error({ error, userId: id }, 'Update user error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Upload avatar
router.post('/:id/avatar', auth_1.authenticate, upload_1.uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user is updating their own avatar
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Get current user to delete old avatar
        const user = await prisma.user.findUnique({ where: { id } });
        if (user?.avatarUrl) {
            (0, upload_1.deleteOldAvatar)(user.avatarUrl);
        }
        // Generate avatar URL
        const avatarUrl = (0, upload_1.getAvatarUrl)(req.file.filename);
        // Update user avatar
        await prisma.user.update({
            where: { id },
            data: { avatarUrl }
        });
        logger_1.default.info({ userId: id, filename: req.file.filename }, 'Avatar uploaded successfully');
        res.json({ avatarUrl });
    }
    catch (error) {
        logger_1.default.error({ error, userId: req.params.id }, 'Avatar upload error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete avatar
router.delete('/:id/avatar', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user is updating their own avatar
        if (req.user.userId !== id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({ where: { id } });
        if (user?.avatarUrl) {
            (0, upload_1.deleteOldAvatar)(user.avatarUrl);
            await prisma.user.update({
                where: { id },
                data: { avatarUrl: null }
            });
        }
        logger_1.default.info({ userId: id }, 'Avatar deleted successfully');
        res.json({ message: 'Avatar deleted' });
    }
    catch (error) {
        logger_1.default.error({ error, userId: req.params.id }, 'Avatar delete error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
