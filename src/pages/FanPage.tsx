import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import NotificationSystem from '../components/fanpage/NotificationSystem';
import GlobalActivityNotifications from '../components/fanpage/GlobalActivityNotifications';
import NetworkBanner from '../components/fanpage/NetworkBanner';
import UserProfile from '../components/fanpage/UserProfile';
import EnhancedPostsList from '../components/fanpage/EnhancedPostsList';
import CreatePostModal from '../components/fanpage/CreatePostModal';
import CommentsModal from '../components/fanpage/CommentsModal';
import TipModal from '../components/fanpage/TipModal';
import { useNotifications } from '../components/fanpage/hooks/useNotifications';
import { useEnhancedPosts } from '../components/fanpage/hooks/useEnhancedPosts';
import { useComments } from '../components/fanpage/hooks/useComments';
import { usePostCreation } from '../components/fanpage/hooks/usePostCreation';
import { useTipTransfer } from '../components/fanpage/hooks/useTipTransfer';
import { Post, NewPost } from '../components/fanpage/types';
import { createClient } from '@supabase/supabase-js'; 

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FanPage: React.FC = () => {
  const { connected, openModal, publicKey, connection } = useWallet();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { 
    posts, 
    loading, 
    loadingMore, 
    error, 
    hasMore, 
    fetchPosts, 
    ensureUserExists, 
    handleEmojiReaction,
    loadMore 
  } = useEnhancedPosts();
  const { comments, fetchComments } = useComments();
  const { createPost, isSubmitting, transactionStatus, error: postError, setError } = usePostCreation();
  const { 
    sendTip, 
    isSubmitting: isTipSubmitting, 
    transactionStatus: tipTransactionStatus, 
    error: tipError, 
    setError: setTipError 
  } = useTipTransfer();

  const [currentNetwork, setCurrentNetwork] = useState<'devnet' | 'testnet' | 'mainnet'>('devnet');
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

  const handleNetworkChange = (network: 'devnet' | 'testnet' | 'mainnet') => {
    if (network === 'testnet' || network === 'mainnet') {
      addNotification({
        type: 'info',
        message: `${network.toUpperCase()} coming soon! Stay tuned for updates.`
      });
      return;
    }
    setCurrentNetwork(network);
  };

  const openCommentsModal = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalOpen(true);
    fetchComments(post.id);
  };

  const openTipModal = (post: Post) => {
    setSelectedPost(post);
    setTipModalOpen(true);
    setTipError('');
  };

  const handleEmojiClick = async (postId: string, emojiType: string) => {
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
      const userId = await ensureUserExists(publicKey!.toString());
      
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
    if (!connected || !selectedPost || !publicKey) {
      openModal();
      return;
    }

    try {
      setTipError('');
      const result = await sendTip(
        selectedPost.users.wallet_address,
        tipAmount,
        publicKey,
        connection
      );
      
      if (result.success) {
        setTipModalOpen(false);
        addNotification({
          type: 'success',
          message: `Successfully sent ${result.amount} SOL tip!`,
          txHash: result.txHash
        });
      }
    } catch (error: any) {
      console.error('Error sending tip:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to send tip. Please try again.'
      });
    }
  };

  const handleCreatePost = async () => {
    if (!connected || !publicKey) {
      openModal();
      return;
    }

    try {
      setError('');
      const result = await createPost(newPost, publicKey, connection, ensureUserExists);
      
      if (result.success) {
        setPostModalOpen(false);
        setNewPost({
          content: '',
          twitter_embed: '',
          website: '',
          facebook: '',
          telegram: ''
        });
        
        addNotification({
          type: 'success',
          message: 'Post created successfully!',
          txHash: result.txHash
        });
        
        // Refresh posts to show the new one
        fetchPosts(false);
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to create post. Please try again.'
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

      <GlobalActivityNotifications connected={connected} />

      <div className="max-w-4xl mx-auto">
        <NetworkBanner 
          currentNetwork={currentNetwork}
          onNetworkChange={handleNetworkChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <UserProfile 
            connected={connected}
            publicKey={publicKey?.toBase58() || null}
            isSubmitting={isSubmitting}
            onCreatePost={() => setPostModalOpen(true)}
            onConnectWallet={openModal}
          />

          <div className="md:col-span-3">
            <EnhancedPostsList 
              posts={posts}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
              hasMore={hasMore}
              connected={connected}
              currentUserWallet={publicKey?.toBase58() || null}
              onEmojiReaction={handleEmojiClick}
              onOpenComments={openCommentsModal}
              onOpenTip={openTipModal}
              onLoadMore={loadMore}
            />
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        newPost={newPost}
        isSubmitting={isSubmitting}
        transactionStatus={transactionStatus}
        error={postError}
        onClose={() => {
          setPostModalOpen(false);
          setError('');
        }}
        onPostChange={setNewPost}
        onSubmit={handleCreatePost}
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
        isSubmitting={isTipSubmitting}
        transactionStatus={tipTransactionStatus}
        error={tipError}
        onClose={() => {
          setTipModalOpen(false);
          setTipError('');
        }}
        onTipAmountChange={setTipAmount}
        onSendTip={handleSendTip}
      />
    </div>
  );
};

export default FanPage;