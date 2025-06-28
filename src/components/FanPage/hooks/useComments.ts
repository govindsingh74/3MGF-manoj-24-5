import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Comment } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!comments_user_id_fkey (
            wallet_address
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }

      setComments(commentsData || []);
    } catch (error) {
      console.error('Error in fetchComments:', error);
    }
  }, []);

  return {
    comments,
    fetchComments
  };
};