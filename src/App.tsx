import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Tokenomics from './pages/Tokenomics';
import Roadmap from './pages/Roadmap';
import NftVault from './pages/NftVault';
import Contact from './pages/Contact';
import FanPage from './pages/FanPage';
import WalletModal from './components/WalletModal';
import { WalletProvider } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-primary-light dark:bg-primary text-text-light dark:text-text font-sans">
            <div className="fixed inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-light to-primary-light/90 dark:from-primary dark:to-primary/90"></div>
              <div className="absolute inset-0 bg-tech-pattern opacity-10"></div>
            </div>
            <div className="relative z-10">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/tokenomics" element={<Tokenomics />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/nft-vault" element={<NftVault />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/fan-page" element={<FanPage />} />
                </Routes>
              </main>
              <Footer />
              <WalletModal />
            </div>
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;