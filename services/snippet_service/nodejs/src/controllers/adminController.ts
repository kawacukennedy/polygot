import { Request, Response } from 'express';
import pool from '../db';

export const getAllSnippetsAdmin = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, user_id, title, language, visibility, created_at FROM snippets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSnippetAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM snippets WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const flagSnippetAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  // In a real application, this would update a 'flagged' status or send a notification
  console.log(`Snippet ${id} flagged by admin.`);
  try {
    // Example: Update a 'flagged' column in the database
    const result = await pool.query('UPDATE snippets SET is_flagged = TRUE WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Snippet not found' });
    }
    res.json({ message: 'Snippet flagged successfully', snippet: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
