import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Post } from '../types';
import { useWallet } from '../../../context/WalletContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const usePosts = () => {
  const { connected, publicKey } = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts...');
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          twitter_embed,
          website,
          facebook,
          telegram,
          created_at,
          user_id,
          users!posts_user_id_fkey (
            wallet_address
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get current user's UUID if connected
      let currentUserUuid: string | null = null;
      if (connected && publicKey) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', publicKey.toString())
          .maybeSingle();

        if (userError) {
          console.error('Error fetching current user:', userError);
        } else if (userData) {
          currentUserUuid = userData.id;
        }
      }

      const postsWithData = await Promise.all(
        postsData.map(async (post) => {
          try {
            // Get reaction counts
            const { data: reactionsData, error: reactionsError } = await supabase
              .from('likes')
              .select('emoji_type')
              .eq('post_id', post.id);

            if (reactionsError) {
              console.error('Error fetching reactions:', reactionsError);
            }

            // Count reactions by type
            const reactions = {
              thumbs_up: 0,
              smiley: 0,
              shit: 0,
              heart: 0
            };

            if (reactionsData) {
              reactionsData.forEach(reaction => {
                if (reactions.hasOwnProperty(reaction.emoji_type)) {
                  reactions[reaction.emoji_type as keyof typeof reactions]++;
                }
              });
            }

            // Get user's reactions using UUID instead of wallet address
            let userReactions: string[] = [];
            if (connected && currentUserUuid) {
              const { data: userReactionsData, error: userReactionsError } = await supabase
                .from('likes')
                .select('emoji_type')
                .eq('post_id', post.id)
                .eq('user_id', currentUserUuid);
              
              if (userReactionsError) {
                console.error('Error fetching user reactions:', userReactionsError);
              } else if (userReactionsData) {
                userReactions = userReactionsData.map(r => r.emoji_type);
              }
            }

            // Get comments count
            const { count: commentsCount, error: commentsError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentsError) {
              console.error('Error fetching comments count:', commentsError);
            }

            return {
              ...post,
              reactions,
              user_reactions: userReactions,
              comments_count: commentsCount || 0
            };
          } catch (error) {
            console.error('Error processing post:', post.id, error);
            return {
              ...post,
              reactions: { thumbs_up: 0, smiley: 0, shit: 0, heart: 0 },
              user_reactions: [],
              comments_count: 0
            };
          }
        })
      );

      setPosts(postsWithData);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const ensureUserExists = async (walletAddress: string): Promise<string> => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user existence:', checkError);
        throw checkError;
      }

      if (existingUser) {
        return existingUser.id;
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw insertError;
      }

      return newUser.id;
    } catch (error) {
      console.error('Error in ensureUserExists:', error);
      throw error;
    }
  };

  const handleEmojiReaction = async (postId: string, emojiType: string) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get the user's UUID first
      const userId = await ensureUserExists(publicKey.toString());

      // Try to insert the reaction first
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          emoji_type: emojiType
        });

      if (insertError) {
        // Check if it's a unique constraint violation (duplicate reaction)
        if (insertError.code === '23505') {
          // Reaction already exists, so remove it (toggle off)
          const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId)
            .eq('emoji_type', emojiType);

          if (deleteError) {
            console.error('Error removing reaction:', deleteError);
            throw deleteError;
          }
        } else {
          // Some other error occurred
          console.error('Error adding reaction:', insertError);
          throw insertError;
        }
      }
      
      // Refresh posts to show updated reactions
      await fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [connected, publicKey]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    ensureUserExists,
    handleEmojiReaction
  };
};