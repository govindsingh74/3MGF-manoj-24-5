import React, { useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import StatsCounter from './StatsCounter';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { openModal } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const colors = ['#14F195', '#9333EA', '#F59E0B', '#3B82F6', '#EF4444', '#10B981'];
    const particles: {
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      color: string;
    }[] = [];

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 20; i++) {
        const radius = 8 + Math.random() * 6;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        const dx = (Math.random() - 0.5) * 2;
        const dy = (Math.random() - 0.5) * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({ x, y, radius, dx, dy, color });
      }
    };

    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x + p.radius > canvas.width || p.x - p.radius < 0) p.dx *= -1;
        if (p.y + p.radius > canvas.height || p.y - p.radius < 0) p.dy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const d = distance(p.x, p.y, other.x, other.y);
          if (d < p.radius + other.radius) {
            const newColor = colors[Math.floor(Math.random() * colors.length)];
            p.color = newColor;
            other.color = newColor;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-50"
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

            <div className="relative z-10 w-72 h-72 holographic rounded-full overflow-hidden neon-border flex items-center justify-center animate-float cursor-pointer">
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
