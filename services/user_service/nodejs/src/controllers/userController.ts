
import { Request, Response } from 'express';
import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT id, email, name, bio, avatar_url FROM users WHERE id = $1', [id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, bio = $2 WHERE id = $3 RETURNING id, email, name, bio, avatar_url',
      [name, bio, id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
