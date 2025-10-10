import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Export user data (GDPR Article 15)
router.get('/export-data', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Gather all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        snippets: {
          include: {
            executions: true,
            comments: {
              include: {
                author: { select: { username: true } }
              }
            }
          }
        },
        executions: {
          include: {
            snippet: { select: { title: true } }
          }
        },
        comments: {
          include: {
            snippet: { select: { title: true } }
          }
        },
        notifications: true,
        auditLogs: true,
        leaderboard: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create export data structure
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        theme: user.theme,
        privacyLevel: user.privacyLevel,
        achievements: user.achievements,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      snippets: user.snippets.map(snippet => ({
        id: snippet.id,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        visibility: snippet.visibility,
        tags: snippet.tags,
        runsCount: snippet.runsCount,
        likesCount: snippet.likesCount,
        createdAt: snippet.createdAt,
        updatedAt: snippet.updatedAt,
        executions: snippet.executions.map(exec => ({
          id: exec.id,
          status: exec.status,
          stdout: exec.stdout,
          stderr: exec.stderr,
          executionTimeMs: exec.executionTimeMs,
          startedAt: exec.startedAt,
          finishedAt: exec.finishedAt
        })),
        comments: snippet.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author.username,
          createdAt: comment.createdAt
        }))
      })),
      executions: user.executions.map(exec => ({
        id: exec.id,
        snippetTitle: exec.snippet.title,
        status: exec.status,
        stdout: exec.stdout,
        stderr: exec.stderr,
        executionTimeMs: exec.executionTimeMs,
        startedAt: exec.startedAt,
        finishedAt: exec.finishedAt
      })),
      comments: user.comments.map(comment => ({
        id: comment.id,
        snippetTitle: comment.snippet.title,
        content: comment.content,
        createdAt: comment.createdAt
      })),
      notifications: user.notifications.map(notif => ({
        id: notif.id,
        message: notif.message,
        read: notif.read,
        createdAt: notif.createdAt
      })),
      auditLogs: user.auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        target: log.target,
        timestamp: log.timestamp
      })),
      leaderboard: user.leaderboard ? {
        score: user.leaderboard.score,
        snippetsShared: user.leaderboard.snippetsShared,
        achievementsUnlocked: user.leaderboard.achievementsUnlocked
      } : null
    };

    // Log data export for audit
    await prisma.auditLog.create({
      data: {
        adminId: userId, // Self-audit
        action: 'DATA_EXPORT',
        target: userId
      }
    });

    logger.info({ userId }, 'User data exported for GDPR compliance');

    // Return JSON data
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user.username}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Data export error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user account and all data (GDPR Article 17)
router.delete('/delete-account', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { confirmation } = req.body;

    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({ message: 'Invalid confirmation text' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log account deletion for audit
    await prisma.auditLog.create({
      data: {
        adminId: userId, // Self-deletion
        action: 'ACCOUNT_DELETION_REQUEST',
        target: userId
      }
    });

    // Delete avatar file if exists
    if (user.avatarUrl) {
      try {
        const filename = path.basename(user.avatarUrl);
        const filePath = path.join(__dirname, '../../uploads/avatars', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        logger.warn({ error: fileError, userId }, 'Failed to delete avatar file during account deletion');
      }
    }

    // Delete all user data in correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete executions (cascade from snippets and user)
      await tx.execution.deleteMany({
        where: { userId }
      });

      // Delete comments (cascade from snippets and user)
      await tx.comment.deleteMany({
        where: { authorId: userId }
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId }
      });

      // Delete leaderboard entry
      await tx.leaderboard.deleteMany({
        where: { userId }
      });

      // Delete audit logs
      await tx.auditLog.deleteMany({
        where: { adminId: userId }
      });

      // Delete snippets (this will cascade to executions and comments)
      await tx.snippet.deleteMany({
        where: { ownerId: userId }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    logger.info({ userId, username: user.username }, 'User account and all data deleted for GDPR compliance');

    res.json({ message: 'Account and all associated data have been permanently deleted' });
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Account deletion error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get data processing information (GDPR Article 13/14)
router.get('/data-processing-info', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Get user's data statistics
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        _count: {
          select: {
            snippets: true,
            executions: true,
            comments: true,
            notifications: true,
            auditLogs: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dataProcessingInfo = {
      accountCreated: user.createdAt,
      dataCategories: {
        profile: 'Basic account information (username, email, profile data)',
        snippets: `${user._count.snippets} code snippets created`,
        executions: `${user._count.executions} code executions performed`,
        comments: `${user._count.comments} comments posted`,
        notifications: `${user._count.notifications} notifications received`,
        auditLogs: `${user._count.auditLogs} audit log entries`
      },
      dataRetention: {
        activeAccount: 'Data retained while account is active',
        deletedAccount: 'Data permanently deleted upon account deletion',
        backups: 'Data may be retained in backups for up to 30 days after deletion'
      },
      dataSharing: {
        thirdParties: 'No data shared with third parties except for essential service operations',
        analytics: 'Anonymous usage analytics may be collected',
        legal: 'Data may be disclosed if required by law'
      },
      rights: {
        access: 'Right to access your personal data',
        rectification: 'Right to correct inaccurate data',
        erasure: 'Right to delete your account and data',
        portability: 'Right to data portability',
        restriction: 'Right to restrict processing',
        objection: 'Right to object to processing'
      }
    };

    res.json(dataProcessingInfo);
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Data processing info error');
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;