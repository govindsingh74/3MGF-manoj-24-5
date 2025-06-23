import { ThumbsUp, Smile, Frown, Heart } from 'lucide-react';
import { EmojiType } from './types';

export const PLATFORM_FEE_ADDRESS = '4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756';
export const PLATFORM_FEE = 0.05; // SOL
export const COMMENT_MAX_LENGTH = 100;
export const POST_MAX_LENGTH = 160;

export const EMOJI_TYPES: EmojiType[] = [
  { type: 'thumbs_up', icon: ThumbsUp, label: 'Thumbs Up' },
  { type: 'smiley', icon: Smile, label: 'Smiley' },
  { type: 'shit', icon: Frown, label: 'Shit' },
  { type: 'heart', icon: Heart, label: 'Heart' }
];