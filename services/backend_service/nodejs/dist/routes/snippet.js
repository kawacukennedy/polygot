"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const execution_1 = require("../services/execution");
const gamification_1 = require("../services/gamification");
const analytics_1 = require("../services/analytics");
const security_1 = require("../middleware/security");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Create snippet
router.post('/', auth_1.authenticate, security_1.sanitizeInput, security_1.validateSnippet, async (req, res) => {
    try {
        const { title, code, language, visibility, tags } = req.body;
        const snippet = await prisma.snippet.create({
            data: {
                title,
                code,
                language,
                visibility,
                tags,
                ownerId: req.user.userId
            }
        });
        // Award points for sharing snippet
        await (0, gamification_1.awardPoints)(req.user.userId, 'snippet_shared');
        res.status(201).json(snippet);
    }
    catch (error) {
        logger_1.default.error({ error, userId: req.user.userId }, 'Create snippet error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get snippet
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const snippet = await prisma.snippet.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { username: true }
                },
                comments: {
                    include: {
                        author: { select: { username: true } }
                    }
                }
            }
        });
        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found' });
        }
        if (snippet.visibility === 'PRIVATE' && req.user?.userId !== snippet.ownerId) {
            return res.status(403).json({ message: 'Private snippet' });
        }
        res.json(snippet);
    }
    catch (error) {
        logger_1.default.error({ error, snippetId: id }, 'Get snippet error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Run snippet
router.post('/:id/run', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const snippet = await prisma.snippet.findUnique({ where: { id } });
        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found' });
        }
        // Create execution record
        const execution = await prisma.execution.create({
            data: {
                snippetId: id,
                userId: req.user.userId,
                status: 'PENDING'
            }
        });
        // Execute code asynchronously
        (0, execution_1.executeCode)(snippet.code, snippet.language)
            .then(async (result) => {
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: result.success ? 'SUCCESS' : 'ERROR',
                    stdout: result.stdout,
                    stderr: result.stderr,
                    executionTimeMs: result.executionTime,
                    finishedAt: new Date()
                }
            });
            // Track analytics event
            (0, analytics_1.trackSnippetRun)(req.user.userId, snippet.id, result.executionTime, result.success ? 'success' : 'error', req.ip);
            // Award points for running snippet
            await (0, gamification_1.awardPoints)(req.user.userId, 'snippet_run');
        })
            .catch(async (error) => {
            await prisma.execution.update({
                where: { id: execution.id },
                data: {
                    status: 'ERROR',
                    stderr: error.message,
                    finishedAt: new Date()
                }
            });
            // Track failed execution
            (0, analytics_1.trackSnippetRun)(req.user.userId, snippet.id, 0, 'error', req.ip);
        });
        res.status(202).json({ executionId: execution.id });
    }
    catch (error) {
        logger_1.default.error({ error, snippetId: id, userId: req.user.userId }, 'Run snippet error');
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
