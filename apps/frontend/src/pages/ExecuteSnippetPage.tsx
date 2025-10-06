import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { executeCode } from '../services/api';

const ExecuteSnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // snippetId
  const [input, setInput] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{ execution_id: string; status: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setExecutionResult(null);

    if (!id) {
      setError('Snippet ID is missing.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('session_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await executeCode('javascript', input); // Placeholder

      if (response.status === 'error') {
        setError(response.message || 'Failed to execute snippet.');
      } else {
        setExecutionResult(response);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while executing the snippet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Execute Snippet: {id}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="input" className="block text-gray-700 text-sm font-bold mb-2">Input (optional):</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
          ></textarea>
        </div>
        <div>
          <label htmlFor="timeoutMs" className="block text-gray-700 text-sm font-bold mb-2">Timeout (ms, 1000-5000):</label>
          <input
            type="number"
            id="timeoutMs"
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(Math.max(1000, Math.min(5000, Number(e.target.value))))}
            min={1000}
            max={5000}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Executing...' : 'Execute Snippet'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
        {executionResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold">Execution Queued</h3>
            <p>Execution ID: {executionResult.execution_id}</p>
            <p>Status: {executionResult.status}</p>
            <p className="text-sm text-gray-600">You can check the status of this execution later.</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ExecuteSnippetPage;
