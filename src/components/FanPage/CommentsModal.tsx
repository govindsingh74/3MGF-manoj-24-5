import React from 'react';
import { X } from 'lucide-react';
import { Post, Comment } from './types';
import { formatWalletAddress } from './utils';
import { COMMENT_MAX_LENGTH } from './constants';

interface CommentsModalProps {
  isOpen: boolean;
  post: Post | null;
  comments: Comment[];
  newComment: string;
  connected: boolean;
  onClose: () => void;
  onCommentChange: (comment: string) => void;
  onSubmitComment: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  post,
  comments,
  newComment,
  connected,
  onClose,
  onCommentChange,
  onSubmitComment
}) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-2xl rounded-xl neon-border p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-text-light dark:text-white">Comments</h3>
          <button 
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add Comment */}
        {connected && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm resize-none"
              rows={3}
              placeholder="Write a comment..."
              maxLength={COMMENT_MAX_LENGTH}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary">
                {newComment.length}/{COMMENT_MAX_LENGTH}
              </span>
              <button
                onClick={onSubmitComment}
                disabled={!newComment.trim()}
                className="btn btn-primary text-sm py-2 px-4 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-text-secondary-light dark:text-text-secondary text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs text-accent-green">
                    {formatWalletAddress(comment.users.wallet_address)}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-text-light dark:text-white text-sm">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;