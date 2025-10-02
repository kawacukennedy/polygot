
import React, { useEffect, useState } from 'react';
import { fetchSnippets } from '../services/api';

interface Snippet {
  id: string;
  title: string;
  language: string;
  visibility: string;
  created_at: string;
}

const AdminSnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  useEffect(() => {
    const getSnippets = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Authentication token not found. Please log in as an administrator.');
        setLoading(false);
        return;
      }

      try {
        const snippetsData = await fetchSnippets(token, undefined, undefined, undefined, page, perPage);
        if (snippetsData.status === 'error') {
          setError(snippetsData.message || 'Failed to fetch snippets.');
        } else {
          setSnippets(snippetsData);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching snippets.');
      } finally {
        setLoading(false);
      }
    };

    getSnippets();
  }, [page, perPage]);

  const handleDeleteSnippet = (snippetId: string) => {
    console.log(`Delete snippet ${snippetId}`);
    // TODO: Implement API call to delete snippet
  };

  const handleFlagSnippet = (snippetId: string) => {
    console.log(`Flag snippet ${snippetId}`);
    // TODO: Implement API call to flag snippet
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading snippets...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Snippet Management</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {snippets.length === 0 ? (
          <p>No snippets found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {snippets.map((snippet) => (
                <tr key={snippet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{snippet.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.visibility}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(snippet.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteSnippet(snippet.id)} className="text-red-600 hover:text-red-900 mr-4">Delete</button>
                    <button onClick={() => handleFlagSnippet(snippet.id)} className="text-yellow-600 hover:text-yellow-900">Flag</button>
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
            disabled={loading || snippets.length < perPage}
            className="px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSnippetsPage;
