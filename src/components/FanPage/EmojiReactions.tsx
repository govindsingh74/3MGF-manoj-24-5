import React, { useState } from 'react';
import { EMOJI_TYPES } from './constants';
import { Post } from './types';

interface EmojiReactionsProps {
  post: Post;
  onReaction: (postId: string, emojiType: string) => Promise<void>;
}

const EmojiReactions: React.FC<EmojiReactionsProps> = ({ post, onReaction }) => {
  const [disabledTypes, setDisabledTypes] = useState<string[]>([]);

  const handleClick = async (emojiType: string) => {
    if (disabledTypes.includes(emojiType)) return;

    setDisabledTypes(prev => [...prev, emojiType]);

    try {
      await onReaction(post.id, emojiType);
    } catch (err) {
      console.error('Emoji toggle failed:', err);
    } finally {
      setDisabledTypes(prev => prev.filter(t => t !== emojiType));
    }
  };

  return (
    <div className="flex items-center gap-3">
      {EMOJI_TYPES.map(({ type, icon: Icon }) => {
        const isActive = post.user_reactions.includes(type);
        const count = post.reactions[type as keyof typeof post.reactions] || 0;

        return (
          <button
            key={type}
            onClick={() => handleClick(type)}
            disabled={disabledTypes.includes(type)}
            className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
              isActive
                ? 'text-accent-purple'
                : 'text-text-secondary-light dark:text-text-secondary hover:text-accent-purple'
            }`}
          >
            <Icon size={14} fill={isActive ? 'currentColor' : 'none'} />
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;
