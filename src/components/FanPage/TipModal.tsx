import React from 'react';
import { X } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPost: any;
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  handleTip: () => void;
}

const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  selectedPost,
  tipAmount,
  setTipAmount,
  handleTip
}) => {
  if (!isOpen || !selectedPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-md rounded-xl neon-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-text-light dark:text-white">Send Tip</h3>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-text-light dark:text-white">Recipient</label>
            <div className="p-3 bg-white/5 rounded-lg font-mono text-sm text-accent-green break-all">
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

          <button onClick={handleTip} className="btn btn-primary w-full">
            Send {tipAmount} SOL
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;
