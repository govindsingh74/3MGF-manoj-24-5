import React from 'react';
import { EMOJI_TYPES } from './constants';
import { Post } from './types';

interface EmojiReactionsProps {
  post: Post;
  onReaction: (postId: string, emojiType: string) => void;
}

const EmojiReactions: React.FC<EmojiReactionsProps> = ({ post, onReaction }) => {
  const handleReactionClick = (emojiType: string) => {
    // Prevent event bubbling and page reload
    onReaction(post.id, emojiType);
  };

  return (
    <div className="flex items-center gap-3">
      {EMOJI_TYPES.map(({ type, icon: Icon }) => {
        const count = post.reactions[type as keyof typeof post.reactions];
        const isActive = post.user_reactions.includes(type);
        
        return (
          <button
            key={type}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleReactionClick(type);
            }}
            className={`flex items-center gap-1 transition-all duration-200 text-xs hover:scale-110 ${
              isActive
                ? 'text-accent-purple scale-105' 
                : 'text-text-secondary-light dark:text-text-secondary hover:text-accent-purple'
            }`}
            title={`${type.replace('_', ' ')} (${count})`}
          >
            <Icon 
              size={14} 
              fill={isActive ? 'currentColor' : 'none'}
              className={`transition-all duration-200 ${isActive ? 'animate-pulse' : ''}`}
            />
            <span className={`transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;