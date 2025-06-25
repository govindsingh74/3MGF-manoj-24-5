import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import NotificationSystem from '../components/fanpage/NotificationSystem';
import UserProfile from '../components/fanpage/UserProfile';
import PostsList from '../components/fanpage/PostsList';
import CreatePostModal from '../components/fanpage/CreatePostModal';
import CommentsModal from '../components/fanpage/CommentsModal';
import TipModal from '../components/fanpage/TipModal';
import { useNotifications } from '../components/fanpage/hooks/useNotifications';
import { usePosts } from '../components/fanpage/hooks/usePosts';
import { useComments } from '../components/fanpage/hooks/useComments';
import { Post, NewPost, EmojiType } from '../components/fanpage/types';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const FanPage: React.FC = () => {
  const { connected, openModal, publicKey, connection } = useWallet();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { posts, loading, error, fetchPosts, ensureUserExists, handleEmojiReaction } = usePosts();
  const { comments, fetchComments } = useComments();

  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);
  const [isTipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [tipAmount, setTipAmount] = useState(0.01);
  const [newPost, setNewPost] = useState<NewPost>({
    content: '',
    twitter_embed: '',
    website: '',
    facebook: '',
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCommentsModal = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalOpen(true);
    fetchComments(post.id);
  };

  const openTipModal = (post: Post) => {
    setSelectedPost(post);
    setTipModalOpen(true);
  };

  const handleEmojiClick = async (postId: string, emojiType: EmojiType) => {
    if (!connected) {
      openModal();
      return;
    }

    try {
      await handleEmojiReaction(postId, emojiType);
    } catch (error) {
      console.error('Error handling emoji reaction:', error);
      addNotification({
        type: 'error',
        message: 'Failed to update reaction. Please try again.'
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!connected || !selectedPost || !newComment.trim()) return;

    try {
      await ensureUserExists(publicKey!.toString());
      setNewComment('');
      addNotification({
        type: 'success',
        message: 'Comment added successfully!'
      });
      fetchComments(selectedPost.id);
    } catch (error) {
      console.error('Error submitting comment:', error);
      addNotification({
        type: 'error',
        message: 'Failed to add comment. Please try again.'
      });
    }
  };

  const handleSendTip = async () => {
    if (!connected || !publicKey || !selectedPost) return;

    try {
      const recipientAddress = new PublicKey(selectedPost.users.wallet_address);
      const sender = publicKey;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipientAddress,
          lamports: tipAmount * LAMPORTS_PER_SOL
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      const { solana } = window as any;
      const signed = await solana.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signed.serialize());

      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      addNotification({
        type: 'success',
        message: `Tip of ${tipAmount} SOL sent successfully!`,
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
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <UserProfile 
          connected={connected}
          publicKey={publicKey?.toBase58() || null}
          isSubmitting={isSubmitting}
          onCreatePost={() => setPostModalOpen(true)}
          onConnectWallet={openModal}
        />

        <div className="md:col-span-3">
          <PostsList 
            posts={posts}
            loading={loading}
            error={error}
            connected={connected}
            currentUserWallet={publicKey?.toBase58() || null}
            onEmojiReaction={handleEmojiClick}
            onOpenComments={openCommentsModal}
            onOpenTip={openTipModal}
          />
        </div>
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        newPost={newPost}
        isSubmitting={isSubmitting}
        onClose={() => setPostModalOpen(false)}
        onPostChange={setNewPost}
        onSubmit={async () => {
          setIsSubmitting(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate post
            setPostModalOpen(false);
            setNewPost({
              content: '',
              twitter_embed: '',
              website: '',
              facebook: '',
              telegram: ''
            });
            fetchPosts();
            addNotification({
              type: 'success',
              message: 'Post created successfully!'
            });
          } catch {
            addNotification({
              type: 'error',
              message: 'Failed to create post. Please try again.'
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        transactionStatus={'idle'}
        error={''}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        post={selectedPost}
        comments={comments}
        newComment={newComment}
        connected={connected}
        onClose={() => setCommentsModalOpen(false)}
        onCommentChange={setNewComment}
        onSubmitComment={handleSubmitComment}
      />

      <TipModal
        isOpen={isTipModalOpen}
        post={selectedPost}
        tipAmount={tipAmount}
        onClose={() => setTipModalOpen(false)}
        onTipAmountChange={setTipAmount}
        onSendTip={handleSendTip}
      />
    </div>
  );
};

export default FanPage;
