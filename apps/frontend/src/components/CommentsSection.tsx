import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getComments, createComment } from '../services/api';
import Comment from './Comment';

interface CommentAuthor {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface CommentData {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt?: string;
  replies?: CommentData[];
  depth: number;
  moderated?: boolean;
}

interface CommentsSectionProps {
  snippetId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ snippetId }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const loadComments = async (page = 1) => {
    try {
      const response = await getComments(snippetId, page, pagination.limit);
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (error) {
      addToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [snippetId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      addToast('Comment cannot be empty', 'error');
      return;
    }

    if (!user) {
      addToast('You must be logged in to comment', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const addedComment = await createComment(snippetId, newComment);
      setComments([addedComment, ...comments]);
      setNewComment('');
      addToast('Comment added successfully', 'success');
    } catch (error) {
      addToast('Failed to add comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (commentId: string, updatedComment: CommentData) => {
    const updateCommentInTree = (comments: CommentData[]): CommentData[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment;
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentInTree(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(updateCommentInTree(comments));
  };

  const handleCommentDelete = (commentId: string) => {
    const removeCommentFromTree = (comments: CommentData[]): CommentData[] => {
      return comments.filter(comment => {
        if (comment.id === commentId) {
          return false;
        }
        if (comment.replies) {
          comment.replies = removeCommentFromTree(comment.replies);
        }
        return true;
      });
    };

    setComments(removeCommentFromTree(comments));
  };

  const handleReplyAdd = (parentId: string, newReply: CommentData) => {
    const addReplyToTree = (comments: CommentData[]): CommentData[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: addReplyToTree(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(addReplyToTree(comments));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({pagination.total})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new comment */}
        {user && (
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[100px]"
              maxLength={1000}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center py-4 text-gray-500">
            Please log in to add comments.
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                snippetId={snippetId}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
                onReplyAdd={handleReplyAdd}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => loadComments(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => loadComments(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;