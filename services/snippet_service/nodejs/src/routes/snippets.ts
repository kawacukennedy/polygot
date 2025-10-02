import { Router, Request, Response } from 'express';
import pool from '../db';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Create a new snippet
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, language, code, visibility } = req.body;
  const userId = req.user.id; // Assuming user ID is available from JWT payload

  if (!title || !language || !code || !visibility) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO snippets (user_id, title, language, code, visibility) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [userId, title, language, code, visibility]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all snippets for the authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM snippets WHERE user_id = $1 ORDER BY created_at DESC;', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single snippet by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT * FROM snippets WHERE id = $1 AND user_id = $2;', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a snippet by ID
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, language, code, visibility } = req.body;
  const userId = req.user.id;

  if (!title || !language || !code || !visibility) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE snippets SET title = $1, language = $2, code = $3, visibility = $4 WHERE id = $5 AND user_id = $6 RETURNING *;',
      [title, language, code, visibility, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a snippet by ID
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query('DELETE FROM snippets WHERE id = $1 AND user_id = $2 RETURNING *;', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;