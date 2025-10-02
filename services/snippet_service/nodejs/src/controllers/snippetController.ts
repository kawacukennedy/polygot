
import { Request, Response } from 'express';
import { Pool } from 'pg';
import config from '../config';
import { executeCodeInSandbox } from '../services/executionService';

const pool = new Pool({
  host: config.db.host,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const createSnippet = async (req: Request, res: Response) => {
  const { title, language, code, visibility, tags } = req.body;
  const userId = (req as any).userId;

  try {
    const result = await pool.query(
      'INSERT INTO snippets (title, language, code, visibility, author_id, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, language, code, visibility, userId, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const fetchSnippets = async (req: Request, res: Response) => {
  const { language, visibility, search, page = 1, pageSize = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let query = 'SELECT id, title, language, visibility, created_at, author_id FROM snippets WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (language) {
    query += ` AND language = $${paramIndex++}`;
    queryParams.push(language);
  }
  if (visibility) {
    query += ` AND visibility = $${paramIndex++}`;
    queryParams.push(visibility);
  }
  if (search) {
    query += ` AND title ILIKE $${paramIndex++}`;
    queryParams.push(`%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(pageSize);
  queryParams.push(offset);

  try {
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const fetchUserSnippets = async (req: Request, res: Response) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    const result = await pool.query(
      'SELECT id, title, language, visibility, created_at FROM snippets WHERE author_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateSnippet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, code, visibility, tags } = req.body;
  const userId = (req as any).userId;

  try {
    const snippetResult = await pool.query('SELECT author_id FROM snippets WHERE id = $1', [id]);
    const snippet = snippetResult.rows[0];

    if (!snippet) {
      return res.status(404).json({ status: 'error', message: 'Snippet not found' });
    }

    if (snippet.author_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: You are not the author of this snippet' });
    }

    const result = await pool.query(
      'UPDATE snippets SET title = $1, code = $2, visibility = $3, tags = $4 WHERE id = $5 RETURNING *',
      [title, code, visibility, tags, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const snippetResult = await pool.query('SELECT author_id FROM snippets WHERE id = $1', [id]);
    const snippet = snippetResult.rows[0];

    if (!snippet) {
      return res.status(404).json({ status: 'error', message: 'Snippet not found' });
    }

    // Check if the user is the author or an admin (assuming admin role check is done elsewhere or here)
    // For simplicity, only author can delete for now. Admin deletion will be handled in admin routes.
    if (snippet.author_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden: You are not the author of this snippet' });
    }

    await pool.query('DELETE FROM snippets WHERE id = $1', [id]);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const flagSnippet = async (req: Request, res: Response) => {
  const { id } = req.params;
  // In a real application, you would also check if the flagging user is an admin
  // For now, we'll just update the flagged status
  try {
    const result = await pool.query(
      'UPDATE snippets SET flagged = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Snippet not found' });
    }
    res.json({ status: 'ok', message: 'Snippet flagged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const runSnippet = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { input, timeout_ms } = req.body;

  try {
    const snippetResult = await pool.query('SELECT code, language FROM snippets WHERE id = $1', [id]);
    const snippet = snippetResult.rows[0];

    if (!snippet) {
      return res.status(404).json({ status: 'error', message: 'Snippet not found' });
    }

    const executionResult = await executeCodeInSandbox(snippet.language, snippet.code, input, timeout_ms);
    res.json(executionResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
