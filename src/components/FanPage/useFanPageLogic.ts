// src/hooks/useFanPageLogic.ts
import { useEffect, useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { createClient } from '@supabase/supabase-js';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const useFanPageLogic = () => {
  const { connected, publicKey, openModal, connection } = useWallet();

  const [posts, setPosts] = useState<any[]>([]);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);
  const [isTipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'signing' | 'sending' | 'confirming' | 'saving'>('idle');

  const PLATFORM_FEE = 0.05 * LAMPORTS_PER_SOL;
  const PLATFORM_FEE_ADDRESS = '4n7S3NeFj2WTJVrXJdhpiCjqmWExhV7XGNDxWD5bg756';

  useEffect(() => {
    fetchPosts();
  }, [connected, publicKey]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, users:users!posts_user_id_fkey(wallet_address)')
        .order('created_at', { ascending: false });

      if (postError) throw new Error(`Post fetch error: ${JSON.stringify(postError)}`);

      const posts = postData || [];
      const postIds = posts.map(p => p.id);

      const { data: reactionsData, error: reactionsError } = await supabase
        .from('likes')
        .select('post_id, emoji_type');

      if (reactionsError) throw new Error(`Reactions fetch error: ${JSON.stringify(reactionsError)}`);

      const emojiCountMap: Record<string, Record<string, number>> = {};
      for (const row of reactionsData) {
        if (!emojiCountMap[row.post_id]) emojiCountMap[row.post_id] = {};
        emojiCountMap[row.post_id][row.emoji_type] = (emojiCountMap[row.post_id][row.emoji_type] || 0) + 1;
      }

      let userReactionMap: Record<string, string> = {};
      if (connected && publicKey) {
        const userId = await ensureUserExists(publicKey.toString());
        const { data: userReactions, error: userReactionsError } = await supabase
          .from('likes')
          .select('post_id, emoji_type')
          .eq('user_id', userId);

        if (userReactionsError) throw new Error(`User reactions fetch error: ${JSON.stringify(userReactionsError)}`);

        userReactionMap = userReactions.reduce((acc, cur) => {
          acc[cur.post_id] = cur.emoji_type;
          return acc;
        }, {} as Record<string, string>);
      }

      const { data: commentCounts, error: commentError } = await supabase
        .from('comments')
        .select('post_id');

      if (commentError) throw new Error(`Comments fetch error: ${JSON.stringify(commentError)}`);

      const commentMap: Record<string, number> = {};
      for (const row of commentCounts) {
        commentMap[row.post_id] = (commentMap[row.post_id] || 0) + 1;
      }

      const fullPosts = posts.map(post => ({
        ...post,
        reactions: emojiCountMap[post.id] || {},
        user_reaction: userReactionMap[post.id] || '',
        comments_count: commentMap[post.id] || 0
      }));

      setPosts(fullPosts);
    } catch (err: any) {
      console.error('Error loading posts:', err.message, err);
      setError('Failed to load posts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!connected || !publicKey || !selectedPost || !newComment.trim()) return;

    try {
      const userId = await ensureUserExists(publicKey.toString());
      const { error } = await supabase.from('comments').insert({
        post_id: selectedPost.id,
        user_id: userId,
        content: newComment.trim()
      });

      if (error) throw new Error(`Comment insert error: ${JSON.stringify(error)}`);

      setNewComment('');
      fetchPosts();
    } catch (err: any) {
      console.error('Failed to submit comment:', err.message, err);
      setError('Failed to submit comment: ' + err.message);
    }
  };

  const handleEmojiReaction = async (postId: string, emojiType: string) => {
    if (!connected || !publicKey) return openModal();

    try {
      const userId = await ensureUserExists(publicKey.toString());

      // Check if the user already reacted with this emoji on this post
      const { data: existing, error: existingError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emoji_type', emojiType)
        .maybeSingle();

      if (existingError) throw new Error(`Select error: ${JSON.stringify(existingError)}`);

      if (!existing) {
        const { error: insertError } = await supabase.from('likes').insert({
          post_id: postId,
          user_id: userId,
          emoji_type: emojiType
        });

        if (insertError) throw new Error(`Insert error: ${JSON.stringify(insertError)}`);

        // Update post state locally
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  reactions: {
                    ...post.reactions,
                    [emojiType]: (post.reactions?.[emojiType] || 0) + 1
                  }
                }
              : post
          )
        );
      }
    } catch (err: any) {
      console.error('Reaction error:', err.message, err);
      setError('Failed to save reaction: ' + err.message);
    }
  };


  const ensureUserExists = async (walletAddress: string) => {
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (selectError) throw new Error(`User select error: ${JSON.stringify(selectError)}`);

    if (user) return user.id;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ wallet_address: walletAddress })
      .select('id')
      .single();

    if (insertError) throw new Error(`User insert error: ${JSON.stringify(insertError)}`);

    return newUser.id;
  };

  const handleSubmitPost = async () => {
    if (!connected || !publicKey) return openModal();
    if (!newPost.content.trim()) return setError('Content is required');
    setIsSubmitting(true);

    try {
      const userId = await ensureUserExists(publicKey.toString());
      const transaction = new Transaction().add(SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(PLATFORM_FEE_ADDRESS),
        lamports: PLATFORM_FEE
      }));
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const { solana } = window as any;
      const signed = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      const { error: postError } = await supabase.from('posts').insert({ ...newPost, user_id: userId });
      if (postError) throw new Error(`Post insert error: ${JSON.stringify(postError)}`);
      setNewPost({ content: '', twitter_embed: '', website: '', facebook: '', telegram: '' });
      setPostModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error('Post error:', err.message, err);
      setError('Failed to submit post: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    connected,
    publicKey,
    openModal,
    connection,
    posts,
    isPostModalOpen,
    setPostModalOpen,
    isCommentsModalOpen,
    setCommentsModalOpen,
    isTipModalOpen,
    setTipModalOpen,
    selectedPost,
    setSelectedPost,
    comments,
    setComments,
    newComment,
    setNewComment,
    tipAmount,
    setTipAmount,
    newPost,
    setNewPost,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    loading,
    notifications,
    setNotifications,
    transactionStatus,
    setTransactionStatus,
    fetchPosts,
    handleSubmitPost,
    handleEmojiReaction,
    handleSubmitComment
  };
};

export default useFanPageLogic;