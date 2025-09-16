import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSnippet } from '../services/api';

const languages = ['python', 'javascript', 'cpp', 'go', 'java', 'php', 'rust', 'ruby'];

const CreateSnippetPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('session_token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const snippetData = { title, language, code, visibility };
      const response = await createSnippet(snippetData, token);

      if (response.status === 'error') {
        setError(response.message || 'Failed to create snippet.');
      } else {
        alert('Snippet created successfully!');
        navigate('/dashboard'); // Redirect to dashboard or snippets list
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating the snippet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create New Snippet</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-gray-700 text-sm font-bold mb-2">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="code" className="block text-gray-700 text-sm font-bold mb-2">Code:</label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="visibility" className="block text-gray-700 text-sm font-bold mb-2">Visibility:</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Snippet'}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
      </form>
    </div>
  );
};

export default CreateSnippetPage;
