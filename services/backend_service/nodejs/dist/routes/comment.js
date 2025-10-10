"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get comments for a snippet (with threading)
router.get('/snippets/:snippetId', async (req, res) => {
    try {
        const { snippetId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Get top-level comments with their replies
        const comments = await prisma.comment.findMany({
            where: {
                snippetId,
                parentId: null, // Only top-level comments
                isDeleted: false
            },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true }
                },
                replies: {
                    where: { isDeleted: false },
                    include: {
                        author: {
                            select: { id: true, username: true, avatarUrl: true }
                        },
                        replies: {
                            where: { isDeleted: false },
                            include: {
                                author: {
                                    select: { id: true, username: true, avatarUrl: true }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        });
        const total = await prisma.comment.count({
            where: {
                snippetId,
                parentId: null,
                isDeleted: false
            }
        });
        res.json({
            comments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error, snippetId: req.params.snippetId }, 'Get comments error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Create a new comment
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { snippetId, content, parentId } = req.body;
        const authorId = req.user.userId;
        // Validate snippet exists
        const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found' });
        }
        let depth = 0;
        let parentComment = null;
        if (parentId) {
            parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            depth = parentComment.depth + 1;
            // Limit nesting depth to 3 levels
            if (depth > 3) {
                return res.status(400).json({ message: 'Maximum comment nesting depth exceeded' });
            }
        }
        const comment = await prisma.comment.create({
            data: {
                snippetId,
                authorId,
                content,
                parentId,
                depth
            },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true }
                }
            }
        });
        logger_1.default.info({ commentId: comment.id, authorId, snippetId }, 'Comment created');
        res.status(201).json(comment);
    }
    catch (error) {
        logger_1.default.error({ error, userId: req.user?.userId }, 'Create comment error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Update a comment
router.patch('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // Check if user owns the comment
        if (comment.authorId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const updatedComment = await prisma.comment.update({
            where: { id },
            data: { content },
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true }
                }
            }
        });
        logger_1.default.info({ commentId: id, userId }, 'Comment updated');
        res.json(updatedComment);
    }
    catch (error) {
        logger_1.default.error({ error, commentId: req.params.id }, 'Update comment error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete a comment (soft delete)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // Check if user owns the comment
        if (comment.authorId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await prisma.comment.update({
            where: { id },
            data: { isDeleted: true }
        });
        logger_1.default.info({ commentId: id, userId }, 'Comment deleted');
        res.json({ message: 'Comment deleted' });
    }
    catch (error) {
        logger_1.default.error({ error, commentId: req.params.id }, 'Delete comment error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Moderate a comment (admin only)
router.patch('/:id/moderate', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve', 'hide', 'delete'
        const moderatorId = req.user.userId;
        // Check if user is admin
        const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
        if (moderator?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const comment = await prisma.comment.findUnique({ where: { id } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        let updateData = { moderated: true, moderatorId };
        if (action === 'delete') {
            updateData.isDeleted = true;
        }
        else if (action === 'hide') {
            updateData.content = '[This comment has been hidden by moderators]';
        }
        const updatedComment = await prisma.comment.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: { id: true, username: true, avatarUrl: true }
                },
                moderator: {
                    select: { id: true, username: true }
                }
            }
        });
        logger_1.default.info({ commentId: id, moderatorId, action }, 'Comment moderated');
        res.json(updatedComment);
    }
    catch (error) {
        logger_1.default.error({ error, commentId: req.params.id }, 'Moderate comment error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
