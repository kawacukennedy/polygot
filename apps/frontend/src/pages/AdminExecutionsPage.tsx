
import React, { useEffect, useState } from 'react';
// import { fetchExecutions } from '../services/api'; // Assuming an API function for fetching executions

interface Execution {
  id: string;
  snippet_id: string;
  status: string;
  runtime: string;
  duration: string;
  executed_at: string;
}

// Mock data for executions
const mockExecutions: Execution[] = [
  { id: 'exec1', snippet_id: 'snip1', status: 'success', runtime: 'python', duration: '120ms', executed_at: '2025-10-02T10:00:00Z' },
  { id: 'exec2', snippet_id: 'snip2', status: 'failed', runtime: 'javascript', duration: '50ms', executed_at: '2025-10-02T10:05:00Z' },
  { id: 'exec3', snippet_id: 'snip3', status: 'running', runtime: 'cpp', duration: '-', executed_at: '2025-10-02T10:10:00Z' },
];

const AdminExecutionsPage: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>(mockExecutions);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  // useEffect(() => {
  //   const getExecutions = async () => {
  //     const token = localStorage.getItem('session_token');
  //     if (!token) {
  //       setError('Authentication token not found. Please log in as an administrator.');
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const executionsData = await fetchExecutions(token, page, perPage);
  //       if (executionsData.status === 'error') {
  //         setError(executionsData.message || 'Failed to fetch executions.');
  //       } else {
  //         setExecutions(executionsData);
  //       }
  //     } catch (err: any) {
  //       setError(err.message || 'An unexpected error occurred while fetching executions.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getExecutions();
  // }, [page, perPage]);

  const handleReRun = (executionId: string) => {
    console.log(`Re-run execution ${executionId}`);
    // TODO: Implement API call to re-run execution
  };

  const handleKill = (executionId: string) => {
    console.log(`Kill execution ${executionId}`);
    // TODO: Implement API call to kill execution
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading executions...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Execution Management</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {executions.length === 0 ? (
          <p>No executions found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snippet ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed At</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{execution.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.snippet_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.runtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(execution.executed_at).toLocaleString()}</td>
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
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading || executions.length < perPage}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExecutionsPage;
