import React from 'react';
import { Cpu, Zap, Lock, Coins } from 'lucide-react';

const SolanaTechnology: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'High Performance',
      description: 'Lightning-fast transactions with Solana\'s proof-of-history consensus',
      color: 'text-accent-purple'
    },
    {
      icon: Zap,
      title: 'Low Fees',
      description: 'Minimal transaction costs on the Solana network',
      color: 'text-accent-green'
    },
    {
      icon: Lock,
      title: 'Secure Protocol',
      description: 'Advanced cryptography and decentralized security measures',
      color: 'text-accent-purple'
    },
    {
      icon: Coins,
      title: 'Token Standards',
      description: 'Built on Solana\'s robust SPL token framework',
      color: 'text-accent-green'
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display mb-6">Powered by Solana</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            MGF leverages Solana's cutting-edge blockchain technology to provide a seamless and efficient experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="holographic p-6 text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${feature.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-display mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolanaTechnology;