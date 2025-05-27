import React, { useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import StatsCounter from './StatsCounter';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { openModal } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<{
    nodes: { x: number; y: number; connections: number[]; active: boolean }[];
    animationFrame: number;
    isAnimating: boolean;
  }>({ nodes: [], animationFrame: 0, isAnimating: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // G30 country positions (normalized coordinates)
    const initNodes = () => {
      const nodes = [
        { x: 0.2, y: 0.3, connections: [1, 4, 7], active: false },    // USA
        { x: 0.5, y: 0.2, connections: [0, 2, 5], active: false },    // UK
        { x: 0.6, y: 0.25, connections: [1, 3, 6], active: false },   // Germany
        { x: 0.8, y: 0.3, connections: [2, 5, 8], active: false },    // Japan
        { x: 0.3, y: 0.4, connections: [0, 5, 9], active: false },    // Canada
        { x: 0.5, y: 0.4, connections: [1, 3, 4], active: false },    // France
        { x: 0.6, y: 0.45, connections: [2, 7, 8], active: false },   // Italy
        { x: 0.4, y: 0.6, connections: [0, 6, 9], active: false },    // Brazil
        { x: 0.7, y: 0.5, connections: [3, 6, 9], active: false },    // China
        { x: 0.5, y: 0.7, connections: [4, 7, 8], active: false }     // Australia
      ];

      networkRef.current.nodes = nodes.map(node => ({
        x: node.x * canvas.width,
        y: node.y * canvas.height,
        connections: node.connections,
        active: false
      }));
    };

    const startChainReaction = () => {
      if (networkRef.current.isAnimating) return;
      
      networkRef.current.isAnimating = true;
      networkRef.current.nodes[0].active = true;

      const animate = (currentNode: number, depth: number = 0) => {
        if (depth > 10) {
          networkRef.current.isAnimating = false;
          return;
        }

        setTimeout(() => {
          const node = networkRef.current.nodes[currentNode];
          node.connections.forEach(targetIndex => {
            networkRef.current.nodes[targetIndex].active = true;
            animate(targetIndex, depth + 1);
          });

          setTimeout(() => {
            node.active = false;
          }, 1000);
        }, 500);
      };

      animate(0);
    };

    const drawNetwork = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      networkRef.current.nodes.forEach((node, i) => {
        if (node.active) {
          node.connections.forEach(j => {
            const target = networkRef.current.nodes[j];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(20, 241, 149, ${node.active ? 0.8 : 0.1})`;
            ctx.lineWidth = node.active ? 2 : 1;
            ctx.stroke();
          });
        }
      });

      // Draw nodes
      networkRef.current.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.active ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = node.active ? 'rgba(20, 241, 149, 0.8)' : 'rgba(147, 51, 234, 0.3)';
        ctx.fill();
      });

      networkRef.current.animationFrame = requestAnimationFrame(drawNetwork);
    };

    initNodes();
    drawNetwork();

    // Add click handler to MGF logo
    const logoElement = document.querySelector('.mgf-logo');
    if (logoElement) {
      logoElement.addEventListener('click', startChainReaction);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(networkRef.current.animationFrame);
      if (logoElement) {
        logoElement.removeEventListener('click', startChainReaction);
      }
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-40"
      />
      
      <div ref={containerRef} className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center z-10">
        <div className="text-center md:text-left">
          <div className="inline-block relative mb-2">
            <span className="text-sm font-display py-1 px-3 rounded-full bg-alert/20 text-white">
              Solana Memecoin
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4 glitch-text" data-text="MGF">
            <span className="text-accent-purple">M</span>t. <span className="text-accent-purple">G</span>ox <span className="text-accent-purple">F</span>unds
          </h1>
          
          <p className="text-xl md:text-2xl mb-6 text-text-secondary">
            Reclaim the Memes of Mt. Gox!
          </p>
          
          <p className="mb-8 text-text-secondary max-w-lg mx-auto md:mx-0">
            The legendary exchange hack reborn as a Solana memecoin. Join the revolution and become part of crypto history once again.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <button onClick={openModal} className="btn btn-primary">
              Connect Wallet
            </button>
            <a href="#about" className="btn btn-outline flex items-center justify-center gap-2">
              Learn More <ArrowRight size={16} />
            </a>
          </div>
          
          <div className="mt-10 grid grid-cols-3 gap-6">
            <StatsCounter label="Supply" value={420000000} suffix="M" />
            <StatsCounter label="Holders" value={8721} />
            <StatsCounter label="Burned" value={69420000} suffix="M" />
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-accent-purple/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute w-48 h-48 bg-accent-green/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '-1.5s' }}></div>
            
            <div className="relative z-10 w-72 h-72 holographic rounded-full overflow-hidden neon-border flex items-center justify-center animate-float cursor-pointer mgf-logo">
              <div className="text-7xl font-display font-bold">
                <span className="text-accent-purple">M</span>
                <span className="text-accent-green">G</span>
                <span className="text-accent-purple">F</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;