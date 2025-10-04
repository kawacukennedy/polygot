import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  author: string;
  createdAt: string;
}

const SnippetViewPage: React.FC = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSnippet(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !snippet) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Snippet not found</h1>
        <p className="text-muted">The snippet you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="bg-surface rounded-lg p-4 h-[420px]">
          <Editor
            height="100%"
            language={snippet.language}
            value={snippet.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
        </div>
        <div className="bg-surface rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          {/* Comments section will be implemented here */}
        </div>
      </div>
      <div className="w-96">
        <div className="bg-surface rounded-lg p-6 sticky top-20">
          <h2 className="text-xl font-bold mb-4">Metadata</h2>
          <div className="mb-2">
            <span className="font-bold">Title:</span> {snippet.title}
          </div>
          <div className="mb-2">
            <span className="font-bold">Author:</span> {snippet.author}
          </div>
          <div className="mb-2">
            <span className="font-bold">Language:</span> {snippet.language}
          </div>
          <div className="mb-2">
            <span className="font-bold">Created At:</span> {new Date(snippet.createdAt).toLocaleString()}
          </div>
          <button className="w-full mt-6 h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover">
            Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnippetViewPage;
