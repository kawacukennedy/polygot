import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AuthRequest extends Request {
  user?: any; // Assuming user ID is available from JWT payload
}

const languageImages = {
  PYTHON: 'polyglot-python-runner',
  JAVASCRIPT: 'polyglot-nodejs-runner',
  JAVA: 'polyglot-java-runner',
  CPP: 'polyglot-cpp-runner',
  GO: 'polyglot-go-runner',
  RUST: 'polyglot-rust-runner',
  RUBY: 'polyglot-ruby-runner',
  PHP: 'polyglot-php-runner'
};

async function executeInSandbox(language: string, code: string): Promise<{ success: boolean; stdout: string; stderr: string; executionTime: number }> {
  const image = languageImages[language as keyof typeof languageImages];
  if (!image) {
    throw new Error(`Unsupported language: ${language}`);
  }

  try {
    // Run Docker container with resource limits
    const { stdout, stderr } = await execAsync(
      `echo '${code.replace(/'/g, "'\"'\"'")}' | docker run --rm -i --memory=128m --cpus=0.5 --network=none --read-only --tmpfs /tmp --tmpfs /app -e HOME=/tmp ${image}`,
      { timeout: 35000 } // Slightly more than 30s for container startup
    );

    // Parse JSON output from container
    const result = JSON.parse(stdout.trim());
    return {
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime: result.execution_time
    };
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        stdout: '',
        stderr: 'Execution timed out',
        executionTime: 30000
      };
    }
    throw error;
  }
}

export const executeCodeController = async (req: AuthRequest, res: Response, io: Server, pool: Pool) => {
  const { language, code, snippet_id } = req.body;
  const userId = req.user.id;

  if (!language || !code) {
    return res.status(400).json({ message: 'Language and code are required' });
  }

  console.log(`User ${userId} is executing ${language} code`);

  // Send running status
  io.emit('execution_status', { userId, status: 'running', language, timestamp: new Date() });

  try {
    // Execute code in sandbox
    const execResult = await executeInSandbox(language, code);

    // Map to status
    let status: string;
    if (execResult.success) {
      status = 'success';
    } else if (execResult.stderr.includes('timed out')) {
      status = 'timeout';
    } else {
      status = 'error';
    }

    // Save to database
    const result = await pool.query(
      'INSERT INTO executions (snippet_id, user_id, language, code, status, output, error, duration_ms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
      [snippet_id, userId, language, code, status, execResult.stdout, execResult.stderr, execResult.executionTime]
    );
    const newExecution = result.rows[0];

    // Send completion status
    io.emit('execution_status', {
      userId,
      status,
      language,
      output: execResult.stdout,
      error: execResult.stderr,
      timestamp: new Date(),
      executionId: newExecution.id
    });

    if (execResult.success) {
      res.json({ output: execResult.stdout, status: 'success', executionId: newExecution.id });
    } else {
      res.status(400).json({ message: execResult.stderr, status: 'error', executionId: newExecution.id });
    }
  } catch (err) {
    console.error('Execution error:', err);
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