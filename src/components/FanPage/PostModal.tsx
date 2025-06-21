import React from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';

type PostModalProps = {
  isPostModalOpen: boolean;
  setPostModalOpen: (open: boolean) => void;
  newPost: {
    content: string;
    twitter_embed: string;
    website: string;
    facebook: string;
    telegram: string;
    [key: string]: any;
  };
  setNewPost: (post: any) => void;
  handleSubmitPost: () => void;
  isSubmitting: boolean;
  error?: string;
  getTransactionStatusMessage?: () => string;
};

const PostModal: React.FC<PostModalProps> = ({
  isPostModalOpen,
  setPostModalOpen,
  newPost,
  setNewPost,
  handleSubmitPost,
  isSubmitting,
  error,
  getTransactionStatusMessage
}) => {
  if (!isPostModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && setPostModalOpen(false)} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl neon-border p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-display text-text-light dark:text-white">Create Post</h3>
          <button
            onClick={() => !isSubmitting && setPostModalOpen(false)}
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
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-text-light dark:text-white text-sm resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              placeholder="What's happening?"
            />
            <div className="text-xs text-text-secondary-light dark:text-text-secondary text-right mt-1">
              {newPost.content.length}/500
            </div>
          </div>

          <input
            type="text"
            value={newPost.twitter_embed}
            onChange={(e) => setNewPost({ ...newPost, twitter_embed: e.target.value })}
            className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-text-light dark:text-white text-sm"
            placeholder="Twitter URL"
            disabled={isSubmitting}
          />

          <input
            type="url"
            value={newPost.website}
            onChange={(e) => setNewPost({ ...newPost, website: e.target.value })}
            className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-sm text-text-light dark:text-white"
            placeholder="Website"
            disabled={isSubmitting}
          />

          <input
            type="url"
            value={newPost.facebook}
            onChange={(e) => setNewPost({ ...newPost, facebook: e.target.value })}
            className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-sm text-text-light dark:text-white"
            placeholder="Facebook"
            disabled={isSubmitting}
          />

          <input
            type="url"
            value={newPost.telegram}
            onChange={(e) => setNewPost({ ...newPost, telegram: e.target.value })}
            className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 text-sm text-text-light dark:text-white"
            placeholder="Telegram"
            disabled={isSubmitting}
          />

          <div className="pt-3 sm:pt-4 border-t border-white/10">
            <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3 mb-4 text-xs text-text-secondary-light dark:text-text-secondary">
              A fee of 0.05 SOL will be charged before your post is published.
            </div>
            <button
              onClick={handleSubmitPost}
              disabled={isSubmitting || !newPost.content.trim()}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting && <Clock size={16} className="animate-spin" />}
              {getTransactionStatusMessage?.() || 'Submit Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
