
import React, { useEffect, useState } from 'react';
import { fetchExecutions } from '../services/api'; // Assuming an API function for fetching executions

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
        const executionsData = await fetchExecutions(token, page, perPage);
        if (executionsData.status === 'error') {
          setError(executionsData.message || 'Failed to fetch executions.');
        } else {
          setExecutions(executionsData);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching executions.');
      } finally {
        setLoading(false);
      }
    };

    getExecutions();
  }, [page, perPage]);

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
      <div className="bg-light-background dark:bg-dark-background shadow-md rounded-lg p-6">
        {executions.length === 0 ? (
          <p className="text-light-text_secondary dark:text-dark-text_secondary">No executions found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Snippet ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Runtime</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Executed At</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-light-background dark:bg-dark-background divide-y divide-gray-200 dark:divide-gray-700">
              {executions.map((execution) => (
                <tr key={execution.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text_primary dark:text-dark-text_primary">{execution.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text_primary dark:text-dark-text_primary">{execution.snippet_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text_primary dark:text-dark-text_primary">{execution.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text_primary dark:text-dark-text_primary">{execution.runtime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text_primary dark:text-dark-text_primary">{execution.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text_primary dark:text-dark-text_primary">{new Date(execution.executed_at).toLocaleString()}</td>
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
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-light-text_primary dark:text-dark-text_primary hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-sm text-light-text_secondary dark:text-dark-text_secondary">Page {page}</span>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading || executions.length < perPage}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-light-text_primary dark:text-dark-text_primary hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExecutionsPage;
