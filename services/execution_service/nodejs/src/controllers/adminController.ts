import { Request, Response } from 'express';
import { Pool } from 'pg';
import { Server } from 'socket.io';

interface AuthRequest extends Request {
  user?: any;
}

export const getAllExecutionsAdmin = async (req: Request, res: Response, pool: Pool) => {
  try {
    const result = await pool.query('SELECT id, snippet_id, user_id, language, status, output, error, duration_ms, executed_at FROM executions ORDER BY executed_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rerunExecutionAdmin = async (req: AuthRequest, res: Response, io: Server, pool: Pool) => {
  const { id } = req.params;
  // In a real application, this would re-queue the execution
  console.log(`Admin: Re-running execution ${id}`);
  try {
    const result = await pool.query('SELECT code, language, snippet_id, user_id FROM executions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Execution not found' });
    }
    const { code, language, snippet_id, user_id } = result.rows[0];

    // Simulate execution
    const executionTime = Math.floor(Math.random() * 500) + 50;
    const success = Math.random() > 0.2;
    const status = success ? 'success' : 'failed';
    const output = success ? `Simulated re-run output for ${language} code. Execution time: ${executionTime}ms` : null;
    const errorOutput = success ? null : `Simulated error during re-run of ${language} code execution.`;

    io.emit('execution_status', { userId: user_id, status: 'running', language, timestamp: new Date(), message: `Re-running execution ${id}` });

    await new Promise(resolve => setTimeout(resolve, executionTime));

    const updateResult = await pool.query(
      'UPDATE executions SET status = $1, output = $2, error = $3, duration_ms = $4, executed_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *;',
      [status, output, errorOutput, executionTime, id]
    );

    io.emit('execution_status', { userId: user_id, status, language, output, error: errorOutput, timestamp: new Date(), executionId: id });

    if (success) {
      res.json({ message: 'Execution re-run successfully', execution: updateResult.rows[0] });
    } else {
      res.status(400).json({ message: errorOutput, execution: updateResult.rows[0] });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const killExecutionAdmin = async (req: AuthRequest, res: Response, io: Server, pool: Pool) => {
  const { id } = req.params;
  // In a real application, this would send a signal to the execution worker
  console.log(`Admin: Killing execution ${id}`);
  try {
    const result = await pool.query('UPDATE executions SET status = 'killed', error = 'Execution killed by admin' WHERE id = $1 RETURNING *;', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Execution not found' });
    }
    const killedExecution = result.rows[0];
    io.emit('execution_status', { userId: killedExecution.user_id, status: 'killed', language: killedExecution.language, error: 'Execution killed by admin', timestamp: new Date(), executionId: id });
    res.json({ message: 'Execution killed successfully', execution: killedExecution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
