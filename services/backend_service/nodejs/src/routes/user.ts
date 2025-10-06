import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        theme: true,
        privacyLevel: true,
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

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, bio, theme, privacyLevel } = req.body;

    // Check if user is updating their own profile
    if (req.user!.userId !== id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: displayName, // Assuming displayName maps to username
        theme,
        privacyLevel
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;