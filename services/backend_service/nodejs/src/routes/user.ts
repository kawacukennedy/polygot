import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        privacyLevel: true,
        achievements: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            snippets: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      display_name: user.displayName,
      bio: user.bio,
      avatar_url: user.avatarUrl,
      theme: user.theme,
      privacy_level: user.privacyLevel,
      achievements: user.achievements,
      snippets_count: user._count.snippets,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, bio, theme, privacy_level } = req.body;

    // Check if user is updating their own profile
    if (req.user!.userId !== id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.user.update({
      where: { id },
      data: {
        displayName: display_name,
        bio,
        theme,
        privacyLevel: privacy_level
      }
    });

    res.status(200).json({ message: 'updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;