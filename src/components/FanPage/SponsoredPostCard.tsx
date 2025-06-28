import React from 'react';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { ExternalLink, Star } from 'lucide-react';
import { extractTweetId } from './utils';

interface SponsoredPost {
  id: string;
  content: string;
  twitter_embed: string | null;
  website: string | null;
  facebook: string | null;
  telegram: string | null;
  sponsor_name: string;
  created_at: string;
}

interface SponsoredPostCardProps {
  post: SponsoredPost;
}

const SponsoredPostCard: React.FC<SponsoredPostCardProps> = ({ post }) => {
  return (
    <div className="holographic p-4 border-accent-purple/40 bg-gradient-to-r from-accent-purple/5 to-accent-green/5">
      {/* Sponsored Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="text-accent-purple" size={14} fill="currentColor" />
          <span className="text-xs font-display text-accent-purple">SPONSORED</span>
        </div>
        <div className="text-xs text-text-secondary-light dark:text-text-secondary">
          by {post.sponsor_name}
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

      <div className="pt-3 border-t border-accent-purple/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent-purple font-display">
            Promoted Content
          </span>
          <span className="text-xs text-text-secondary-light dark:text-text-secondary">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SponsoredPostCard;