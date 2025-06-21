import React from 'react';
import { X } from 'lucide-react';

const formatWalletAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

type Comment = {
  id: string;
  content: string;
  created_at: string;
  users: {
    wallet_address: string;
  };
};

type CommentsModalProps = {
  isCommentsModalOpen: boolean;
  setCommentsModalOpen: (open: boolean) => void;
  selectedPost: any; // Replace 'any' with the actual type if available
  comments: Comment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  handleSubmitComment: () => void;
  connected: boolean;
};

const CommentsModal: React.FC<CommentsModalProps> = ({
  isCommentsModalOpen,
  setCommentsModalOpen,
  selectedPost,
  comments,
  newComment,
  setNewComment,
  handleSubmitComment,
  connected
}) => {
  if (!isCommentsModalOpen || !selectedPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCommentsModalOpen(false)} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-2xl rounded-xl neon-border p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-text-light dark:text-white">Comments</h3>
          <button
            onClick={() => setCommentsModalOpen(false)}
            className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {connected && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-sm text-text-light dark:text-white resize-none"
              rows={3}
              maxLength={300}
              placeholder="Write a comment..."
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary">{newComment.length}/300</span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        )}

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
                <p className="text-sm text-text-light dark:text-white">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
