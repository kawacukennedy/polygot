import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createComment, updateComment, deleteComment } from '../services/api';

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

interface CommentProps {
  comment: CommentData;
  snippetId: string;
  onCommentUpdate: (commentId: string, updatedComment: CommentData) => void;
  onCommentDelete: (commentId: string) => void;
  onReplyAdd: (parentId: string, newReply: CommentData) => void;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  snippetId,
  onCommentUpdate,
  onCommentDelete,
  onReplyAdd
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleEdit = async () => {
    if (!editContent.trim()) {
      addToast('Comment cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedComment = await updateComment(comment.id, editContent);
      onCommentUpdate(comment.id, updatedComment);
      setIsEditing(false);
      addToast('Comment updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsSubmitting(true);
    try {
      await deleteComment(comment.id);
      onCommentDelete(comment.id);
      addToast('Comment deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      addToast('Reply cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReply = await createComment(snippetId, replyContent, comment.id);
      onReplyAdd(comment.id, newReply);
      setReplyContent('');
      setIsReplying(false);
      addToast('Reply added successfully', 'success');
    } catch (error) {
      addToast('Failed to add reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = user?.id === comment.author.id;
  const canDelete = user?.id === comment.author.id;
  const canReply = user && comment.depth < 3;

  return (
    <div className={`comment ${comment.depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-start space-x-3 mb-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.username} />
          <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">{comment.author.username}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.moderated && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Moderated
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                maxLength={1000}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleEdit} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center space-x-2 mt-2">
              {canReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs h-6 px-2"
                >
                  Reply
                </Button>
              )}
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="text-xs h-6 px-2"
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          )}

          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px]"
                maxLength={1000}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleReply} disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs h-6 px-2 mb-2"
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>

          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  snippetId={snippetId}
                  onCommentUpdate={onCommentUpdate}
                  onCommentDelete={onCommentDelete}
                  onReplyAdd={onReplyAdd}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;