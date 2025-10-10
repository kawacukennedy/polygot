"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get leaderboard
router.get('/', async (req, res) => {
    try {
        const { language } = req.query;
        const where = {};
        if (language) {
            where.snippets = {
                some: {
                    language: language
                }
            };
        }
        // For time frame, we'd need to filter by createdAt, but simplified here
        const leaderboard = await prisma.leaderboard.findMany({
            where,
            include: {
                user: {
                    select: { username: true }
                }
            },
            orderBy: {
                score: 'desc'
            },
            take: 100
        });
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
