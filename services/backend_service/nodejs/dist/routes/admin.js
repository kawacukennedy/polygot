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
exports.default = router;
