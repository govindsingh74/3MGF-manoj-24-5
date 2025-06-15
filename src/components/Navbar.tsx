import React, { useState, useEffect } from 'react';
import { Menu, X, Wallet, Zap, Shield, Cpu, LineChart, Users, LogOut } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected, publicKey, openModal, disconnectWallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Redirect to fan page when wallet connects
  useEffect(() => {
    if (connected && location.pathname === '/') {
      navigate('/');
    }
  }, [connected, location.pathname, navigate]);

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

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  const handleConnectClick = () => {
    console.log('Connect button clicked');
    openModal();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-primary-light/90 dark:bg-primary/90 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <img src="/logo design.png" alt="Logo" className="h-8 w-8" />
              <div className="flex space-x-1">
                <span className="text-accent-purple">M</span>
                <span className="text-text-light dark:text-white">G</span>
                <span className="text-accent-green">F</span>
              </div>
            </h3>
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
                      : 'text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <ThemeToggle />
            
            {connected ? (
              <div className="flex items-center space-x-2">
                <div className="px-4 py-2 rounded-lg bg-accent-green/10 text-accent-green">
                  <span className="font-mono text-sm">
                    {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                className="ml-4 px-6 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple/90 text-white flex items-center space-x-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                <Wallet size={16} />
                <span>Connect</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
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
        <div className="md:hidden bg-primary-light/95 dark:bg-primary/95 backdrop-blur-md">
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
                      : 'text-text-secondary-light dark:text-text-secondary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {connected ? (
              <div className="mt-4 space-y-2">
                <div className="px-4 py-2 rounded-lg bg-accent-green/10 text-accent-green text-center">
                  <span className="font-mono text-sm">
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleConnectClick();
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