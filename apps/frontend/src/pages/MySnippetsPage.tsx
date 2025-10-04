import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface Snippet {
  id: string;
  title: string;
  language: string;
  createdAt: string;
}

const MySnippetsPage: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchMySnippets = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/my-snippets');
      if (response.ok) {
        const data: Snippet[] = await response.json();
        setSnippets(data);
      } else {
        setError(true);
        addToast('Failed to load your snippets.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching your snippets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySnippets();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load your snippets.</p>
        <button
          onClick={fetchMySnippets}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Snippets</h1>
      {snippets.length === 0 ? (
        <p className="text-muted">You haven't created any snippets yet.</p>
      ) : (
        <div className="space-y-4">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="bg-surface rounded-lg p-4 flex justify-between items-center">
              <div>
                <Link to={`/snippets/${snippet.id}`} className="text-xl font-bold text-primary hover:underline">
                  {snippet.title}
                </Link>
                <p className="text-muted text-sm">{snippet.language} - {new Date(snippet.createdAt).toLocaleDateString()}</p>
              </div>
              <Link to={`/snippets/${snippet.id}/edit`} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySnippetsPage;
