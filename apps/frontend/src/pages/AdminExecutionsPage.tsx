
import React, { useEffect, useState } from 'react';
import { getExecutionsAdmin, rerunExecutionAdmin, killExecutionAdmin } from '../services/api';

interface Execution {
  id: string;
  snippet_id: string;
  status: string;
  runtime: string;
  duration: string;
  executed_at: string;
}

const AdminExecutionsPage: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  useEffect(() => {
    const getExecutions = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in as an administrator.');
        setLoading(false);
        return;
      }

      try {
        // Assuming fetchExecutions is implemented in ../services/api.ts
        const executionsData = await getExecutionsAdmin() as any;
        setExecutions(executionsData);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching executions.');
      } finally {
        setLoading(false);
      }
    };

    getExecutions();
  }, [page, perPage]);

  const handleReRun = async (executionId: string) => {
    try {
      await rerunExecutionAdmin(executionId);
      // Refresh the executions list
      const executionsData = await getExecutionsAdmin();
      setExecutions(executionsData);
      alert('Execution re-run initiated successfully');
    } catch (error: any) {
      alert(`Failed to re-run execution: ${error.message}`);
    }
  };

  const handleKill = async (executionId: string) => {
    try {
      await killExecutionAdmin(executionId);
      // Refresh the executions list
      const executionsData = await getExecutionsAdmin();
      setExecutions(executionsData);
      alert('Execution killed successfully');
    } catch (error: any) {
      alert(`Failed to kill execution: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-[var(--color-text-secondary)]">Loading executions...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">Admin Execution Management</h1>
      <div className="bg-[var(--color-background)] shadow-md rounded-lg p-6">
        {executions.length === 0 ? (
          <p className="text-[var(--color-text-secondary)]">No executions found.</p>
        ) : (
          <table className="min-w-full divide-y divide-[var(--color-text-secondary)]/30">
            <thead className="bg-[var(--color-background)]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Snippet ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Runtime</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Executed At</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-background)] divide-y divide-[var(--color-text-secondary)]/20">
              {executions.map((execution) => (
                <tr key={execution.id} className="text-[var(--color-text-primary)]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{execution.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{execution.snippet_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{execution.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{execution.runtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{execution.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(execution.executed_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleReRun(execution.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Re-run</button>
                    <button onClick={() => handleKill(execution.id)} className="text-red-600 hover:text-red-900">Kill</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Basic Pagination Controls */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-[var(--color-text-secondary)]/10 text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/20"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">Page {page}</span>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading || executions.length < perPage}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-[var(--color-text-secondary)]/10 text-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)]/20"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExecutionsPage;
