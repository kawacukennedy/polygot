import { executeCode } from '../../services/execution';

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

const { exec } = require('child_process');

describe('Execution Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute Python code successfully', async () => {
    const mockExec = exec as jest.MockedFunction<typeof exec>;
    mockExec.mockImplementation((command, options, callback) => {
      if (callback) {
        callback(null, JSON.stringify({
          success: true,
          stdout: 'Hello World\n',
          stderr: '',
          execution_time: 150
        }), '');
      }
      return {} as any;
    });

    const result = await executeCode('print("Hello World")', 'PYTHON');

    expect(result.success).toBe(true);
    expect(result.stdout).toBe('Hello World\n');
    expect(result.executionTime).toBe(150);
  });

  it('should handle execution timeout', async () => {
    const mockExec = exec as jest.MockedFunction<typeof exec>;
    mockExec.mockImplementation(() => {
      throw new Error('Execution timeout');
    });

    const result = await executeCode('while True: pass', 'PYTHON');

    expect(result.success).toBe(false);
    expect(result.stderr).toContain('Execution timed out');
    expect(result.executionTime).toBe(30000);
  });
});