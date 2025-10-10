"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Search snippets
router.get('/snippets', async (req, res) => {
    try {
        const { q, // search query
        language, visibility, author, tags, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20, dateFrom, dateTo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        // Build where clause
        const where = {
            visibility: visibility === 'public' ? 'PUBLIC' : undefined,
            isDeleted: false // Assuming we'll add this field for soft deletes
        };
        // Add search query conditions
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
                { tags: { hasSome: [q] } },
                { owner: { username: { contains: q, mode: 'insensitive' } } }
            ];
        }
        // Add filters
        if (language) {
            where.language = language;
        }
        if (author) {
            where.owner = { username: { contains: author, mode: 'insensitive' } };
        }
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            where.tags = { hasSome: tagArray };
        }
        // Date range filters
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo);
            }
        }
        // Build order by
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        // Execute search
        const [snippets, total] = await Promise.all([
            prisma.snippet.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, username: true, avatarUrl: true }
                    },
                    _count: {
                        select: { executions: true, comments: { where: { isDeleted: false } } }
                    }
                },
                orderBy,
                skip,
                take
            }),
            prisma.snippet.count({ where })
        ]);
        // Transform results to include comment count
        const transformedSnippets = snippets.map(snippet => ({
            ...snippet,
            commentsCount: snippet._count.comments,
            executionsCount: snippet._count.executions,
            _count: undefined // Remove the _count field from response
        }));
        res.json({
            snippets: transformedSnippets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            filters: {
                query: q,
                language,
                visibility,
                author,
                tags,
                dateFrom,
                dateTo,
                sortBy,
                sortOrder
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error, query: req.query }, 'Search snippets error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get popular search terms/tags
router.get('/popular-tags', async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 20;
        // Get most used tags from snippets
        const tagCounts = await prisma.snippet.findMany({
            where: { visibility: 'PUBLIC' },
            select: { tags: true }
        });
        // Count tag frequencies
        const tagFrequency = {};
        tagCounts.forEach(snippet => {
            snippet.tags.forEach(tag => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });
        // Sort by frequency and return top tags
        const popularTags = Object.entries(tagFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
        res.json({ tags: popularTags });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get popular tags error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Search users
router.get('/users', async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (q) {
            where.OR = [
                { username: { contains: q, mode: 'insensitive' } },
                { displayName: { contains: q, mode: 'insensitive' } },
                { bio: { contains: q, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    bio: true,
                    avatarUrl: true,
                    createdAt: true,
                    _count: {
                        select: { snippets: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.user.count({ where })
        ]);
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error, query: req.query }, 'Search users error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
