import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import CommentsSection from '../components/CommentsSection';
import { useToast } from '../contexts/ToastContext';
import { getSnippetById } from '../services/api';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  owner: {
    username: string;
  };
  createdAt: string;
}

const SnippetViewPage: React.FC = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { addToast } = useToast();

  const handleCopyCode = async () => {
    if (snippet) {
      await navigator.clipboard.writeText(snippet.code);
      addToast('Copied!', 'success');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    // Same as editor run flow
    try {
      const response = await fetch(`/api/snippets/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: snippet?.code, language: snippet?.language, input: '', timeout_ms: 30000 }),
      });
      // Handle response as in editor
      if (response.status === 202) {
        // Polling logic
      } else if (response.status === 200) {
        const data = await response.json();
        addToast('Output: ' + (data.stdout || data.stderr), 'info');
      }
    } catch (error) {
      addToast('Error running snippet', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const fetchSnippet = async () => {
    if (!id) return;

    setLoading(true);
    setError(false);
    try {
      const snippetData = await getSnippetById(id);
      setSnippet(snippetData);
    } catch (err) {
      setError(true);
      addToast('Failed to load snippet.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippet();
  }, [id]);



  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1">
          <LoadingSkeleton height="420px" />
        </div>
        <div style={{ width: '360px' }}>
          <LoadingSkeleton height="200px" />
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Snippet not found</h1>
        <p className="text-muted">The snippet you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="bg-surface rounded-lg p-4 relative" style={{ height: '420px' }}>
          <button
            onClick={handleCopyCode}
            className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm"
          >
            Copy code
          </button>
          <Editor
            height="100%"
            language={snippet.language}
            value={snippet.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              lineNumbers: 'on',
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
        </div>
        <div className="mt-6">
          <CommentsSection snippetId={id!} />
        </div>
      </div>
      <div style={{ width: '360px' }}>
        <div className="bg-surface rounded-lg p-6 sticky top-20">
          <h2 className="text-xl font-bold mb-4">Metadata</h2>
          <div className="mb-2">
            <span className="font-bold">Title:</span> {snippet.title}
          </div>
          <div className="mb-2">
            <span className="font-bold">Author:</span> <Link to={`/profile/${snippet.owner.username}`} className="text-primary hover:underline">{snippet.owner.username}</Link>
          </div>
          <div className="mb-2">
            <span className="font-bold">Language:</span> {snippet.language}
          </div>
          <div className="mb-2">
            <span className="font-bold">Created At:</span> <time dateTime={snippet.createdAt} title={new Date(snippet.createdAt).toLocaleString()}>{new Date(snippet.createdAt).toLocaleString()}</time>
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full mt-6 h-11 bg-primary text-white font-bold rounded-md hover:bg-primary-hover disabled:bg-gray-400"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnippetViewPage;
