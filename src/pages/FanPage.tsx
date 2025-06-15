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
  twitter_embed: string;
  website: string;
  facebook: string;
  telegram: string;
  created_at: string;
  user: {
    wallet_address: string;
  };
  likes: number;
  comments: Comment[];
  liked_by_user: boolean;
}

interface Comment {
  id: string;
  content: string;
  user: {
    wallet_address: string;
  };
  created_at: string;
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

  const PLATFORM_FEE_ADDRESS = '4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756';
  const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
  const TIP_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(wallet_address),
          likes(count),
          comments(id, content, user:users(wallet_address), created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      // Create transaction for platform fee
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

      // Sign and send transaction
      const { solana } = window as any;
      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      // Save post to database
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          ...newPost,
          user_id: publicKey.toString()
        });

      if (dbError) throw dbError;

      setPostModalOpen(false);
      setNewPost({
        content: '',
        twitter_embed: '',
        website: '',
        facebook: '',
        telegram: ''
      });
      fetchPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      setError('Failed to submit post. Please try again.');
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
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: publicKey.toString()
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }
      
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
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
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : url;
  };

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
                  {publicKey?.toString()}
                </div>
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Post
                </button>
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
                    <div className="font-mono text-sm text-accent-green break-all">
                      {post.user.wallet_address.slice(0, 8)}...{post.user.wallet_address.slice(-8)}
                    </div>
                    <div className="text-sm text-text-secondary-light dark:text-text-secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="mb-4 text-text-light dark:text-white">{post.content}</p>

                  {post.twitter_embed && (
                    <div className="mb-4">
                      <TwitterTweetEmbed tweetId={extractTweetId(post.twitter_embed)} />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.website && (
                      <a
                        href={post.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80"
                      >
                        <ExternalLink size={14} /> Website
                      </a>
                    )}
                    {post.facebook && (
                      <a
                        href={post.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80"
                      >
                        <ExternalLink size={14} /> Facebook
                      </a>
                    )}
                    {post.telegram && (
                      <a
                        href={post.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-accent-purple hover:text-accent-purple/80"
                      >
                        <ExternalLink size={14} /> Telegram
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 ${
                        post.liked_by_user ? 'text-accent-purple' : 'text-text-secondary-light dark:text-text-secondary'
                      } hover:text-accent-purple transition-colors`}
                    >
                      <Heart size={18} /> {post.likes || 0}
                    </button>
                    <button
                      onClick={() => handleTip(post.user.wallet_address)}
                      className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary hover:text-accent-green transition-colors"
                    >
                      <Send size={18} /> Tip 0.01 SOL
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal - Responsive */}
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
              <div className="mb-4 p-3 bg-alert/10 border border-alert/20 rounded-lg flex items-center gap-2 text-alert">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm mb-2 text-text-light dark:text-white">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm"
                  rows={3}
                  placeholder="Share your thoughts..."
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="pt-3 sm:pt-4 border-t border-white/10">
                <p className="text-xs sm:text-sm text-text-secondary-light dark:text-text-secondary mb-3 sm:mb-4">
                  Platform fee: 0.05 SOL
                </p>
                <button
                  onClick={handleSubmitPost}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full text-sm sm:text-base"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Post'}
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