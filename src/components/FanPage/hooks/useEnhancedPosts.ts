import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Post } from '../types';
import { useWallet } from '../../../context/WalletContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

interface EnhancedPost extends Post {
  isSponsored?: boolean;
  sponsorData?: SponsoredPost;
  engagement_score?: number;
}

export const useEnhancedPosts = () => {
  const { connected, publicKey } = useWallet();
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [sponsoredPosts, setSponsoredPosts] = useState<SponsoredPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchSponsoredPosts = useCallback(async () => {
    try {
      const { data: adsData, error: adsError } = await supabase
        .from('adtweet')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (adsError) {
        console.error('Error fetching sponsored posts:', adsError);
        return [];
      }

      return adsData || [];
    } catch (error) {
      console.error('Error in fetchSponsoredPosts:', error);
      return [];
    }
  }, []);

  const calculateEngagementScore = (post: any) => {
    const now = new Date();
    const postDate = new Date(post.created_at);
    const hoursOld = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    
    // Calculate engagement metrics
    const totalReactions = (post.reactions?.thumbs_up || 0) + 
                          (post.reactions?.smiley || 0) + 
                          (post.reactions?.shit || 0) + 
                          (post.reactions?.heart || 0);
    
    const commentsCount = post.comments_count || 0;
    
    // Weight recent activity more heavily
    const recencyMultiplier = Math.max(0.1, 1 - (hoursOld / 24)); // Decay over 24 hours
    
    // Engagement score calculation
    const engagementScore = (
      (totalReactions * 2) +     // Reactions worth 2 points each
      (commentsCount * 3) +      // Comments worth 3 points each
      (post.tip_count || 0) * 5  // Tips worth 5 points each (if we track tips)
    ) * recencyMultiplier;
    
    return engagementScore;
  };

  const fetchRegularPosts = useCallback(async (limit: number, offsetValue: number, isInitial: boolean = false) => {
    try {
      let postsData: any[] = [];

      if (isInitial) {
        // For initial load, try multiple strategies to get engaging content
        
        // Strategy 1: Recent posts (last 2 hours) with engagement
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const { data: recentPosts } = await supabase
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
          .gte('created_at', twoHoursAgo)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentPosts && recentPosts.length > 0) {
          postsData = [...recentPosts];
        }

        // Strategy 2: If not enough recent posts, get posts with most reactions
        if (postsData.length < limit) {
          const { data: popularPosts } = await supabase
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
            .order('created_at', { ascending: false })
            .limit(limit * 2); // Get more to filter by engagement

          if (popularPosts) {
            // Add posts that aren't already included
            const existingIds = new Set(postsData.map(p => p.id));
            const newPosts = popularPosts.filter(p => !existingIds.has(p.id));
            postsData = [...postsData, ...newPosts].slice(0, limit);
          }
        }

        // Strategy 3: If still not enough, get latest posts
        if (postsData.length < limit) {
          const { data: latestPosts } = await supabase
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
            .order('created_at', { ascending: false })
            .limit(limit);

          if (latestPosts) {
            const existingIds = new Set(postsData.map(p => p.id));
            const newPosts = latestPosts.filter(p => !existingIds.has(p.id));
            postsData = [...postsData, ...newPosts].slice(0, limit);
          }
        }
      } else {
        // For subsequent loads, get older posts
        const { data: olderPosts } = await supabase
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
          .order('created_at', { ascending: false })
          .range(offsetValue, offsetValue + limit - 1);

        postsData = olderPosts || [];
      }

      if (!postsData || postsData.length === 0) {
        return [];
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

            // Get user's reactions using UUID
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

            const enhancedPost = {
              ...post,
              reactions,
              user_reactions: userReactions,
              comments_count: commentsCount || 0
            };

            // Calculate engagement score
            enhancedPost.engagement_score = calculateEngagementScore(enhancedPost);

            return enhancedPost;
          } catch (error) {
            console.error('Error processing post:', post.id, error);
            return {
              ...post,
              reactions: { thumbs_up: 0, smiley: 0, shit: 0, heart: 0 },
              user_reactions: [],
              comments_count: 0,
              engagement_score: 0
            };
          }
        })
      );

      // Sort by engagement score for initial load
      if (isInitial) {
        postsWithData.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
      }

      return postsWithData;
    } catch (error) {
      console.error('Error in fetchRegularPosts:', error);
      throw error;
    }
  }, [connected, publicKey]);

  const insertSponsoredPosts = useCallback((regularPosts: Post[], sponsoredAds: SponsoredPost[]): EnhancedPost[] => {
    if (sponsoredAds.length === 0) {
      return regularPosts;
    }

    const result: EnhancedPost[] = [];
    let sponsoredIndex = 0;
    let regularIndex = 0;

    // Insert first sponsored post at position 1 (after first regular post)
    if (regularPosts.length > 0) {
      result.push(regularPosts[regularIndex++]);
    }

    // Insert sponsored posts following the pattern
    while (regularIndex < regularPosts.length && sponsoredIndex < sponsoredAds.length) {
      // Add sponsored post
      const sponsoredPost = sponsoredAds[sponsoredIndex++];
      result.push({
        id: `sponsored-${sponsoredPost.id}`,
        content: sponsoredPost.content,
        twitter_embed: sponsoredPost.twitter_embed,
        website: sponsoredPost.website,
        facebook: sponsoredPost.facebook,
        telegram: sponsoredPost.telegram,
        created_at: sponsoredPost.created_at,
        user_id: 'sponsored',
        users: { wallet_address: 'sponsored' },
        reactions: { thumbs_up: 0, smiley: 0, shit: 0, heart: 0 },
        user_reactions: [],
        comments_count: 0,
        isSponsored: true,
        sponsorData: sponsoredPost
      });

      // Add 2 regular posts after each sponsored post
      for (let i = 0; i < 2 && regularIndex < regularPosts.length; i++) {
        result.push(regularPosts[regularIndex++]);
      }
    }

    // Add remaining regular posts
    while (regularIndex < regularPosts.length) {
      result.push(regularPosts[regularIndex++]);
    }

    return result;
  }, []);

  const fetchPosts = useCallback(async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      const limit = 10;

      // Fetch sponsored posts (only on initial load)
      let sponsoredAds: SponsoredPost[] = [];
      if (!isLoadMore) {
        sponsoredAds = await fetchSponsoredPosts();
        setSponsoredPosts(sponsoredAds);
      } else {
        sponsoredAds = sponsoredPosts;
      }

      // Fetch regular posts
      const regularPosts = await fetchRegularPosts(limit, currentOffset, !isLoadMore);

      if (regularPosts.length < limit) {
        setHasMore(false);
      }

      // Combine posts with sponsored content
      const combinedPosts = insertSponsoredPosts(regularPosts, sponsoredAds);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...combinedPosts]);
      } else {
        setPosts(combinedPosts);
      }

      setOffset(currentOffset + limit);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, sponsoredPosts, fetchSponsoredPosts, fetchRegularPosts, insertSponsoredPosts]);

  const ensureUserExists = useCallback(async (walletAddress: string): Promise<string> => {
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
  }, []);

  const updatePostReaction = useCallback((postId: string, emojiType: string, isAdding: boolean) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const updatedReactions = { ...post.reactions };
          const updatedUserReactions = [...post.user_reactions];

          if (isAdding) {
            // Add reaction
            updatedReactions[emojiType as keyof typeof updatedReactions]++;
            if (!updatedUserReactions.includes(emojiType)) {
              updatedUserReactions.push(emojiType);
            }
          } else {
            // Remove reaction
            updatedReactions[emojiType as keyof typeof updatedReactions] = Math.max(0, 
              updatedReactions[emojiType as keyof typeof updatedReactions] - 1);
            const index = updatedUserReactions.indexOf(emojiType);
            if (index > -1) {
              updatedUserReactions.splice(index, 1);
            }
          }

          return {
            ...post,
            reactions: updatedReactions,
            user_reactions: updatedUserReactions
          };
        }
        return post;
      })
    );
  }, []);

  const handleEmojiReaction = useCallback(async (postId: string, emojiType: string) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    // Skip sponsored posts
    if (postId.startsWith('sponsored-')) {
      return;
    }

    try {
      const userId = await ensureUserExists(publicKey.toString());

      // Check if user already has this reaction
      const currentPost = posts.find(p => p.id === postId);
      const hasReaction = currentPost?.user_reactions.includes(emojiType);

      // Optimistically update UI
      updatePostReaction(postId, emojiType, !hasReaction);

      // Perform database operation
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          emoji_type: emojiType
        });

      if (insertError) {
        if (insertError.code === '23505') {
          // Reaction already exists, remove it
          const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId)
            .eq('emoji_type', emojiType);

          if (deleteError) {
            console.error('Error removing reaction:', deleteError);
            // Revert optimistic update
            updatePostReaction(postId, emojiType, hasReaction);
            throw deleteError;
          }
        } else {
          console.error('Error adding reaction:', insertError);
          // Revert optimistic update
          updatePostReaction(postId, emojiType, hasReaction);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      throw error;
    }
  }, [connected, publicKey, ensureUserExists, posts, updatePostReaction]);

  useEffect(() => {
    fetchPosts(false);
  }, [connected, publicKey]);

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchPosts,
    ensureUserExists,
    handleEmojiReaction,
    loadMore: () => fetchPosts(true)
  };
};