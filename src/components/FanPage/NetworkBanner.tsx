import React from 'react';
import { AlertTriangle, Wifi, Globe, Zap } from 'lucide-react';

interface NetworkBannerProps {
  currentNetwork: 'devnet' | 'testnet' | 'mainnet';
  onNetworkChange: (network: 'devnet' | 'testnet' | 'mainnet') => void;
}

const NetworkBanner: React.FC<NetworkBannerProps> = ({ currentNetwork, onNetworkChange }) => {
  const networks = [
    {
      id: 'devnet' as const,
      name: 'DEVNET',
      icon: Wifi,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10',
      borderColor: 'border-accent-green/20',
      active: true
    },
    {
      id: 'testnet' as const,
      name: 'TESTNET',
      icon: Globe,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      active: false
    },
    {
      id: 'mainnet' as const,
      name: 'MAINNET',
      icon: Zap,
      color: 'text-accent-purple',
      bgColor: 'bg-accent-purple/10',
      borderColor: 'border-accent-purple/20',
      active: false
    }
  ];

  return (
    <div className="mb-6">
      {/* Warning Banner */}
      <div className="holographic p-4 mb-4 border-yellow-400/30 bg-yellow-400/10">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-yellow-400 font-display text-sm sm:text-base">
              ⚠️ DEVNET TESTING ENVIRONMENT
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary text-xs sm:text-sm">
              Mainnet launch date will be announced soon
            </p>
          </div>
        </div>
      </div>

      {/* Network Selection */}
      <div className="holographic p-4">
        <h3 className="text-sm font-display mb-3 text-text-light dark:text-white">Network Selection</h3>
        <div className="flex flex-wrap gap-2">
          {networks.map((network) => {
            const Icon = network.icon;
            const isActive = currentNetwork === network.id;
            
            return (
              <button
                key={network.id}
                onClick={() => onNetworkChange(network.id)}
                disabled={!network.active}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-display transition-all ${
                  isActive
                    ? `${network.bgColor} ${network.borderColor} border ${network.color}`
                    : network.active
                    ? 'bg-white/5 border border-white/10 text-text-secondary-light dark:text-text-secondary hover:bg-white/10'
                    : 'bg-white/5 border border-white/10 text-text-secondary-light dark:text-text-secondary opacity-50 cursor-not-allowed'
                }`}
              >
                <Icon size={14} />
                {network.name}
                {!network.active && (
                  <span className="text-xs opacity-70">(Soon)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;