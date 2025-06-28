import React from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Post, TransactionStatus } from './types';

interface TipModalProps {
  isOpen: boolean;
  post: Post | null;
  tipAmount: number;
  isSubmitting: boolean;
  transactionStatus: TransactionStatus;
  error: string;
  onClose: () => void;
  onTipAmountChange: (amount: number) => void;
  onSendTip: () => void;
}

const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  post,
  tipAmount,
  isSubmitting,
  transactionStatus,
  error,
  onClose,
  onTipAmountChange,
  onSendTip
}) => {
  if (!isOpen || !post) return null;

  const getTransactionStatusMessage = () => {
    switch (transactionStatus) {
      case 'signing':
        return 'Preparing transaction...';
      case 'sending':
        return 'Sending transaction...';
      case 'confirming':
        return 'Confirming transfer...';
      default:
        return isSubmitting ? 'Processing...' : `Send ${tipAmount} SOL`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && onClose()} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-md rounded-xl neon-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-text-light dark:text-white">Send Tip</h3>
          <button 
            onClick={() => !isSubmitting && onClose()}
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-text-light dark:text-white">Recipient</label>
            <div className="p-3 bg-white/5 rounded-lg font-mono text-sm text-accent-green break-all">
              {post.users.wallet_address}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-text-light dark:text-white">Amount (SOL)</label>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => onTipAmountChange(parseFloat(e.target.value) || 0.001)}
              min="0.001"
              step="0.001"
              className="w-full bg-white/5 border border-accent-purple/20 rounded-lg p-3 focus:outline-none focus:border-accent-purple text-text-light dark:text-white text-sm disabled:opacity-50"
              disabled={isSubmitting}
            />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary mt-1">
              Minimum: 0.001 SOL
            </p>
          </div>

          <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3">
            <p className="text-xs text-text-light dark:text-white mb-2">
              <strong>Transaction Details:</strong>
            </p>
            <div className="space-y-1 text-xs text-text-secondary-light dark:text-text-secondary">
              <div className="flex justify-between">
                <span>Tip Amount:</span>
                <span>{tipAmount} SOL</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span>~0.000005 SOL</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSendTip}
            disabled={isSubmitting || tipAmount <= 0}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Clock size={16} className="animate-spin" />}
            {getTransactionStatusMessage()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;