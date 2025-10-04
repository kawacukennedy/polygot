import React, { useState, useEffect } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

interface Execution {
  id: string;
  snippetId: string;
  language: string;
  status: string;
  executedAt: string;
  output: string;
}

const ExecutionsPage: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToast } = useToast();

  const fetchExecutions = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/executions');
      if (response.ok) {
        const data: Execution[] = await response.json();
        setExecutions(data);
      } else {
        setError(true);
        addToast('Failed to load executions.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching executions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-danger mb-4">Failed to load executions.</p>
        <button
          onClick={fetchExecutions}
          className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Executions</h1>
      {executions.length === 0 ? (
        <p className="text-muted">No executions found.</p>
      ) : (
        <div className="space-y-4">
          {executions.map((execution) => (
            <div key={execution.id} className="bg-surface rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <Link to={`/snippets/${execution.snippetId}`} className="text-xl font-bold text-primary hover:underline">
                  Snippet ID: {execution.snippetId}
                </Link>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${execution.status === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {execution.status}
                </span>
              </div>
              <p className="text-muted text-sm mb-2">Language: {execution.language} - Executed At: {new Date(execution.executedAt).toLocaleString()}</p>
              <pre className="bg-gray-800 text-white p-2 rounded-md text-sm overflow-auto max-h-24">
                {execution.output || 'No output.'}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionsPage;
