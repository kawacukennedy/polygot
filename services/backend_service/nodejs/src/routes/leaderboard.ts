import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const router = express.Router();
const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { language } = req.query;
    const cacheKey = `leaderboard:${language || 'all'}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const where: Record<string, unknown> = {};
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

    await redisClient.setEx(cacheKey, 60, JSON.stringify(leaderboard));
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;