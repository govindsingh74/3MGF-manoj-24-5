import React from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Post } from './types';

interface PostActionsProps {
  post: Post;
  connected: boolean;
  currentUserWallet: string | null;
  onOpenComments: (post: Post) => void;
  onOpenTip: (post: Post) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  connected,
  currentUserWallet,
  onOpenComments,
  onOpenTip
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onOpenComments(post)}
        className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
      >
        <MessageCircle size={14} />
        {post.comments_count}
      </button>
      
      {connected && post.users.wallet_address !== currentUserWallet && (
        <button
          onClick={() => onOpenTip(post)}
          className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
        >
          <Send size={14} /> Tip
        </button>
      )}
    </div>
  );
};

export default PostActions;