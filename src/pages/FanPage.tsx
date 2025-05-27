import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { Send, Heart, MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

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
  const { connected, address, openModal } = useWallet();
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

  const PLATFORM_FEE_ADDRESS = new PublicKey('4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756');
  const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
  const TIP_AMOUNT = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

  useEffect(() => {
    if (connected) {
      fetchPosts();
    }
  }, [connected]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/posts?select=*,user:users(wallet_address),likes:likes(count),comments:comments(id,content,user:users(wallet_address),created_at)`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!connected) {
      openModal();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // First, send the platform fee
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address!),
          toPubkey: PLATFORM_FEE_ADDRESS,
          lamports: PLATFORM_FEE,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(address!);

      // @ts-ignore
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      // Then, save the post to the database
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          ...newPost,
          user_id: address
        })
      });

      if (!response.ok) throw new Error('Failed to save post');

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
    if (!connected) {
      openModal();
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: address
        })
      });

      if (!response.ok) throw new Error('Failed to like post');
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleTip = async (recipientAddress: string) => {
    if (!connected) {
      openModal();
      return;
    }

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address!),
          toPubkey: new PublicKey(recipientAddress),
          lamports: TIP_AMOUNT,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(address!);

      // @ts-ignore
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert('Tip sent successfully!');
    } catch (error) {
      console.error('Error sending tip:', error);
      alert('Failed to send tip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sidebar - User Profile */}
        <div className="md:col-span-1">
          <div className="holographic p-6 sticky top-24">
            {connected ? (
              <>
                <h2 className="text-xl font-display mb-4">Your Profile</h2>
                <div className="text-sm font-mono mb-4 text-accent-green">
                  {address}
                </div>
                <button
                  onClick={() => setPostModalOpen(true)}
                  className="btn btn-primary w-full"
                >
                  Create Post
                </button>
              </>
            ) : (
              <div className="text-center">
                <button onClick={openModal} className="btn btn-primary">
                  Connect Wallet to Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Posts */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="holographic p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono text-sm text-accent-green">
                    {post.user.wallet_address}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>

                <p className="mb-4">{post.content}</p>

                {post.twitter_embed && (
                  <div className="mb-4">
                    <TwitterTweetEmbed tweetId={post.twitter_embed} />
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
                      post.liked_by_user ? 'text-accent-purple' : 'text-text-secondary'
                    }`}
                  >
                    <Heart size={18} /> {post.likes}
                  </button>
                  <button
                    onClick={() => handleTip(post.user.wallet_address)}
                    className="flex items-center gap-2 text-text-secondary hover:text-accent-green"
                  >
                    <Send size={18} /> Tip 0.01 SOL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPostModalOpen(false)} />
          <div className="relative z-10 bg-primary w-full max-w-md rounded-xl neon-border p-6">
            <h3 className="text-xl font-display mb-6">Create Post</h3>

            {error && (
              <div className="mb-4 p-3 bg-alert/10 border border-alert/20 rounded-lg flex items-center gap-2 text-alert">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Twitter Post ID</label>
                <input
                  type="text"
                  value={newPost.twitter_embed}
                  onChange={(e) => setNewPost({ ...newPost, twitter_embed: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Website</label>
                <input
                  type="url"
                  value={newPost.website}
                  onChange={(e) => setNewPost({ ...newPost, website: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Facebook</label>
                <input
                  type="url"
                  value={newPost.facebook}
                  onChange={(e) => setNewPost({ ...newPost, facebook: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Telegram</label>
                <input
                  type="url"
                  value={newPost.telegram}
                  onChange={(e) => setNewPost({ ...newPost, telegram: e.target.value })}
                  className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-text-secondary mb-4">
                  Platform fee: 0.05 SOL
                </p>
                <button
                  onClick={handleSubmitPost}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
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