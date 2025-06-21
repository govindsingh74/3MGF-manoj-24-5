import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import {
  Send,
  MessageCircle,
  ExternalLink,
  ThumbsUp,
  Smile,
  Frown,
  Heart
} from 'lucide-react';

const emojiTypes = [
  { type: 'thumbs_up', icon: ThumbsUp, label: 'Thumbs Up' },
  { type: 'smiley', icon: Smile, label: 'Smiley' },
  { type: 'shit', icon: Frown, label: 'Shit' },
  { type: 'heart', icon: Heart, label: 'Heart' },
];

const extractTweetId = (url: string) => {
  if (!url) return null;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
};

const formatWalletAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

type Post = {
  id: string;
  content: string;
  created_at: string;
  twitter_embed?: string;
  website?: string;
  facebook?: string;
  telegram?: string;
  users: {
    wallet_address: string;
  };
  reactions: Record<string, number>; // emoji_type => count
  user_reaction: string; // the emoji type user has selected
  comments_count: number;
};

type PostFeedProps = {
  posts: Post[];
  handleEmojiReaction: (postId: string, type: string) => void;
  openCommentsModal: (post: Post) => void;
  openTipModal: (post: Post) => void;
  connected: boolean;
  publicKey?: { toString: () => string };
};

const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  handleEmojiReaction,
  openCommentsModal,
  openTipModal,
  connected,
  publicKey
}) => {
  return (
    <div className="md:col-span-3">
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="holographic p-4">
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
                  >
                    <ExternalLink size={12} /> Telegram
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-3">
                {emojiTypes.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleEmojiReaction(post.id, type)}
                    className={`flex items-center gap-1 transition-colors text-xs ${
                      post.user_reaction === type
                        ? 'text-accent-purple'
                        : 'text-text-secondary-light dark:text-text-secondary hover:text-accent-purple'
                    }`}
                  >
                    <Icon size={14} fill={post.user_reaction === type ? 'currentColor' : 'none'} />
                    {post.reactions?.[type] || 0}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openCommentsModal(post)}
                  className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
                >
                  <MessageCircle size={14} />
                  {post.comments_count}
                </button>

                {connected && post.users.wallet_address !== publicKey?.toString() && (
                  <button
                    onClick={() => openTipModal(post)}
                    className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
                  >
                    <Send size={14} /> Tip
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
