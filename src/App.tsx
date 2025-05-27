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
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-primary text-white font-sans overflow-hidden">
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-primary opacity-90"></div>
            <div className="matrix-background"></div>
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
          </div>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;