import React from 'react';
import { Plus } from 'lucide-react';

const formatWalletAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

interface SidebarProps {
  connected: boolean;
  publicKey: string | { toString(): string } | null;
  openModal: () => void;
  setPostModalOpen: (open: boolean) => void;
  isSubmitting: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  connected,
  publicKey,
  openModal,
  setPostModalOpen,
  isSubmitting
}) => {
  return (
    <div className="md:col-span-1">
      <div className="holographic p-4 sticky top-24">
        {connected ? (
          <>
            <h2 className="text-lg font-display mb-3 text-text-light dark:text-white">Your Profile</h2>
            <div className="text-xs font-mono mb-3 text-accent-green break-all">
              {formatWalletAddress(publicKey?.toString() || '')}
            </div>
            <button
              onClick={() => setPostModalOpen(true)}
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
            <button onClick={openModal} className="btn btn-primary text-sm py-2">
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
