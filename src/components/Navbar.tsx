import React, { useState, useEffect } from 'react';
import { Menu, X, Wallet, Zap, Shield, Cpu, LineChart, Users } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected, publicKey, openModal } = useWallet();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { path: '/about', label: 'About', icon: Shield },
    { path: '/tokenomics', label: 'Tokenomics', icon: LineChart },
    { path: '/roadmap', label: 'Roadmap', icon: Cpu },
    { path: '/nft-vault', label: 'NFT Vault', icon: Zap },
    { path: '/fan-page', label: 'Fan Page', icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo design.png" alt="Logo" className="h-8 w-8 mr-2" />
            <div className="text-2xl font-display font-bold">
              <span className="text-accent-purple">M</span>
              <span className="text-white">G</span>
              <span className="text-accent-green">F</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-accent-purple/20 text-accent-purple'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {connected ? (
              <div className="px-4 py-2 rounded-lg bg-accent-green/10 text-accent-green">
                <span className="font-mono text-sm">
                  {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={openModal}
                className="ml-4 px-6 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple/90 text-white flex items-center space-x-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                <Wallet size={16} />
                <span>Connect</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isActive(item.path)
                      ? 'bg-accent-purple/20 text-accent-purple'
                      : 'text-text-secondary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {!connected && (
              <button
                onClick={() => {
                  openModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mt-4 px-6 py-2 rounded-lg bg-accent-purple text-white flex items-center justify-center space-x-2"
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;