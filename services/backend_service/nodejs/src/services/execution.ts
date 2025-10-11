import { exec } from 'child_process';
import { promisify } from 'util';
import { Queue, Worker } from 'bullmq';
import logger from '../utils/logger';
import { trackSnippetRun } from './analytics';
import { awardPoints } from './gamification';

const execAsync = promisify(exec);

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number;
}

const executionQueue = new Queue('code-execution', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

const worker = new Worker('code-execution', async (job) => {
  const { code, language, executionId, timeoutMs, userId, snippetId } = job.data;
  const result = await executeInContainer(code, language, timeoutMs);
  // Update DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  await prisma.execution.update({
    where: { id: executionId },
    data: {
      status: result.success ? 'SUCCESS' : 'ERROR',
      stdout: result.stdout,
      stderr: result.stderr,
      executionTimeMs: result.executionTime,
      finishedAt: new Date()
    }
  });

  // Track analytics
  trackSnippetRun(userId, snippetId, result.executionTime, result.success ? 'success' : 'error', 'worker');

  // Award points
  await awardPoints(userId, 'snippet_run');

  return result;
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

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

const executeInContainer = async (code: string, language: string, timeoutMs: number = 30000): Promise<ExecutionResult> => {
  const startTime = Date.now();
  logger.info({ language, codeLength: code.length }, 'Starting code execution');

  try {
    const image = languageImages[language as keyof typeof languageImages];
    if (!image) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Escape single quotes in code for shell
    const escapedCode = code.replace(/'/g, "'\"'\"'");

    // Run Docker container with resource limits and pass code via stdin
    const command = `echo '${escapedCode}' | docker run --rm -i --memory=128m --cpus=0.5 --network=none --read-only --tmpfs /tmp --tmpfs /app -e HOME=/tmp ${image}`;

    // Execute with timeout
    const { stdout } = await Promise.race([
      execAsync(command, { timeout: timeoutMs + 5000 }), // Slightly more for container startup
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeoutMs + 5000)
      )
    ]);

    // Parse JSON output from container
    const result = JSON.parse(stdout.trim());

    const executionTime = Date.now() - startTime;
    logger.info({ language, executionTime }, 'Code execution completed');

    return {
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime
    };
  } catch (error: any) {
    logger.error({ error, language }, 'Code execution failed');
    return {
      success: false,
      stdout: '',
      stderr: error.message,
      executionTime: Date.now() - startTime
    };
  }
};

export const executeCode = async (code: string, language: string, executionId: string, userId: string, snippetId: string, timeoutMs: number = 30000): Promise<void> => {
  await executionQueue.add('execute', { code, language, executionId, userId, snippetId, timeoutMs });
};