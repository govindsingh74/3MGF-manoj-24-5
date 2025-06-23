import React from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { NewPost, TransactionStatus } from './types';
import { POST_MAX_LENGTH } from './constants';

interface CreatePostModalProps {
  isOpen: boolean;
  newPost: NewPost;
  isSubmitting: boolean;
  transactionStatus: TransactionStatus;
  error: string;
  onClose: () => void;
  onPostChange: (post: NewPost) => void;
  onSubmit: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  newPost,
  isSubmitting,
  transactionStatus,
  error,
  onClose,
  onPostChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  const getTransactionStatusMessage = () => {
    switch (transactionStatus) {
      case 'signing':
        return 'Preparing transaction...';
      case 'sending':
        return 'Sending transaction...';
      case 'confirming':
        return 'Confirming payment...';
      case 'saving':
        return 'Saving post...';
      default:
        return isSubmitting ? 'Processing...' : 'Pay 0.05 SOL & Submit Post';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && onClose()} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl neon-border p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-display text-text-light dark:text-white">Create Post</h3>
          <button 
            onClick={() => !isSubmitting && onClose()}
            className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-alert/10 border border-alert/20 rounded-lg flex items-start gap-2 text-alert">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm mb-2 text-text-light dark:text-white">Content *</label>
            <textarea
              value={newPost.content}
              onChange={(e) => onPostChange({ ...newPost, content: e.target.value })}
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm resize-none disabled:opacity-50"
              rows={4}
              placeholder="Share your thoughts..."
              maxLength={POST_MAX_LENGTH}
              disabled={isSubmitting}
            />
            <div className="text-xs text-text-secondary-light dark:text-text-secondary mt-1 text-right">
              {newPost.content.length}/{POST_MAX_LENGTH}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-text-light dark:text-white">Twitter Post URL</label>
            <input
              type="text"
              value={newPost.twitter_embed}
              onChange={(e) => onPostChange({ ...newPost, twitter_embed: e.target.value })}
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
              placeholder="https://twitter.com/username/status/123456789"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm mb-2 text-text-light dark:text-white">Website</label>
              <input
                type="url"
                value={newPost.website}
                onChange={(e) => onPostChange({ ...newPost, website: e.target.value })}
                className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-text-light dark:text-white">Facebook</label>
              <input
                type="url"
                value={newPost.facebook}
                onChange={(e) => onPostChange({ ...newPost, facebook: e.target.value })}
                className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                placeholder="https://facebook.com/username"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-text-light dark:text-white">Telegram</label>
              <input
                type="url"
                value={newPost.telegram}
                onChange={(e) => onPostChange({ ...newPost, telegram: e.target.value })}
                className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                placeholder="https://t.me/username"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-white/10">
            <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3 mb-4">
              <p className="text-xs sm:text-sm text-text-light dark:text-white mb-2">
                <strong>Payment Required:</strong>
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary">
                A fee of 0.05 SOL will be charged and must be confirmed before your post is published.
              </p>
            </div>
            
            <button
              onClick={onSubmit}
              disabled={isSubmitting || !newPost.content.trim()}
              className="btn btn-primary w-full text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Clock size={16} className="animate-spin" />}
              {getTransactionStatusMessage()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;