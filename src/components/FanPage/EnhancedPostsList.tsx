import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import PostCard from './PostCard';
import SponsoredPostCard from './SponsoredPostCard';

interface EnhancedPost {
  id: string;
  content: string;
  twitter_embed: string | null;
  website: string | null;
  facebook: string | null;
  telegram: string | null;
  created_at: string;
  user_id: string;
  users: {
    wallet_address: string;
  };
  reactions: {
    thumbs_up: number;
    smiley: number;
    shit: number;
    heart: number;
  };
  user_reactions: string[];
  comments_count: number;
  isSponsored?: boolean;
  sponsorData?: any;
}

interface EnhancedPostsListProps {
  posts: EnhancedPost[];
  loading: boolean;
  loadingMore: boolean;
  error: string;
  hasMore: boolean;
  connected: boolean;
  currentUserWallet: string | null;
  onEmojiReaction: (postId: string, emojiType: string) => void;
  onOpenComments: (post: any) => void;
  onOpenTip: (post: any) => void;
  onLoadMore: () => void;
}

const EnhancedPostsList: React.FC<EnhancedPostsListProps> = ({
  posts,
  loading,
  loadingMore,
  error,
  hasMore,
  connected,
  currentUserWallet,
  onEmojiReaction,
  onOpenComments,
  onOpenTip,
  onLoadMore
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, loading, onLoadMore]);

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
        <>
          {posts.map((post) => (
            <div key={post.id}>
              {post.isSponsored && post.sponsorData ? (
                <SponsoredPostCard post={post.sponsorData} />
              ) : (
                <PostCard
                  post={post}
                  connected={connected}
                  currentUserWallet={currentUserWallet}
                  onEmojiReaction={onEmojiReaction}
                  onOpenComments={onOpenComments}
                  onOpenTip={onOpenTip}
                />
              )}
            </div>
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4">
            {loadingMore && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
                <span className="ml-2 text-text-secondary-light dark:text-text-secondary">
                  Loading more posts...
                </span>
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="text-center text-text-secondary-light dark:text-text-secondary">
                <p>You've reached the end of the feed!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedPostsList;