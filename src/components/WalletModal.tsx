import React from 'react';
import { X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const WalletModal: React.FC = () => {
  const { isModalOpen, closeModal, connectWallet } = useWallet();

  if (!isModalOpen) return null;

  const wallets = [
    {
      name: 'Phantom',
      icon: 'https://phantom.app/img/phantom-logo.svg',
    },
    {
      name: 'Solflare',
      icon: 'https://solflare.com/assets/logo.svg',
    },
    {
      name: 'Backpack',
      icon: 'https://mma.prnewswire.com/media/1912652/BACKPACK_LOGO_Logo.jpg',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 bg-primary w-full max-w-md rounded-xl neon-border p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display text-accent-purple">Connect Wallet</h3>
          <button onClick={closeModal} className="text-text-secondary hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={connectWallet}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors border border-accent-purple/30 hover:border-accent-purple"
            >
              <span className="font-display">{wallet.name}</span>
              <img src={wallet.icon} alt={wallet.name} className="h-6 w-6" />
            </button>
          ))}
        </div>

        <p className="mt-6 text-text-secondary text-sm text-center">
          By connecting your wallet, you agree to the Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default WalletModal;