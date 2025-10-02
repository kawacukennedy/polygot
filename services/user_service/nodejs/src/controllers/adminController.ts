
import { Request, Response } from 'express';
import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const getAdminUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.per_page as string) || 50;
  const offset = (page - 1) * perPage;

  try {
    const result = await pool.query(
      'SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [perPage, offset]
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const promoteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET role = 'admin' WHERE id = $1', [id]);
    res.json({ status: 'ok', message: 'User promoted to admin' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET status = 'inactive' WHERE id = $1', [id]);
    res.json({ status: 'ok', message: 'User deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ status: 'ok', message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
