
const EXECUTION_SERVICE_URL = process.env.EXECUTION_SERVICE_URL || 'http://localhost:8082/api/v1/execute';

export async function executeCodeInSandbox(language: string, code: string, input: string, timeout_ms: number): Promise<any> {
  const response = await fetch(EXECUTION_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language, code, input, timeout_ms }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { status: 'error', message: data.message || 'Failed to execute code in sandbox', error_code: data.error_code };
  }

  return data;
}
