import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { executeCode } from '../services/execution';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Get users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
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
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Log audit
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'DELETE_USER',
        target: id
      }
    });

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get snippets
router.get('/snippets', authenticate, requireAdmin, async (req, res) => {
  try {
    const snippets = await prisma.snippet.findMany({
      include: {
        owner: { select: { username: true } }
      }
    });
    res.json(snippets);
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete snippet
router.delete('/snippets/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Log audit
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'DELETE_SNIPPET',
        target: id
      }
    });

    await prisma.snippet.delete({ where: { id } });
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    logger.error({ error, snippetId: id, adminId: req.user!.userId }, 'Delete snippet error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get executions
router.get('/executions', authenticate, requireAdmin, async (req, res) => {
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
  } catch (error) {
    logger.error({ error, adminId: req.user!.userId }, 'Get executions error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Re-run execution
router.post('/executions/:id/rerun', authenticate, requireAdmin, async (req, res) => {
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
        adminId: req.user!.userId,
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
    executeCode(execution.snippet.code, execution.snippet.language)
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
        logger.info({ executionId: newExecution.id, adminId: req.user!.userId }, 'Execution rerun completed');
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
        logger.error({ error, executionId: newExecution.id, adminId: req.user!.userId }, 'Execution rerun failed');
      });

    res.status(202).json({ executionId: newExecution.id });
  } catch (error) {
    logger.error({ error, executionId: id, adminId: req.user!.userId }, 'Rerun execution error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Kill execution (for running executions)
router.post('/executions/:id/kill', authenticate, requireAdmin, async (req, res) => {
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
        adminId: req.user!.userId,
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

    logger.info({ executionId: id, adminId: req.user!.userId }, 'Execution killed by admin');
    res.json({ message: 'Execution killed' });
  } catch (error) {
    logger.error({ error, executionId: id, adminId: req.user!.userId }, 'Kill execution error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;