
import { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const executeCode = async (req: Request, res: Response) => {
  const { language, code, input, timeout_ms } = req.body;

  if (!language || !code) {
    return res.status(400).json({ status: 'error', message: 'Language and code are required' });
  }

  const executionId = Date.now().toString();
  const tempDir = path.join(__dirname, '..", 'temp', executionId);
  const filename = `main.${language === 'python' ? 'py' : 'txt'}`;
  const filepath = path.join(tempDir, filename);

  try {
    await fs.promises.mkdir(tempDir, { recursive: true });
    await fs.promises.writeFile(filepath, code);

    let command: string;
    let args: string[];

    if (language === 'python') {
      command = 'python';
      args = [filepath];
    } else {
      return res.status(400).json({ status: 'error', message: `Unsupported language: ${language}` });
    }

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(command, args, { cwd: tempDir });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      res.status(408).json({ status: 'error', message: 'Execution timed out' });
    }, timeout_ms || 5000);

    child.stdin.write(input || '');
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) return;

      if (code === 0) {
        res.json({ status: 'success', stdout, stderr });
      } else {
        res.status(400).json({ status: 'error', message: 'Execution failed', stdout, stderr, exitCode: code });
      }
      fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      if (timedOut) return;
      console.error('Child process error:', err);
      res.status(500).json({ status: 'error', message: 'Failed to execute code', error: err.message });
      fs.promises.rm(tempDir, { recursive: true, force: true });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
