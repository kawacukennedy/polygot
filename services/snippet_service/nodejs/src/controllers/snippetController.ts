
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
  const { title, language, code, visibility } = req.body;
  const userId = (req as any).userId;

  try {
    const result = await pool.query(
      'INSERT INTO snippets (title, language, code, visibility, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, language, code, visibility, userId]
    );
    res.status(201).json(result.rows[0]);
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
