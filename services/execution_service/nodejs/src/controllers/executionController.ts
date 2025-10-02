import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { Pool } from 'pg';

interface AuthRequest extends Request {
  user?: any; // Assuming user ID is available from JWT payload
}

export const executeCodeController = async (req: AuthRequest, res: Response, io: Server, pool: Pool) => {
  const { language, code, snippet_id } = req.body;
  const userId = req.user.id; 

  if (!language || !code) {
    return res.status(400).json({ message: 'Language and code are required' });
  }

  console.log(`User ${userId} is executing ${language} code:\n${code}`);

  // Simulate execution time and result
  const executionTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
  const success = Math.random() > 0.2; // 80% success rate
  const status = success ? 'success' : 'failed';
  const output = success ? `Simulated output for ${language} code. Execution time: ${executionTime}ms` : null;
  const errorOutput = success ? null : `Simulated error during ${language} code execution.`;

  // Simulate sending real-time updates via WebSocket
  io.emit('execution_status', { userId, status: 'running', language, timestamp: new Date() });

  await new Promise(resolve => setTimeout(resolve, executionTime));

  try {
    const result = await pool.query(
      'INSERT INTO executions (snippet_id, user_id, language, code, status, output, error, duration_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
      [snippet_id, userId, language, code, status, output, errorOutput, executionTime]
    );
    const newExecution = result.rows[0];

    io.emit('execution_status', { userId, status, language, output, error: errorOutput, timestamp: new Date(), executionId: newExecution.id });

    if (success) {
      res.json({ output, status: 'success', executionId: newExecution.id });
    } else {
      res.status(400).json({ message: errorOutput, status: 'error', executionId: newExecution.id });
    }
  } catch (err) {
    console.error('Database error during execution save:', err);
    io.emit('execution_status', { userId, status: 'failed', language, error: 'Internal server error', timestamp: new Date() });
    res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
};

export const getRecentExecutionsController = async (req: Request, res: Response, pool: Pool) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await pool.query(
      'SELECT id, snippet_id, user_id, language, status, duration_ms, executed_at FROM executions ORDER BY executed_at DESC LIMIT $1;',
      [limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Database error fetching recent executions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};