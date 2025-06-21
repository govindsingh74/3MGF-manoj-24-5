import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { Send, Heart, MessageCircle, ExternalLink, AlertCircle, Plus, X, CheckCircle, Clock, ThumbsUp, Smile, Frown } from 'lucide-react';
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
  reactions: {
    thumbs_up: number;
    smiley: number;
    shit: number;
    heart: number;
  };
  user_reactions: string[];
  comments_count: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    wallet_address: string;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  txHash?: string;
}

const FanPage: React.FC = () => {
  const { connected, publicKey, openModal, connection } = useWallet();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);
  const [isTipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [tipAmount, setTipAmount] = useState(0.01);
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'signing' | 'sending' | 'confirming' | 'saving'>('idle');

  const PLATFORM_FEE_ADDRESS = '4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756';
  const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL

  const emojiTypes = [
    { type: 'thumbs_up', icon: ThumbsUp, label: 'Thumbs Up' },
    { type: 'smiley', icon: Smile, label: 'Smiley' },
    { type: 'shit', icon: Frown, label: 'Shit' },
    { type: 'heart', icon: Heart, label: 'Heart' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [connected, publicKey]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, notification.type === 'error' ? 15000 : 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

            // Get user's reactions
            let userReactions: string[] = [];
            if (connected && publicKey) {
              const { data: userReactionsData, error: userReactionsError } = await supabase
                .from('likes')
                .select('emoji_type')
                .eq('post_id', post.id)
                .eq('user_id', publicKey.toString());
              
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

  const fetchComments = async (postId: string) => {
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
  };

  const ensureUserExists = async (walletAddress: string) => {
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
    setTransactionStatus('idle');

    try {
      setTransactionStatus('signing');
      addNotification({
        type: 'info',
        message: 'Preparing transaction...'
      });

      const userId = await ensureUserExists(publicKey.toString());

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PLATFORM_FEE_ADDRESS),
          lamports: PLATFORM_FEE,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      addNotification({
        type: 'info',
        message: 'Please approve the transaction in your wallet...'
      });

      const { solana } = window as any;
      if (!solana) {
        throw new Error('Phantom wallet not found');
      }

      const signed = await solana.signTransaction(transaction);

      setTransactionStatus('sending');
      addNotification({
        type: 'info',
        message: 'Sending transaction to network...'
      });
      
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'processed'
      });
      
      addNotification({
        type: 'info',
        message: `Transaction sent! Hash: ${signature.slice(0, 8)}...`,
        txHash: signature
      });

      setTransactionStatus('confirming');
      addNotification({
        type: 'info',
        message: 'Confirming transaction on blockchain...'
      });

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      addNotification({
        type: 'success',
        message: `Payment confirmed! 0.05 SOL deducted successfully.`,
        txHash: signature
      });

      setTransactionStatus('saving');
      addNotification({
        type: 'info',
        message: 'Saving your post...'
      });
      
      const postData = {
        user_id: userId,
        content: newPost.content.trim(),
        twitter_embed: newPost.twitter_embed.trim() || null,
        website: newPost.website.trim() || null,
        facebook: newPost.facebook.trim() || null,
        telegram: newPost.telegram.trim() || null
      };

      const { data: insertedPost, error: dbError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      addNotification({
        type: 'success',
        message: 'Post created successfully!'
      });

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
      let errorMessage = 'Failed to submit post. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled by user.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL balance. You need at least 0.05 SOL plus gas fees.';
        } else if (error.message.includes('Transaction failed')) {
          errorMessage = `Transaction failed: ${error.message}`;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      setTransactionStatus('idle');
    }
  };

  const handleEmojiReaction = async (postId: string, emojiType: string) => {
    if (!connected || !publicKey) {
      openModal();
      return;
    }

    try {
      await ensureUserExists(publicKey.toString());

      const { data: existingReaction } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', publicKey.toString())
        .eq('emoji_type', emojiType)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: publicKey.toString(),
            emoji_type: emojiType
          });
      }
      
      await fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!connected || !publicKey || !selectedPost) {
      openModal();
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      const userId = await ensureUserExists(publicKey.toString());

      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: selectedPost.id,
          user_id: userId,
          content: newComment.trim()
        });

      if (commentError) {
        throw commentError;
      }

      setNewComment('');
      await fetchComments(selectedPost.id);
      await fetchPosts();
    } catch (error) {
      console.error('Error submitting comment:', error);
      addNotification({
        type: 'error',
        message: 'Failed to submit comment'
      });
    }
  };

  const handleTip = async () => {
    if (!connected || !publicKey || !selectedPost) {
      openModal();
      return;
    }

    try {
      addNotification({
        type: 'info',
        message: 'Preparing tip transaction...'
      });

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(selectedPost.users.wallet_address),
          lamports: tipAmount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const { solana } = window as any;
      const signed = await solana.signTransaction(transaction);
      
      addNotification({
        type: 'info',
        message: 'Sending tip...'
      });

      const signature = await connection.sendRawTransaction(signed.serialize());
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Tip transaction failed');
      }

      addNotification({
        type: 'success',
        message: `Tip sent successfully! ${tipAmount} SOL sent.`,
        txHash: signature
      });

      setTipModalOpen(false);
    } catch (error) {
      console.error('Error sending tip:', error);
      addNotification({
        type: 'error',
        message: 'Failed to send tip. Please try again.'
      });
    }
  };

  const openCommentsModal = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalOpen(true);
    fetchComments(post.id);
  };

  const openTipModal = (post: Post) => {
    setSelectedPost(post);
    setTipModalOpen(true);
  };

  const extractTweetId = (url: string) => {
    if (!url) return null;
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getTransactionStatusMessage = () => {
    switch (transactionStatus) {
      case 'signing':
        return 'Preparing transaction...';
      case 'sending':
        return 'Sending transaction...';
      case 'confirming':
        return 'Confirming payment...';
      case 'saving':
        return 'Saving post...';
      default:
        return isSubmitting ? 'Processing...' : 'Pay 0.05 SOL & Submit Post';
    }
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
      <h2 className="section-title">MGF Fan Hub</h2>
      <div className="text-center mb-12">
          <p className="text-xl mb-4">
            MGF Fan Page — From Mt. Gox to Meme Glory
          </p>
          <p className="text-text-secondary max-w-3xl mx-auto">
            Own the moment. React. Tip. Meme the legend into the future.
          </p>
        </div>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ${
              notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle size={18} />}
                {notification.type === 'error' && <AlertCircle size={18} />}
                {notification.type === 'info' && <Clock size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.message}</p>
                {notification.txHash && (
                  <a
                    href={`https://explorer.solana.com/tx/${notification.txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline hover:no-underline mt-1 block"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-current hover:opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar - User Profile */}
        <div className="md:col-span-1">
          <div className="holographic p-4 sticky top-24">
            {connected ? (
              <>
                <h2 className="text-lg font-display mb-3 text-text-light dark:text-white">Your Profile</h2>
                <div className="text-xs font-mono mb-3 text-accent-green break-all">
                  {formatWalletAddress(publicKey?.toString() || '')}
                </div>
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm py-2 text-text-light dark:text-white hover:bg-accent-purple/80 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <Plus size={14} />
                  Create Post
                </button>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary mt-2 text-center">
                  Fee: 0.05 SOL per post
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-text-secondary-light dark:text-text-secondary mb-3 text-sm">
                  Connect your wallet to create posts and interact with the community
                </p>
                <button onClick={openModal} className="btn btn-primary text-sm py-2">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Posts */}
        <div className="md:col-span-3">
          <div className="space-y-4">
            {error && (
              <div className="holographic p-3 border-alert/50 bg-alert/10">
                <div className="flex items-center gap-2 text-alert text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <div className="holographic p-6 text-center">
                <p className="text-text-secondary-light dark:text-text-secondary">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="holographic p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-mono text-xs text-accent-green">
                      {formatWalletAddress(post.users.wallet_address)}
                    </div>
                    <div className="text-xs text-text-secondary-light dark:text-text-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="mb-3 text-text-light dark:text-white whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

                  {post.twitter_embed && extractTweetId(post.twitter_embed) && (
                    <div className="mb-3">
                      <TwitterTweetEmbed tweetId={extractTweetId(post.twitter_embed)!} />
                    </div>
                  )}

                  {(post.website || post.facebook || post.telegram) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.website && (
                        <a
                          href={post.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={12} /> Website
                        </a>
                      )}
                      {post.facebook && (
                        <a
                          href={post.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={12} /> Facebook
                        </a>
                      )}
                      {post.telegram && (
                        <a
                          href={post.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          <ExternalLink size={12} /> Telegram
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    {/* Emoji Reactions */}
                    <div className="flex items-center gap-3">
                      {emojiTypes.map(({ type, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => handleEmojiReaction(post.id, type)}
                          className={`flex items-center gap-1 transition-colors text-xs ${
                            post.user_reactions.includes(type)
                              ? 'text-accent-purple' 
                              : 'text-text-secondary-light dark:text-text-secondary hover:text-accent-purple'
                          }`}
                        >
                          <Icon size={14} fill={post.user_reactions.includes(type) ? 'currentColor' : 'none'} />
                          {post.reactions[type as keyof typeof post.reactions]}
                        </button>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openCommentsModal(post)}
                        className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
                      >
                        <MessageCircle size={14} />
                        {post.comments_count}
                      </button>
                      
                      {connected && post.users.wallet_address !== publicKey?.toString() && (
                        <button
                          onClick={() => openTipModal(post)}
                          className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors text-xs"
                        >
                          <Send size={14} /> Tip
                        </button>
                      )}
                    </div>
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && setPostModalOpen(false)} />
          <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-xl neon-border p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-display text-text-light dark:text-white">Create Post</h3>
              <button 
                onClick={() => !isSubmitting && setPostModalOpen(false)}
                className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white disabled:opacity-50"
                disabled={isSubmitting}
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
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm resize-none disabled:opacity-50"
                  rows={4}
                  placeholder="Share your thoughts..."
                  maxLength={500}
                  disabled={isSubmitting}
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
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                  placeholder="https://twitter.com/username/status/123456789"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Website</label>
                  <input
                    type="url"
                    value={newPost.website}
                    onChange={(e) => setNewPost({ ...newPost, website: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                    placeholder="https://example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Facebook</label>
                  <input
                    type="url"
                    value={newPost.facebook}
                    onChange={(e) => setNewPost({ ...newPost, facebook: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                    placeholder="https://facebook.com/username"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-text-light dark:text-white">Telegram</label>
                  <input
                    type="url"
                    value={newPost.telegram}
                    onChange={(e) => setNewPost({ ...newPost, telegram: e.target.value })}
                    className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
                    placeholder="https://t.me/username"
                    disabled={isSubmitting}
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
                  className="btn btn-primary w-full text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Clock size={16} className="animate-spin" />}
                  {getTransactionStatusMessage()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {isCommentsModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setCommentsModalOpen(false)} />
          <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-2xl rounded-xl neon-border p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display text-text-light dark:text-white">Comments</h3>
              <button 
                onClick={() => setCommentsModalOpen(false)}
                className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add Comment */}
            {connected && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm resize-none"
                  rows={3}
                  placeholder="Write a comment..."
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary">
                    {newComment.length}/300
                  </span>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="btn btn-primary text-sm text-gray-600 py-2 px-4 disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-text-secondary-light dark:text-text-secondary text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-accent-green">
                        {formatWalletAddress(comment.users.wallet_address)}
                      </span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-text-light dark:text-white text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {isTipModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTipModalOpen(false)} />
          <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-md rounded-xl neon-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display text-text-light dark:text-white">Send Tip</h3>
              <button 
                onClick={() => setTipModalOpen(false)}
                className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-text-light dark:text-white">Recipient</label>
                <div className="p-3 bg-white/5 rounded-lg font-mono text-sm text-accent-green">
                  {selectedPost.users.wallet_address}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-text-light dark:text-white">Amount (SOL)</label>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0.01)}
                  min="0.001"
                  step="0.001"
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                />
              </div>

              <button
                onClick={handleTip}
                className="btn btn-primary w-full text-text-secondary-dark dark:text-text-light text-sm py-2 disabled:opacity-50"
              >
                Send {tipAmount} SOL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanPage;