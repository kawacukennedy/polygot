import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

interface SearchResult {
  id: string;
  title: string;
  type: 'snippet' | 'user';
  description?: string;
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/search?q=${query}`);
        if (response.ok) {
          const data: SearchResult[] = await response.json();
          setSearchResults(data);
        } else {
          setError(true);
          addToast('Failed to fetch search results.', 'error');
        }
      } catch (err) {
        setError(true);
        addToast('Network error while fetching search results.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load search results.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      {searchResults.length === 0 ? (
        <p className="text-muted">No results found.</p>
      ) : (
        <div className="space-y-4">
          {searchResults.map((result) => (
            <div key={result.id} className="bg-surface rounded-lg p-4">
              <h2 className="text-xl font-bold">{result.title}</h2>
              <p className="text-muted">{result.type}</p>
              {result.description && <p>{result.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
