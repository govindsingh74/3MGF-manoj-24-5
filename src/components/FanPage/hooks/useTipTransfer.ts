import { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TransactionStatus } from '../types';

export const useTipTransfer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState('');

  const sendTip = async (
    recipientWalletAddress: string,
    tipAmount: number,
    senderPublicKey: PublicKey,
    connection: Connection
  ) => {
    if (tipAmount <= 0) {
      throw new Error('Tip amount must be greater than 0');
    }

    if (tipAmount < 0.001) {
      throw new Error('Minimum tip amount is 0.001 SOL');
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

      // Validate recipient address
      let recipientPublicKey: PublicKey;
      try {
        recipientPublicKey = new PublicKey(recipientWalletAddress);
      } catch (error) {
        throw new Error('Invalid recipient wallet address');
      }

      // Check if sender has enough balance
      const balance = await connection.getBalance(senderPublicKey);
      const tipAmountLamports = tipAmount * LAMPORTS_PER_SOL;
      const estimatedFee = 5000; // Estimated transaction fee in lamports

      if (balance < tipAmountLamports + estimatedFee) {
        throw new Error('Insufficient balance for tip and transaction fee');
      }

      // Create tip transaction
      setTransactionStatus('sending');
      const transaction = new Transaction();
      
      // Add tip transfer instruction
      const tipInstruction = SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: tipAmountLamports,
      });
      
      transaction.add(tipInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign and send transaction
      const signedTransaction = await solana.signTransaction(transaction);
      
      setTransactionStatus('confirming');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setTransactionStatus('idle');
      return {
        success: true,
        txHash: signature,
        amount: tipAmount,
        recipient: recipientWalletAddress
      };

    } catch (error: any) {
      console.error('Error sending tip:', error);
      setError(error.message || 'Failed to send tip');
      setTransactionStatus('idle');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sendTip,
    isSubmitting,
    transactionStatus,
    error,
    setError
  };
};