
import { Request, Response } from 'express';
import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const getPopularLanguages = async (req: Request, res: Response) => {
  try {
    // This is a placeholder. In a real application, you would query the database
    // to get actual popular languages based on snippet creation or execution.
    const popularLanguages = [
      { language: 'python', count: 150 },
      { language: 'javascript', count: 120 },
      { language: 'java', count: 90 },
      { language: 'cpp', count: 70 },
      { language: 'go', count: 50 },
    ];
    res.json({ status: 'ok', data: popularLanguages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getTopUsers = async (req: Request, res: Response) => {
  const { language, period } = req.query;

  try {
    // This is a placeholder. In a real application, you would query the database
    // to get actual top users based on scores, snippets shared, etc.
    const topUsers = [
      { user_id: 'user1', username: 'Alice', score: 1500, language: 'python', snippets_shared: 25, rank: 1 },
      { user_id: 'user2', username: 'Bob', score: 1450, language: 'javascript', snippets_shared: 30, rank: 2 },
      { user_id: 'user3', username: 'Charlie', score: 1300, language: 'go', snippets_shared: 20, rank: 3 },
    ];
    res.json({ status: 'ok', data: topUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
