import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { Send, Heart, MessageCircle, ExternalLink, AlertCircle, Plus, X } from 'lucide-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Post {
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
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
}

const FanPage: React.FC = () => {
  const { connected, publicKey, openModal, connection } = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    twitter_embed: '',
    website: '',
    facebook: '',
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const PLATFORM_FEE_ADDRESS = '4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756';
  const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
  const TIP_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching posts...');
      
      // Fetch posts with user data
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

      console.log('Posts fetched:', postsData);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // For each post, get likes and comments count
      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          try {
            // Get likes count
            const { count: likesCount, error: likesError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (likesError) {
              console.error('Error fetching likes count:', likesError);
            }

            // Get comments count
            const { count: commentsCount, error: commentsError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            if (commentsError) {
              console.error('Error fetching comments count:', commentsError);
            }

            // Check if current user liked this post
            let userLiked = false;
            if (connected && publicKey) {
              const { data: userLike, error: likeError } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', publicKey.toString())
                .maybeSingle();
              
              if (likeError) {
                console.error('Error checking user like:', likeError);
              } else {
                userLiked = !!userLike;
              }
            }

            // Fix: users property is an array, but Post expects an object
            const userObj = Array.isArray(post.users) ? post.users[0] : post.users;

            return {
              ...post,
              users: userObj,
              likes_count: likesCount || 0,
              comments_count: commentsCount || 0,
              user_liked: userLiked
            };
          } catch (error) {
            console.error('Error processing post:', post.id, error);
            // Fix: users property is an array, but Post expects an object
            const userObj = Array.isArray(post.users) ? post.users[0] : post.users;
            return {
              ...post,
              users: userObj,
              likes_count: 0,
              comments_count: 0,
              user_liked: false
            };
          }
        })
      );

      setPosts(postsWithCounts);
      console.log('Posts with counts set:', postsWithCounts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const ensureUserExists = async (walletAddress: string) => {
    try {
      console.log('Checking if user exists:', walletAddress);
      
      // Check if user exists
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
        console.log('User already exists:', existingUser.id);
        return existingUser.id;
      }

      // Create new user
      console.log('Creating new user...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw insertError;
      }

      console.log('New user created:', newUser.id);
      return newUser.id;
    } catch (error) {
      console.error('Error in ensureUserExists:', error);
      throw error;
    }
  };

  const handleSubmitPost = async () => {
    if (!connected || !publicKey) {
      openModal();
      return;
    }

    if (!newPost.content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // ✅ Get Supabase user ID (UUID)
      const userId = await ensureUserExists(publicKey.toString());

      // ✅ Create & send transaction for fee
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PLATFORM_FEE_ADDRESS),
          lamports: PLATFORM_FEE,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const { solana } = window as any;
      if (!solana) throw new Error('Phantom wallet not found');

      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      // ✅ Save post only after payment confirmation
      const postData = {
        user_id: userId,
        content: newPost.content.trim(),
        twitter_embed: newPost.twitter_embed.trim() || null,
        website: newPost.website.trim() || null,
        facebook: newPost.facebook.trim() || null,
        telegram: newPost.telegram.trim() || null,
      };

      const { data: insertedPost, error: dbError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (dbError || !insertedPost) {
        console.error('Insert error:', dbError);
        throw dbError || new Error('Failed to insert post');
      }

      // ✅ Reset state
      setPostModalOpen(false);
      setNewPost({
        content: '',
        twitter_embed: '',
        website: '',
        facebook: '',
        telegram: ''
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      if (error instanceof Error) {
        setError(`Failed to submit post: ${error.message}`);
      } else {
        setError('Post submission failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleLike = async (postId: string) => {
    if (!connected || !publicKey) {
      openModal();
      return;
    }

    try {
      // ✅ Use real Supabase user ID (not wallet address string)
      const userId = await ensureUserExists(publicKey.toString());

      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: userId,
        });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };


  const handleTip = async (recipientAddress: string) => {
    if (!connected || !publicKey) {
      openModal();
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: TIP_AMOUNT,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const { solana } = window as any;
      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert('Tip sent successfully!');
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    }
  };

  const extractTweetId = (url: string) => {
    if (!url) return null;
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 bg-primary-light dark:bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-primary-light dark:bg-primary">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar - User Profile */}
        <div className="md:col-span-1">
          <div className="holographic p-6 sticky top-24">
            {connected ? (
              <>
                <h2 className="text-xl font-display mb-4 text-text-light dark:text-white">Your Profile</h2>
                <div className="text-sm font-mono mb-4 text-accent-green break-all">
                  {formatWalletAddress(publicKey?.toString() || '')}
                </div>
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Post
                </button>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary mt-2 text-center">
                  Fee: 0.05 SOL per post
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-text-secondary-light dark:text-text-secondary mb-4">
                  Connect your wallet to create posts and interact with the community
                </p>
                <button onClick={openModal} className="btn btn-primary">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Posts */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            {error && (
              <div className="holographic p-4 border-alert/50 bg-alert/10">
                <div className="flex items-center gap-2 text-alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <div className="holographic p-8 text-center">
                <p className="text-text-secondary-light dark:text-text-secondary">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="holographic p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-mono text-sm text-accent-green">
                      {formatWalletAddress(post.users.wallet_address)}
                    </div>
                    <div className="text-sm text-text-secondary-light dark:text-text-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="mb-4 text-text-light dark:text-white whitespace-pre-wrap">{post.content}</p>

                  {post.twitter_embed && extractTweetId(post.twitter_embed) && (
                    <div className="mb-4">
                      <TwitterTweetEmbed tweetId={extractTweetId(post.twitter_embed)!} />
                    </div>
                  )}

                  {(post.website || post.facebook || post.telegram) && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {post.website && (
                        <a
                          href={post.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={14} /> Website
                        </a>
                      )}
                      {post.facebook && (
                        <a
                          href={post.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={14} /> Facebook
                        </a>
                      )}
                      {post.telegram && (
                        <a
                          href={post.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={14} /> Telegram
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        post.user_liked 
                          ? 'text-accent-purple' 
                          : 'text-text-secondary-light dark:text-text-secondary hover:text-accent-purple'
                      }`}
                    >
                      <Heart size={18} fill={post.user_liked ? 'currentColor' : 'none'} />
                      {post.likes_count}
                    </button>
                    
                    <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary">
                      <MessageCircle size={18} />
                      {post.comments_count}
                    </div>
                    
                    {connected && post.users.wallet_address !== publicKey?.toString() && (
                      <button
                        onClick={() => handleTip(post.users.wallet_address)}
                        className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors"
                      >
                        <Send size={18} /> Tip 0.01 SOL
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPostModalOpen(false)} />
          <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl neon-border p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-display text-text-light dark:text-white">Create Post</h3>
              <button 
                onClick={() => setPostModalOpen(false)}
                className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-alert/10 border border-alert/20 rounded-lg flex items-start gap-2 text-alert">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm mb-2 text-text-light dark:text-white">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm resize-none"
                  rows={4}
                  placeholder="Share your thoughts..."
                  maxLength={500}
                />
                <div className="text-xs text-text-secondary-light dark:text-text-secondary mt-1 text-right">
                  {newPost.content.length}/500
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-text-light dark:text-white">Twitter Post URL</label>
                <input
                  type="text"
                  value={newPost.twitter_embed}
                  onChange={(e) => setNewPost({ ...newPost, twitter_embed: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                  placeholder="https://twitter.com/username/status/123456789"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Website</label>
                  <input
                    type="url"
                    value={newPost.website}
                    onChange={(e) => setNewPost({ ...newPost, website: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Facebook</label>
                  <input
                    type="url"
                    value={newPost.facebook}
                    onChange={(e) => setNewPost({ ...newPost, facebook: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Telegram</label>
                  <input
                    type="url"
                    value={newPost.telegram}
                    onChange={(e) => setNewPost({ ...newPost, telegram: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                    placeholder="https://t.me/username"
                  />
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3 mb-4">
                  <p className="text-xs sm:text-sm text-text-light dark:text-white mb-2">
                    <strong>Payment Required:</strong>
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary">
                    A fee of 0.05 SOL will be charged and must be confirmed before your post is published.
                  </p>
                </div>
                
                <button
                  onClick={handleSubmitPost}
                  disabled={isSubmitting || !newPost.content.trim()}
                  className="btn btn-primary w-full text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing Payment...' : 'Pay 0.05 SOL & Submit Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanPage;