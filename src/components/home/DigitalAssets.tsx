import React from 'react';
import { Shield, Wallet, ArrowRight, Gem, Code, Coins } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

const DigitalAssets: React.FC = () => {
  const { openModal } = useWallet();

  const marketDistribution = [
    { name: 'Memecoins', percentage: 35, color: '#9945FF' },
    { name: 'Altcoins', percentage: 25, color: '#14F195' },
    { name: 'RWA Tokens', percentage: 15, color: '#5D5FEF' },
    { name: 'L1 Chains', percentage: 15, color: '#F472B6' },
    { name: 'L2 Solutions', percentage: 10, color: '#FB923C' },
  ];

  const utilities = [
    {
      icon: Gem,
      title: 'NFT Ecosystem',
      description: 'Exclusive NFT collections with real utility, including governance rights, staking benefits, and access to premium features.',
      color: '#9945FF'
    },
    {
      icon: Code,
      title: 'Token Creator',
      description: 'User-friendly platform for creating and launching custom tokens on Solana with built-in security features and compliance tools.',
      color: '#14F195'
    },
    {
      icon: Coins,
      title: 'DeFi Integration',
      description: 'Seamless integration with major DeFi protocols, enabling staking, yield farming, and liquidity provision.',
      color: '#5D5FEF'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/90"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-4xl font-display mb-6">
              Digital Assets for the Future
            </h2>
            <p className="text-text-secondary mb-8">
              Join the revolution of decentralized finance with MGF's innovative digital assets and NFT ecosystem.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-display mb-2">Secure Storage</h3>
                  <p className="text-text-secondary">
                    Your assets are protected by industry-leading security protocols
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-lg font-display mb-2">Easy Management</h3>
                  <p className="text-text-secondary">
                    Intuitive interface for managing your digital assets
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={openModal}
              className="mt-8 btn btn-primary flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="relative">
            <div className="holographic p-8">
              <h3 className="text-2xl font-display mb-6 text-center">Market Distribution</h3>
              <div className="space-y-4">
                {marketDistribution.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className="font-display">{item.name}</span>
                      <span className="font-display" style={{ color: item.color }}>
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-primary/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.color}50`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MGF Utilities */}
        <div className="mt-24">
          <h2 className="text-4xl font-display mb-12 text-center">MGF Utilities</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {utilities.map((utility, index) => {
              const Icon = utility.icon;
              return (
                <div
                  key={index}
                  className="holographic p-6 text-center transform hover:scale-105 transition-all duration-300"
                  style={{
                    borderColor: utility.color,
                    boxShadow: `0 0 20px ${utility.color}20`
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${utility.color}20` }}
                    >
                      <Icon size={32} color={utility.color} />
                    </div>
                  </div>
                  <h3 className="text-xl font-display mb-3">{utility.title}</h3>
                  <p className="text-text-secondary">{utility.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalAssets;