#!/usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executeCode(code) {
    return new Promise((resolve) => {
        // Create temporary file
        const tempFile = path.join('/tmp', `code_${Date.now()}.js`);
        fs.writeFileSync(tempFile, code);

        const startTime = Date.now();

        // Execute with timeout
        const child = exec(`node ${tempFile}`, { timeout: 30000 }, (error, stdout, stderr) => {
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Clean up
            try {
                fs.unlinkSync(tempFile);
            } catch (e) {
                // Ignore cleanup errors
            }

            if (error && error.code === 'ETIMEDOUT') {
                resolve({
                    success: false,
                    stdout: '',
                    stderr: 'Execution timed out after 30 seconds',
                    execution_time: 30000
                });
            } else {
                resolve({
                    success: !error,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    execution_time: executionTime
                });
            }
        });
    });
}

// Read code from stdin
let code = '';
process.stdin.on('data', chunk => {
    code += chunk;
});

process.stdin.on('end', async () => {
    const result = await executeCode(code);
    console.log(JSON.stringify(result));
});