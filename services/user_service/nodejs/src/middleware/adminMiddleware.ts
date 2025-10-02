
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;

  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
