import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { ExternalLink } from 'lucide-react';
import { Post } from './types';
import { formatWalletAddress, extractTweetId } from './utils';
import EmojiReactions from './EmojiReactions';
import PostActions from './PostActions';

interface PostCardProps {
  post: Post;
  connected: boolean;
  currentUserWallet: string | null;
  onEmojiReaction: (postId: string, emojiType: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenTip: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  connected,
  currentUserWallet,
  onEmojiReaction,
  onOpenComments,
  onOpenTip
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      e.stopPropagation();
    }
  };

  return (
    <div 
      className="holographic p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="font-mono text-xs text-accent-green">
          {formatWalletAddress(post.users.wallet_address)}
        </div>
        <div className="text-xs text-text-secondary-light dark:text-text-secondary">
          {new Date(post.created_at).toLocaleDateString()}
        </div>
      </div>

      <p className="mb-3 text-text-light dark:text-white whitespace-pre-wrap text-sm leading-relaxed">
        {post.content}
      </p>

      {post.twitter_embed && extractTweetId(post.twitter_embed) && (
        <div className="mb-3">
          <TwitterTweetEmbed tweetId={extractTweetId(post.twitter_embed)!} />
        </div>
      )}

      {(post.website || post.facebook || post.telegram) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.website && (
            <a
              href={post.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} /> Website
            </a>
          )}
          {post.facebook && (
            <a
              href={post.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} /> Facebook
            </a>
          )}
          {post.telegram && (
            <a
              href={post.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} /> Telegram
            </a>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div onClick={(e) => e.stopPropagation()}>
          <EmojiReactions post={post} onReaction={onEmojiReaction} />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <PostActions
            post={post}
            connected={connected}
            currentUserWallet={currentUserWallet}
            onOpenComments={onOpenComments}
            onOpenTip={onOpenTip}
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;