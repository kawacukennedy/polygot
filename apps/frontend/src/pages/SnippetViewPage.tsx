import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  author: string;
  createdAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

const SnippetViewPage: React.FC = () => {
  const { id } = useParams();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { addToast } = useToast();

  const fetchSnippetAndComments = async () => {
    setLoading(true);
    setError(false);
    try {
      const snippetResponse = await fetch(`/api/snippets/${id}`);
      if (snippetResponse.ok) {
        const snippetData = await snippetResponse.json();
        setSnippet(snippetData);
      } else {
        setError(true);
        addToast('Failed to load snippet.', 'error');
      }

      const commentsResponse = await fetch(`/api/snippets/${id}/comments`);
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      } else {
        addToast('Failed to load comments.', 'error');
      }
    } catch (err) {
      setError(true);
      addToast('Network error while fetching snippet and comments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippetAndComments();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      addToast('Comment cannot be empty.', 'error');
      return;
    }

    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/snippets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        const addedComment = await response.json();
        setComments([...comments, addedComment]);
        setNewComment('');
        addToast('Comment added successfully!', 'success');
      } else {
        addToast('Failed to add comment.', 'error');
      }
    } catch (err) {
      addToast('Network error while adding comment.', 'error');
    } finally {
      setIsAddingComment(false);
    }
  };

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
          <form onSubmit={handleAddComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 bg-white border border-gray-300 rounded-md mb-2"
              rows={3}
            ></textarea>
            <button
              type="submit"
              disabled={isAddingComment}
              className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400"
            >
              {isAddingComment ? 'Adding...' : 'Add Comment'}
            </button>
          </form>
          <div>
            {comments.length === 0 ? (
              <p className="text-muted">No comments yet.</p>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id} className="mb-4 p-3 bg-gray-100 rounded-md">
                    <div className="flex justify-between text-sm text-muted mb-1">
                      <span>{comment.author}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
