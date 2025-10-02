
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSnippets } from '../services/api';

const SnippetsPage = () => {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const loadSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('session_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const data = await fetchSnippets(token, languageFilter, visibilityFilter, searchTerm, page);
      if (data.status === 'error') {
        setError(data.message);
      } else {
        setSnippets(prevSnippets => [...prevSnippets, ...data]);
        setHasMore(data.length > 0);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [languageFilter, visibilityFilter, searchTerm, page]);

  useEffect(() => {
    setSnippets([]);
    setPage(1);
    setHasMore(true);
  }, [languageFilter, visibilityFilter, searchTerm]);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight && hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleEdit = (snippetId: string) => {
    // Placeholder for edit logic
    console.log(`Edit snippet with ID: ${snippetId}`);
    navigate(`/snippets/edit/${snippetId}`); // Assuming an edit route
  };

  const handleDelete = async (snippetId: string) => {
    // Placeholder for delete logic
    if (window.confirm(`Are you sure you want to delete snippet ${snippetId}?`)) {
      console.log(`Delete snippet with ID: ${snippetId}`);
      // Call API to delete snippet
      // await deleteSnippet(snippetId, token);
      // After successful deletion, refresh the list or remove the snippet from state
      setSnippets(prevSnippets => prevSnippets.filter(snippet => snippet.id !== snippetId));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Snippets</h1>
      <div className="mb-4 flex space-x-4">
        <input 
          type="text" 
          placeholder="Search title..." 
          className="p-2 border rounded-md w-1/3 bg-light-background dark:bg-dark-background" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border rounded-md bg-light-background dark:bg-dark-background"
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
        >
          <option value="">All Languages</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="php">PHP</option>
          <option value="rust">Rust</option>
          <option value="ruby">Ruby</option>
        </select>
        <select 
          className="p-2 border rounded-md bg-light-background dark:bg-dark-background"
          value={visibilityFilter}
          onChange={e => setVisibilityFilter(e.target.value)}
        >
          <option value="">All Visibilities</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {loading && snippets.length === 0 && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && snippets.length === 0 ? (
        <div className="text-center py-8 text-light-text_secondary dark:text-dark-text_secondary">
          <span className="text-2xl">📄</span>
          <p>No snippets yet. Create one!</p>
        </div>
      ) : (
        <div className="bg-light-background dark:bg-dark-background shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-light-text_secondary dark:text-dark-text_secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {snippets.map(snippet => (
                <tr key={snippet.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{snippet.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{snippet.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{snippet.visibility}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(snippet.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(snippet.id)} className="text-light-accent dark:text-dark-accent hover:underline mr-4">Edit</button>
                    <button onClick={() => handleDelete(snippet.id)} className="text-red-500 hover:underline mr-4">Delete</button>
                    <Link to={`/snippets/run/${snippet.id}`} className="text-green-500 hover:underline">Run</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-center py-4">Loading more snippets...</p>}
          {!hasMore && <p className="text-center py-4 text-light-text_secondary dark:text-dark-text_secondary">No more snippets to load.</p>}
        </div>
      )}
    </div>
  );
};

export default SnippetsPage;
