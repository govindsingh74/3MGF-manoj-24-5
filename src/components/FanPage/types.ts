export interface Post {
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
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    wallet_address: string;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  txHash?: string;
}

export interface NewPost {
  content: string;
  twitter_embed: string;
  website: string;
  facebook: string;
  telegram: string;
}

export type TransactionStatus = 'idle' | 'signing' | 'sending' | 'confirming' | 'saving';

export interface EmojiType {
  type: string;
  icon: React.ElementType;
  label: string;
}