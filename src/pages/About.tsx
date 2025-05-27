import React from 'react';
import { Shield, Users, Lightbulb, Rocket } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display mb-6">About MGF</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Reclaiming crypto's history through innovation and community power
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-24">
          <div className="holographic p-8 mb-12">
            <h2 className="text-3xl font-display mb-6">Our Story</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg mb-4">
                The Mt. Gox incident of 2014 marked a pivotal moment in cryptocurrency history. The loss of 850,000 BTC served as a crucial lesson about the importance of security, transparency, and community trust in the crypto space.
              </p>
              <p className="text-lg mb-4">
                MGF emerges from this legacy not to dwell on past mistakes, but to build something new. We're transforming this cautionary tale into a symbol of resilience and innovation in the crypto community.
              </p>
              <p className="text-lg">
                By combining cutting-edge Solana technology with community-driven development, MGF represents the evolution of crypto culture - where lessons learned fuel future innovation.
              </p>
            </div>
          </div>
        </div>

        {/* Learning from History */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="holographic p-8">
            <h2 className="text-3xl font-display mb-6">Learning from History</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-display mb-2">Enhanced Security</h3>
                  <p className="text-text-secondary">
                    Implementing state-of-the-art security measures and regular audits to protect our community's assets
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-4 h-4 text-accent-green" />
                </div>
                <div>
                  <h3 className="text-xl font-display mb-2">Community First</h3>
                  <p className="text-text-secondary">
                    Prioritizing transparency and community governance in all decisions
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Lightbulb className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-display mb-2">Innovation Focus</h3>
                  <p className="text-text-secondary">
                    Continuously developing new features and use cases for our community
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="holographic p-8">
            <h2 className="text-3xl font-display mb-6">Community Power</h2>
            <div className="space-y-6">
              <p className="text-lg text-text-secondary">
                MGF is more than a token - it's a community-driven ecosystem where every holder has a voice in shaping our future.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-accent-purple/10 rounded-lg">
                  <div className="text-3xl font-display text-accent-purple mb-2">50K+</div>
                  <div className="text-sm">Active Members</div>
                </div>
                <div className="text-center p-4 bg-accent-green/10 rounded-lg">
                  <div className="text-3xl font-display text-accent-green mb-2">100+</div>
                  <div className="text-sm">Community Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Potential */}
        <div className="holographic p-8">
          <h2 className="text-3xl font-display mb-8 text-center">MGF Potential</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-accent-purple" />
              </div>
              <h3 className="text-xl font-display mb-2">Ecosystem Growth</h3>
              <p className="text-text-secondary">
                Expanding into DeFi, NFTs, and cross-chain applications
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-green" />
              </div>
              <h3 className="text-xl font-display mb-2">Community Expansion</h3>
              <p className="text-text-secondary">
                Building the most engaged community in crypto
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent-purple" />
              </div>
              <h3 className="text-xl font-display mb-2">Technology Leadership</h3>
              <p className="text-text-secondary">
                Pioneering new standards in blockchain technology
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;