import React from 'react';
import { Plus } from 'lucide-react';
import { formatWalletAddress } from './utils';

interface UserProfileProps {
  connected: boolean;
  publicKey: string | null;
  isSubmitting: boolean;
  onCreatePost: () => void;
  onConnectWallet: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  connected,
  publicKey,
  isSubmitting,
  onCreatePost,
  onConnectWallet
}) => {
  return (
    <div className="holographic p-4 sticky top-24">
      {connected ? (
        <>
          <h2 className="text-lg font-display mb-3 text-text-light dark:text-white">Your Profile</h2>
          <div className="text-xs font-mono mb-3 text-accent-green break-all">
            {formatWalletAddress(publicKey || '')}
          </div>
          <button
            onClick={onCreatePost}
            className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
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
          <button onClick={onConnectWallet} className="btn btn-primary text-sm py-2">
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;