import { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { NewPost, TransactionStatus } from '../types';
import { PLATFORM_FEE_ADDRESS, PLATFORM_FEE } from '../constants';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const usePostCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState('');

  const createPost = async (
    newPost: NewPost,
    publicKey: PublicKey,
    connection: Connection,
    ensureUserExists: (walletAddress: string) => Promise<string>
  ) => {
    if (!newPost.content.trim()) {
      throw new Error('Post content is required');
    }

    setIsSubmitting(true);
    setError('');
    setTransactionStatus('signing');

    try {
      // Get the wallet adapter
      const { solana } = window as any;
      if (!solana || !solana.isPhantom) {
        throw new Error('Phantom wallet not found');
      }

      // Create payment transaction
      setTransactionStatus('sending');
      const transaction = new Transaction();
      
      // Add payment instruction
      const paymentInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(PLATFORM_FEE_ADDRESS),
        lamports: PLATFORM_FEE * LAMPORTS_PER_SOL, // Convert SOL to lamports
      });
      
      transaction.add(paymentInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signedTransaction = await solana.signTransaction(transaction);
      
      setTransactionStatus('confirming');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Save post to database
      setTransactionStatus('saving');
      const userId = await ensureUserExists(publicKey.toString());

      const { data: savedPost, error: saveError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: newPost.content.trim(),
          twitter_embed: newPost.twitter_embed.trim() || null,
          website: newPost.website.trim() || null,
          facebook: newPost.facebook.trim() || null,
          telegram: newPost.telegram.trim() || null,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving post:', saveError);
        throw new Error('Failed to save post to database');
      }

      setTransactionStatus('idle');
      return {
        success: true,
        post: savedPost,
        txHash: signature
      };

    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
      setTransactionStatus('idle');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPost,
    isSubmitting,
    transactionStatus,
    error,
    setError
  };
};