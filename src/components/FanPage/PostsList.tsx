import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Post } from './types';
import PostCard from './PostCard';

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  error: string;
  connected: boolean;
  currentUserWallet: string | null;
  onEmojiReaction: (postId: string, emojiType: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenTip: (post: Post) => void;
}

const PostsList: React.FC<PostsListProps> = ({
  posts,
  loading,
  error,
  connected,
  currentUserWallet,
  onEmojiReaction,
  onOpenComments,
  onOpenTip
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="holographic p-3 border-alert/50 bg-alert/10">
          <div className="flex items-center gap-2 text-alert text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="holographic p-6 text-center">
          <p className="text-text-secondary-light dark:text-text-secondary">
            No posts yet. Be the first to share something!
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            connected={connected}
            currentUserWallet={currentUserWallet}
            onEmojiReaction={onEmojiReaction}
            onOpenComments={onOpenComments}
            onOpenTip={onOpenTip}
          />
        ))
      )}
    </div>
  );
};

export default PostsList;