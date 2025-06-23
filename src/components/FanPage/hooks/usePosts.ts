import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Post } from '../types';
import { useWallet } from '../../../context/WalletContext';
import { useCallback } from 'react';


const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const usePosts = () => {
  const { connected, publicKey } = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
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
                if (Object.prototype.hasOwnProperty.call(reactions, reaction.emoji_type)) {
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

            // Ensure users property matches Post type (users: { wallet_address: string })
            let user: { wallet_address: string } = { wallet_address: '' };
            if (post.users && Array.isArray(post.users) && post.users.length > 0) {
              user = {
                wallet_address: String(post.users[0].wallet_address ?? '')
              };
            }
            
            return {
              ...post,
              users: user,
              reactions,
              user_reactions: userReactions,
              comments_count: commentsCount || 0
            };
          } catch (error) {
            console.error('Error processing post:', post.id, error);

            // Ensure users property is always present
            let user: { wallet_address: string } = { wallet_address: '' };
            if (post.users && Array.isArray(post.users) && post.users.length > 0) {
              user = {
                wallet_address: String(post.users[0].wallet_address ?? '')
              };
            }
            
            return {
              ...post,
              users: user,
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
  }, [connected, publicKey]);

  useEffect(() => {
    const channel = supabase
      .channel('likes-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchPosts(); // re-fetch posts when likes change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);


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

  type EmojiType = 'thumbs_up' | 'smiley' | 'shit' | 'heart';
  
  const handleEmojiReaction = async (postId: string, emojiType: EmojiType) => {
    if (!connected || !publicKey) {
      alert("Connect your wallet first");
      return;
    }

    const userId = await ensureUserExists(publicKey.toString());

    // Check if user already reacted with the same emoji
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji_type', emojiType)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from('likes').delete().eq('id', existing.id);
      // Update local state: decrease count
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                reactions: {
                  ...post.reactions,
                  [emojiType]: (post.reactions[emojiType] || 1) - 1,
                },
                user_reactions: post.user_reactions.filter(e => e !== emojiType)
              }
            : post
        )
      );
    } else {
      await supabase
      .from('likes')
      .upsert({ post_id: postId, user_id: userId, emoji_type: emojiType }, { onConflict: 'post_id,user_id,emoji_type' });

      // Update local state: increase count
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                reactions: {
                  ...post.reactions,
                  [emojiType]: (post.reactions[emojiType] || 0) + 1,
                },
                user_reactions: [...post.user_reactions, emojiType]
              }
            : post
        )
      );
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