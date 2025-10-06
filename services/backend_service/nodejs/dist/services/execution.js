"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const executeCode = async (code, language) => {
    const startTime = Date.now();
    try {
        let command;
        let fileName;
        let fileExtension;
        switch (language.toLowerCase()) {
            case 'python':
                fileName = 'script.py';
                fileExtension = '.py';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/script.py --memory=128m --cpus=0.5 --network=none python:3.12 python /app/script.py`;
                break;
            case 'javascript':
                fileName = 'script.js';
                fileExtension = '.js';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/script.js --memory=128m --cpus=0.5 --network=none node:20 node /app/script.js`;
                break;
            case 'java':
                fileName = 'Main.java';
                fileExtension = '.java';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/Main.java --memory=128m --cpus=0.5 --network=none openjdk:20 javac /app/Main.java && java -cp /app Main`;
                break;
            case 'cpp':
                fileName = 'main.cpp';
                fileExtension = '.cpp';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/main.cpp --memory=128m --cpus=0.5 --network=none gcc:12 g++ -o /app/main /app/main.cpp && /app/main`;
                break;
            case 'go':
                fileName = 'main.go';
                fileExtension = '.go';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/main.go --memory=128m --cpus=0.5 --network=none golang:1.21 go run /app/main.go`;
                break;
            case 'rust':
                fileName = 'main.rs';
                fileExtension = '.rs';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/main.rs --memory=128m --cpus=0.5 --network=none rust:1.78 rustc /app/main.rs -o /app/main && /app/main`;
                break;
            case 'ruby':
                fileName = 'script.rb';
                fileExtension = '.rb';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/script.rb --memory=128m --cpus=0.5 --network=none ruby:3.4 ruby /app/script.rb`;
                break;
            case 'php':
                fileName = 'script.php';
                fileExtension = '.php';
                command = `docker run --rm -v ${path_1.default.join(__dirname, fileName)}:/app/script.php --memory=128m --cpus=0.5 --network=none php:8.2 php /app/script.php`;
                break;
            default:
                throw new Error('Unsupported language');
        }
        // Write code to temp file
        const tempDir = path_1.default.join(__dirname, 'temp');
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir);
        }
        const filePath = path_1.default.join(tempDir, fileName);
        fs_1.default.writeFileSync(filePath, code);
        // Execute with timeout
        const { stdout, stderr } = await Promise.race([
            execAsync(command, { timeout: 30000 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timeout')), 30000))
        ]);
        // Clean up
        fs_1.default.unlinkSync(filePath);
        const executionTime = Date.now() - startTime;
        return {
            success: !stderr,
            stdout: stdout || '',
            stderr: stderr || '',
            executionTime
        };
    }
    catch (error) {
        const executionTime = Date.now() - startTime;
        return {
            success: false,
            stdout: '',
            stderr: error.message,
            executionTime
        };
    }
};
exports.executeCode = executeCode;
