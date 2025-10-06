"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get users
router.get('/users', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete user
router.delete('/users/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Log audit
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'DELETE_USER',
                target: id
            }
        });
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get snippets
router.get('/snippets', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const snippets = await prisma.snippet.findMany({
            include: {
                owner: { select: { username: true } }
            }
        });
        res.json(snippets);
    }
    catch (error) {
        console.error('Get snippets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete snippet
router.delete('/snippets/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Log audit
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'DELETE_SNIPPET',
                target: id
            }
        });
        await prisma.snippet.delete({ where: { id } });
        res.json({ message: 'Snippet deleted' });
    }
    catch (error) {
        console.error('Delete snippet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
