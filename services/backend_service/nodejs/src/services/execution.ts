import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number;
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

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const startTime = Date.now();

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
    const { stdout, stderr } = await Promise.race([
      execAsync(command, { timeout: 35000 }), // Slightly more than 30s for container startup
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), 35000)
      )
    ]);

    // Parse JSON output from container
    const result = JSON.parse(stdout.trim());

    return {
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      executionTime: result.execution_time
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    if (error.message.includes('timeout')) {
      return {
        success: false,
        stdout: '',
        stderr: 'Execution timed out after 30 seconds',
        executionTime: 30000
      };
    }
    return {
      success: false,
      stdout: '',
      stderr: error.message,
      executionTime
    };
  }
};