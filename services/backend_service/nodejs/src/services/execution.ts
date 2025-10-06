import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number;
}

export const executeCode = async (code: string, language: string): Promise<ExecutionResult> => {
  const startTime = Date.now();

  try {
    let command: string;
    let fileName: string;
    let fileExtension: string;

    switch (language.toLowerCase()) {
      case 'python':
        fileName = 'script.py';
        fileExtension = '.py';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/script.py --memory=128m --cpus=0.5 --network=none python:3.12 python /app/script.py`;
        break;
      case 'javascript':
        fileName = 'script.js';
        fileExtension = '.js';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/script.js --memory=128m --cpus=0.5 --network=none node:20 node /app/script.js`;
        break;
      case 'java':
        fileName = 'Main.java';
        fileExtension = '.java';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/Main.java --memory=128m --cpus=0.5 --network=none openjdk:20 javac /app/Main.java && java -cp /app Main`;
        break;
      case 'cpp':
        fileName = 'main.cpp';
        fileExtension = '.cpp';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/main.cpp --memory=128m --cpus=0.5 --network=none gcc:12 g++ -o /app/main /app/main.cpp && /app/main`;
        break;
      case 'go':
        fileName = 'main.go';
        fileExtension = '.go';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/main.go --memory=128m --cpus=0.5 --network=none golang:1.21 go run /app/main.go`;
        break;
      case 'rust':
        fileName = 'main.rs';
        fileExtension = '.rs';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/main.rs --memory=128m --cpus=0.5 --network=none rust:1.78 rustc /app/main.rs -o /app/main && /app/main`;
        break;
      case 'ruby':
        fileName = 'script.rb';
        fileExtension = '.rb';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/script.rb --memory=128m --cpus=0.5 --network=none ruby:3.4 ruby /app/script.rb`;
        break;
      case 'php':
        fileName = 'script.php';
        fileExtension = '.php';
        command = `docker run --rm -v ${path.join(__dirname, fileName)}:/app/script.php --memory=128m --cpus=0.5 --network=none php:8.2 php /app/script.php`;
        break;
      default:
        throw new Error('Unsupported language');
    }

    // Write code to temp file
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    // Execute with timeout
    const { stdout, stderr } = await Promise.race([
      execAsync(command, { timeout: 30000 }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), 30000)
      )
    ]);

    // Clean up
    fs.unlinkSync(filePath);

    const executionTime = Date.now() - startTime;

    return {
      success: !stderr,
      stdout: stdout || '',
      stderr: stderr || '',
      executionTime
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    return {
      success: false,
      stdout: '',
      stderr: error.message,
      executionTime
    };
  }
};