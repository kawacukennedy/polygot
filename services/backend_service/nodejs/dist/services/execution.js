"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_1 = __importDefault(require("../utils/logger"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
const executeCode = async (code, language) => {
    const startTime = Date.now();
    logger_1.default.info({ language, codeLength: code.length }, 'Starting code execution');
    try {
        const image = languageImages[language];
        if (!image) {
            throw new Error(`Unsupported language: ${language}`);
        }
        // Escape single quotes in code for shell
        const escapedCode = code.replace(/'/g, "'\"'\"'");
        // Run Docker container with resource limits and pass code via stdin
        const command = `echo '${escapedCode}' | docker run --rm -i --memory=128m --cpus=0.5 --network=none --read-only --tmpfs /tmp --tmpfs /app -e HOME=/tmp ${image}`;
        // Execute with timeout
        const { stdout } = await Promise.race([
            execAsync(command, { timeout: 35000 }), // Slightly more than 30s for container startup
            new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timeout')), 35000))
        ]);
        // Parse JSON output from container
        const result = JSON.parse(stdout.trim());
        logger_1.default.info({ language, success: result.success, executionTime: result.execution_time }, 'Code execution completed');
        return {
            success: result.success,
            stdout: result.stdout,
            stderr: result.stderr,
            executionTime: result.execution_time
        };
    }
    catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error({ language, error: errorMessage, executionTime }, 'Code execution failed');
        if (errorMessage.includes('timeout')) {
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
            stderr: errorMessage,
            executionTime
        };
    }
};
exports.executeCode = executeCode;
