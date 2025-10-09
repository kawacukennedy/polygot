#!/usr/bin/env python3
import sys
import os
import subprocess
import tempfile
import signal
import time

def timeout_handler(signum, frame):
    raise TimeoutError("Execution timed out")

def execute_code(code):
    # Set up timeout
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(30)  # 30 seconds timeout

    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name

        # Execute the code
        start_time = time.time()
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            timeout=30
        )
        end_time = time.time()

        execution_time = int((end_time - start_time) * 1000)

        # Clean up
        os.unlink(temp_file)

        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'execution_time': execution_time
        }

    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Execution timed out after 30 seconds',
            'execution_time': 30000
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'execution_time': 0
        }
    finally:
        signal.alarm(0)  # Cancel the alarm

if __name__ == "__main__":
    # Read code from stdin
    code = sys.stdin.read()
    result = execute_code(code)

    # Output result as JSON
    import json
    print(json.dumps(result))