import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { language, timeFrame } = req.query;

    let where: any = {};
    if (language) {
      where.snippets = {
        some: {
          language: language as string
        }
      };
    }

    // For time frame, we'd need to filter by createdAt, but simplified here
    const leaderboard = await prisma.leaderboard.findMany({
      where,
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 100
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;