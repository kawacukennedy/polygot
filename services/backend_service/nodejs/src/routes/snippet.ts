import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { executeCode } from '../services/execution';
import { awardPoints } from '../services/gamification';
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
        ownerId: (req as any).user.userId
      }
    });

    // Award points for sharing snippet
    await awardPoints((req as any).user.userId, 'snippet_shared');

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
            author: {
              select: { username: true }
            },
            replies: {
              where: { isDeleted: false },
              include: {
                author: {
                  select: { username: true }
                }
              }
            }
          }
        }
      }
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const etag = `"${snippet.updatedAt.getTime()}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.set('ETag', etag);
    res.json(snippet);
  } catch (error) {
    logger.error({ error, snippetId: id }, 'Get snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update snippet
router.put('/:id', authenticate, sanitizeInput, validateSnippet, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, language, visibility, tags } = req.body;

    const snippet = await prisma.snippet.findUnique({ where: { id } });
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if ((req as any).user.userId !== snippet.ownerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: {
        title,
        code,
        language,
        visibility,
        tags
      }
    });

    res.json(updatedSnippet);
  } catch (error) {
    logger.error({ error, snippetId: id, userId: req.user!.userId }, 'Update snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Partial update snippet
router.patch('/:id', authenticate, sanitizeInput, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const snippet = await prisma.snippet.findUnique({ where: { id } });
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    if (req.user!.userId !== snippet.ownerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedSnippet = await prisma.snippet.update({
      where: { id },
      data: updates
    });

    res.json(updatedSnippet);
  } catch (error) {
    logger.error({ error, snippetId: id, userId: req.user!.userId }, 'Patch snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Run snippet
router.post('/:id/run', authenticate, async (req: Request, res: Response) => {
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

    // Queue execution
    await executeCode(snippet.code, snippet.language, execution.id, req.user!.userId, id);

    res.status(202).json({ executionId: execution.id });
  } catch (error) {
    logger.error({ error, snippetId: id, userId: req.user!.userId }, 'Run snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;