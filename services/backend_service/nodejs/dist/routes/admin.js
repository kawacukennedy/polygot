"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const execution_1 = require("../services/execution");
const logger_1 = __importDefault(require("../utils/logger"));
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
        logger_1.default.error({ error, snippetId: id, adminId: req.user.userId }, 'Delete snippet error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get executions
router.get('/executions', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const executions = await prisma.execution.findMany({
            include: {
                user: { select: { username: true } },
                snippet: { select: { title: true, language: true } }
            },
            orderBy: { startedAt: 'desc' },
            take: 100
        });
        res.json(executions);
    }
    catch (error) {
        logger_1.default.error({ error, adminId: req.user.userId }, 'Get executions error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Re-run execution
router.post('/executions/:id/rerun', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const execution = await prisma.execution.findUnique({
            where: { id },
            include: { snippet: true }
        });
        if (!execution) {
            return res.status(404).json({ message: 'Execution not found' });
        }
        // Log audit
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'RERUN_EXECUTION',
                target: id
            }
        });
        // Create new execution record
        const newExecution = await prisma.execution.create({
            data: {
                snippetId: execution.snippetId,
                userId: execution.userId,
                status: 'PENDING'
            }
        });
        // Execute code asynchronously
        (0, execution_1.executeCode)(execution.snippet.code, execution.snippet.language)
            .then(async (result) => {
            await prisma.execution.update({
                where: { id: newExecution.id },
                data: {
                    status: result.success ? 'SUCCESS' : 'ERROR',
                    stdout: result.stdout,
                    stderr: result.stderr,
                    executionTimeMs: result.executionTime,
                    finishedAt: new Date()
                }
            });
            logger_1.default.info({ executionId: newExecution.id, adminId: req.user.userId }, 'Execution rerun completed');
        })
            .catch(async (error) => {
            await prisma.execution.update({
                where: { id: newExecution.id },
                data: {
                    status: 'ERROR',
                    stderr: error.message,
                    finishedAt: new Date()
                }
            });
            logger_1.default.error({ error, executionId: newExecution.id, adminId: req.user.userId }, 'Execution rerun failed');
        });
        res.status(202).json({ executionId: newExecution.id });
    }
    catch (error) {
        logger_1.default.error({ error, executionId: id, adminId: req.user.userId }, 'Rerun execution error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Kill execution (for running executions)
router.post('/executions/:id/kill', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const execution = await prisma.execution.findUnique({ where: { id } });
        if (!execution) {
            return res.status(404).json({ message: 'Execution not found' });
        }
        if (execution.status !== 'RUNNING') {
            return res.status(400).json({ message: 'Execution is not running' });
        }
        // Log audit
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'KILL_EXECUTION',
                target: id
            }
        });
        // Update execution status to timeout/error
        await prisma.execution.update({
            where: { id },
            data: {
                status: 'TIMEOUT',
                stderr: 'Execution killed by admin',
                finishedAt: new Date()
            }
        });
        logger_1.default.info({ executionId: id, adminId: req.user.userId }, 'Execution killed by admin');
        res.json({ message: 'Execution killed' });
    }
    catch (error) {
        logger_1.default.error({ error, executionId: id, adminId: req.user.userId }, 'Kill execution error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Analytics endpoints
router.get('/analytics/overview', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // User statistics
        const totalUsers = await prisma.user.count();
        const newUsers30Days = await prisma.user.count({
            where: { createdAt: { gte: last30Days } }
        });
        const newUsers7Days = await prisma.user.count({
            where: { createdAt: { gte: last7Days } }
        });
        // Snippet statistics
        const totalSnippets = await prisma.snippet.count();
        const publicSnippets = await prisma.snippet.count({
            where: { visibility: 'PUBLIC' }
        });
        const newSnippets30Days = await prisma.snippet.count({
            where: { createdAt: { gte: last30Days } }
        });
        // Execution statistics
        const totalExecutions = await prisma.execution.count();
        const executions30Days = await prisma.execution.count({
            where: { startedAt: { gte: last30Days } }
        });
        const successfulExecutions = await prisma.execution.count({
            where: { status: 'SUCCESS' }
        });
        // Comment statistics
        const totalComments = await prisma.comment.count({
            where: { isDeleted: false }
        });
        const comments30Days = await prisma.comment.count({
            where: {
                isDeleted: false,
                createdAt: { gte: last30Days }
            }
        });
        res.json({
            users: {
                total: totalUsers,
                newLast30Days: newUsers30Days,
                newLast7Days: newUsers7Days
            },
            snippets: {
                total: totalSnippets,
                public: publicSnippets,
                newLast30Days: newSnippets30Days
            },
            executions: {
                total: totalExecutions,
                last30Days: executions30Days,
                successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : 0
            },
            comments: {
                total: totalComments,
                last30Days: comments30Days
            }
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get analytics overview error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/analytics/users-growth', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });
            data.push({
                date: startOfDay.toISOString().split('T')[0],
                users: count
            });
        }
        res.json(data);
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get users growth error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/analytics/snippets-growth', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            const count = await prisma.snippet.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            });
            data.push({
                date: startOfDay.toISOString().split('T')[0],
                snippets: count
            });
        }
        res.json(data);
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get snippets growth error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/analytics/language-distribution', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const languageStats = await prisma.snippet.groupBy({
            by: ['language'],
            _count: {
                language: true
            },
            orderBy: {
                _count: {
                    language: 'desc'
                }
            }
        });
        const data = languageStats.map(stat => ({
            language: stat.language,
            count: stat._count.language
        }));
        res.json(data);
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get language distribution error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/analytics/top-users', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Get users with most snippets
        const topSnippetCreators = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                _count: {
                    select: {
                        snippets: true
                    }
                }
            },
            orderBy: {
                snippets: {
                    _count: 'desc'
                }
            },
            take: limit
        });
        // Get users with most executions
        const topExecutors = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                _count: {
                    select: {
                        executions: true
                    }
                }
            },
            orderBy: {
                executions: {
                    _count: 'desc'
                }
            },
            take: limit
        });
        res.json({
            snippetCreators: topSnippetCreators.map(user => ({
                id: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl,
                count: user._count.snippets
            })),
            executors: topExecutors.map(user => ({
                id: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl,
                count: user._count.executions
            }))
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get top users error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/analytics/recent-activity', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        // Recent snippets
        const recentSnippets = await prisma.snippet.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: { username: true }
                }
            }
        });
        // Recent executions
        const recentExecutions = await prisma.execution.findMany({
            take: limit,
            orderBy: { startedAt: 'desc' },
            include: {
                user: {
                    select: { username: true }
                },
                snippet: {
                    select: { title: true }
                }
            }
        });
        // Recent comments
        const recentComments = await prisma.comment.findMany({
            where: { isDeleted: false },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { username: true }
                },
                snippet: {
                    select: { title: true }
                }
            }
        });
        res.json({
            recentSnippets: recentSnippets.map(snippet => ({
                id: snippet.id,
                title: snippet.title,
                author: snippet.owner.username,
                createdAt: snippet.createdAt
            })),
            recentExecutions: recentExecutions.map(execution => ({
                id: execution.id,
                snippetTitle: execution.snippet.title,
                user: execution.user.username,
                status: execution.status,
                startedAt: execution.startedAt
            })),
            recentComments: recentComments.map(comment => ({
                id: comment.id,
                snippetTitle: comment.snippet.title,
                author: comment.author.username,
                content: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
                createdAt: comment.createdAt
            }))
        });
    }
    catch (error) {
        logger_1.default.error({ error }, 'Get recent activity error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
