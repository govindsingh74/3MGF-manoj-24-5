import React from 'react';
import { Twitter, Github, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 bg-primary/80 border-t border-accent-purple/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-display mb-4">
              <span className="text-accent-purple">M</span>
              <span className="text-white">G</span>
              <span className="text-accent-green">F</span>
            </h3>
            <p className="text-text-secondary">
              Mt. Gox Funds - The legendary exchange hack reborn as a Solana memecoin.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center border border-accent-purple/30 hover:border-accent-purple transition-all hover:bg-accent-purple/10"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center border border-accent-purple/30 hover:border-accent-purple transition-all hover:bg-accent-purple/10"
              >
                <Send size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full flex items-center justify-center border border-accent-purple/30 hover:border-accent-purple transition-all hover:bg-accent-purple/10"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-display mb-4">Quick Links</h4>
            <ul className="space-y-2 text-text-secondary">
              <li>
                <a href="#about" className="hover:text-accent-green transition-colors">
                  About MGF
                </a>
              </li>
              <li>
                <a href="#tokenomics" className="hover:text-accent-green transition-colors">
                  Tokenomics
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-accent-green transition-colors">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#nft-vault" className="hover:text-accent-green transition-colors">
                  NFT Vault
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-display mb-4">Stay Updated</h4>
            <p className="text-text-secondary mb-4">
              Subscribe to our newsletter for the latest updates on MGF.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-primary/60 border border-accent-purple/30 rounded-l-md py-2 px-4 focus:outline-none focus:border-accent-purple w-full"
              />
              <button className="bg-accent-purple text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-accent-purple/10 text-center text-text-secondary text-sm">
          <p>© 2025 Mt. Gox Funds (MGF). All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-accent-green transition-colors">
              Privacy Policy
            </a>
            {' • '}
            <a href="#" className="hover:text-accent-green transition-colors">
              Terms of Service
            </a>
          </p>
          <p className="mt-4 text-xs opacity-60">
            MGF is a memecoin for entertainment purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;