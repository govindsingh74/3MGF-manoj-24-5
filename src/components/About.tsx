import React, { useRef, useEffect } from 'react';
import { Coins, Shield, Rocket } from 'lucide-react';

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const features = document.querySelectorAll('.feature-card');
    features.forEach((feature) => observer.observe(feature));

    return () => {
      features.forEach((feature) => observer.unobserve(feature));
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="section">
      <h2 className="section-title">What is MGF?</h2>
      
      <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="text-xl mb-8">
          <span className="text-accent-purple font-display">MGF</span> is a memecoin inspired by the legendary Mt. Gox exchange hack, reborn on the Solana blockchain.
        </p>
        
        <div className="text-text-secondary mb-8">
          <p className="mb-4">
            In 2014, Mt. Gox, once the world's leading Bitcoin exchange, collapsed after losing 850,000 BTC to hackers. It became crypto's most notorious hack—a cautionary tale that shaped an industry.
          </p>
          <p>
            Now, we're reclaiming this piece of crypto history through the power of memes. MGF represents resilience, community, and the unstoppable spirit of crypto culture.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="feature-card opacity-0 transition-all duration-700 delay-100 transform translate-y-8 holographic p-6">
          <div className="w-12 h-12 mb-4 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <Coins className="text-accent-purple" size={24} />
          </div>
          <h3 className="text-xl font-display mb-3">Community Driven</h3>
          <p className="text-text-secondary">
            MGF is 100% community-owned with no team allocation. Power to the meme makers!
          </p>
        </div>
        
        <div className="feature-card opacity-0 transition-all duration-700 delay-300 transform translate-y-8 holographic p-6">
          <div className="w-12 h-12 mb-4 rounded-full bg-accent-green/20 flex items-center justify-center">
            <Shield className="text-accent-green" size={24} />
          </div>
          <h3 className="text-xl font-display mb-3">Solana Powered</h3>
          <p className="text-text-secondary">
            Built on Solana for lightning-fast transactions and minimal fees.
          </p>
        </div>
        
        <div className="feature-card opacity-0 transition-all duration-700 delay-500 transform translate-y-8 holographic p-6">
          <div className="w-12 h-12 mb-4 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <Rocket className="text-accent-purple" size={24} />
          </div>
          <h3 className="text-xl font-display mb-3">Meme Utility</h3>
          <p className="text-text-secondary">
            Exclusive NFTs, meme contests, and community events for holders.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;