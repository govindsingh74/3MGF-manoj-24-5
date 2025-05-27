import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

interface NFT {
  id: number;
  name: string;
  image: string;
  description: string;
  rarity: string;
}

const NftVault: React.FC = () => {
  const { openModal, connected } = useWallet();
  const [activeNft, setActiveNft] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nfts: NFT[] = [
    {
      id: 1,
      name: 'Lost Bitcoin',
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'A commemorative NFT symbolizing the lost bitcoins from the Mt. Gox hack.',
      rarity: 'Common'
    },
    {
      id: 2,
      name: 'Vault Breach',
      image: 'https://images.pexels.com/photos/6766363/pexels-photo-6766363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Depicts the moment hackers breached the Mt. Gox security systems.',
      rarity: 'Rare'
    },
    {
      id: 3,
      name: 'Rebirth Phoenix',
      image: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'A phoenix rising from the ashes, symbolizing MGF rebirth from Mt. Gox downfall.',
      rarity: 'Legendary'
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const cards = containerRef.current.querySelectorAll('.nft-card');
      cards.forEach((card: Element) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / 10;
        const deltaY = (y - centerY) / 10;
        
        const htmlCard = card as HTMLElement;
        htmlCard.style.transform = `perspective(1000px) rotateY(${deltaX}deg) rotateX(${-deltaY}deg)`;
      });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  return (
    <section id="nft-vault" className="section">
      <h2 className="section-title">NFT Vault</h2>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xl mb-4">
            Exclusive NFTs commemorating the Mt. Gox saga and MGF rebirth
          </p>
          <p className="text-text-secondary max-w-3xl mx-auto">
            Our NFT collection represents key moments from the Mt. Gox history and celebrates the memecoin's resurrection. Each NFT grants exclusive community access and future benefits.
          </p>
        </div>
        
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {nfts.map((nft) => (
            <div 
              key={nft.id}
              className={`nft-card group perspective-1000 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
                activeNft === nft.id ? 'ring-2 ring-accent-purple' : ''
              }`}
              onClick={() => setActiveNft(activeNft === nft.id ? null : nft.id)}
            >
              <div className="relative transform-style-3d preserve-3d transition-transform duration-500 ease-out">
                <div className="relative overflow-hidden rounded-xl neon-border">
                  <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/30 to-primary/70 z-10"></div>
                  <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-xl font-display">{nft.name}</h3>
                        <div className="flex items-center mt-1">
                          <div 
                            className={`w-2 h-2 rounded-full mr-2 ${
                              nft.rarity === 'Common' ? 'bg-blue-400' : 
                              nft.rarity === 'Rare' ? 'bg-purple-400' : 'bg-yellow-400'
                            }`}
                          ></div>
                          <span className="text-sm">{nft.rarity}</span>
                        </div>
                      </div>
                      <div className="text-sm font-display px-2 py-1 rounded bg-primary/50 backdrop-blur-sm">
                        #{nft.id.toString().padStart(3, '0')}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Info */}
                {activeNft === nft.id && (
                  <div className="mt-4 p-4 bg-primary/80 backdrop-blur-md rounded-lg neon-border">
                    <p className="text-text-secondary mb-4">{nft.description}</p>
                    {connected ? (
                      <button className="w-full btn btn-primary">
                        Mint NFT (Coming Soon)
                      </button>
                    ) : (
                      <button onClick={(e) => {
                        e.stopPropagation();
                        openModal();
                      }} className="w-full btn btn-outline">
                        Connect Wallet to Mint
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 p-8 holographic text-center">
          <h3 className="text-2xl font-display mb-4">Coming Soon</h3>
          <p className="text-text-secondary mb-6">
            The full MGF NFT collection will be available for minting soon. Connect your wallet and join our community to get early access.
          </p>
          {!connected && (
            <button onClick={openModal} className="btn btn-primary mx-auto">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default NftVault;