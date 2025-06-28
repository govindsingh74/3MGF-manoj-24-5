import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const WalletModal: React.FC = () => {
  const { isModalOpen, closeModal, connectWallet } = useWallet();

  if (!isModalOpen) return null;

  const handlePhantomConnect = async () => {
    await connectWallet();
  };

  const handleInstallPhantom = () => {
    window.open('https://phantom.app/', '_blank');
  };

  const isPhantomInstalled = () => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).solana?.isPhantom;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 bg-primary-light dark:bg-primary w-full max-w-md rounded-xl neon-border p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-accent-purple">Connect Wallet</h3>
          <button onClick={closeModal} className="text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {isPhantomInstalled() ? (
            <button
              onClick={handlePhantomConnect}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors border border-accent-purple/30 hover:border-accent-purple"
            >
              <span className="font-display">Phantom Wallet</span>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-accent-purple/10 rounded-lg border border-accent-purple/20">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary mb-3">
                  Phantom wallet not detected. Please install Phantom to continue.
                </p>
                <button
                  onClick={handleInstallPhantom}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors"
                >
                  Install Phantom <ExternalLink size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary">
              Other wallets coming soon...
            </p>
          </div>
        </div>

        <p className="mt-6 text-text-secondary-light dark:text-text-secondary text-sm text-center">
          By connecting your wallet, you agree to the Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default WalletModal;