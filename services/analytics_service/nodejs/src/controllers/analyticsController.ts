
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
    const result = await pool.query(
      'SELECT language, COUNT(*) as count FROM snippets GROUP BY language ORDER BY count DESC LIMIT 5'
    );
    res.json({ status: 'ok', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getTopUsers = async (req: Request, res: Response) => {
  const { language, period } = req.query;

  let query = `
    SELECT
      u.id as user_id,
      u.name as username,
      COUNT(s.id) as snippets_shared,
      SUM(CASE WHEN s.language = $1 THEN 1 ELSE 0 END) as language_snippets_shared,
      (COUNT(s.id) * 10 + SUM(CASE WHEN s.language = $1 THEN 5 ELSE 0 END)) as score
    FROM
      users u
    LEFT JOIN
      snippets s ON u.id = s.author_id
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Push a placeholder for the language parameter for scoring
  queryParams.push(language || null);

  const whereClauses: string[] = [];

  if (language) {
    whereClauses.push(`s.language = $${paramIndex++}`);
    queryParams.push(language);
  }

  if (period) {
    let dateFilter = '';
    const now = new Date();
    if (period === 'daily') {
      dateFilter = `s.created_at >= NOW() - INTERVAL '1 day'`;
    } else if (period === 'weekly') {
      dateFilter = `s.created_at >= NOW() - INTERVAL '7 days'`;
    } else if (period === 'monthly') {
      dateFilter = `s.created_at >= NOW() - INTERVAL '1 month'`;
    }
    if (dateFilter) {
      whereClauses.push(dateFilter);
    }
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += `
    GROUP BY
      u.id, u.name
    ORDER BY
      score DESC
    LIMIT 10
  `;

  try {
    const result = await pool.query(query, queryParams);
    res.json({ status: 'ok', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
