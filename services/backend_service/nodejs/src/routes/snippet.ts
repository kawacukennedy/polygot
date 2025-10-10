import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { executeCode } from '../services/execution';
import { awardPoints } from '../services/gamification';
import { trackSnippetRun } from '../services/analytics';
import { validateSnippet, sanitizeInput } from '../middleware/security';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Create snippet
router.post('/', authenticate, sanitizeInput, validateSnippet, async (req, res) => {
  try {
    const { title, code, language, visibility, tags } = req.body;

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        visibility,
        tags,
        ownerId: req.user!.userId
      }
    });

    // Award points for sharing snippet
    await awardPoints(req.user!.userId, 'snippet_shared');

    res.status(201).json(snippet);
  } catch (error) {
    logger.error({ error, userId: req.user!.userId }, 'Create snippet error');
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
          where: { isDeleted: false },
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            replies: {
              where: { isDeleted: false },
              include: {
                author: { select: { id: true, username: true, avatarUrl: true } },
                replies: {
                  where: { isDeleted: false },
                  include: {
                    author: { select: { id: true, username: true, avatarUrl: true } }
                  },
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
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
  } catch (error) {
    logger.error({ error, snippetId: id }, 'Get snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Run snippet
router.post('/:id/run', authenticate, async (req, res) => {
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
        userId: req.user!.userId,
        status: 'PENDING'
      }
    });

    // Execute code asynchronously
    executeCode(snippet.code, snippet.language)
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
        trackSnippetRun(
          req.user!.userId,
          snippet.id,
          result.executionTime,
          result.success ? 'success' : 'error',
          req.ip
        );

        // Award points for running snippet
        await awardPoints(req.user!.userId, 'snippet_run');
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
        trackSnippetRun(
          req.user!.userId,
          snippet.id,
          0,
          'error',
          req.ip
        );
      });

    res.status(202).json({ executionId: execution.id });
  } catch (error) {
    logger.error({ error, snippetId: id, userId: req.user!.userId }, 'Run snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;