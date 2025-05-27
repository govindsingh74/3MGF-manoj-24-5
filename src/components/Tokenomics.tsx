import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Wallet, Lock, Rocket, Users } from 'lucide-react';

const Tokenomics: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const tokenomics = [
    { 
      name: 'Community Airdrop',
      value: 40,
      color: '#9945FF',
      icon: Users,
      details: 'Fair distribution to early supporters'
    },
    { 
      name: 'Liquidity',
      value: 30,
      color: '#14F195',
      icon: Wallet,
      details: 'Locked for 2 years'
    },
    { 
      name: 'Marketing',
      value: 20,
      color: '#5D5FEF',
      icon: Rocket,
      details: 'Strategic partnerships & growth'
    },
    { 
      name: 'Development',
      value: 10,
      color: '#F472B6',
      icon: Lock,
      details: 'Platform development & maintenance'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="tokenomics" ref={sectionRef} className="section">
      <h2 className="section-title">Tokenomics</h2>
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <div className="space-y-6">
            {tokenomics.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="holographic p-4 transition-all duration-500 hover:scale-105"
                  style={{
                    transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon size={24} color={item.color} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg">{item.name}</h3>
                      <p className="text-text-secondary text-sm">{item.details}</p>
                    </div>
                    <span 
                      className="text-2xl font-display"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-primary/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1500 ease-out"
                      style={{ 
                        width: isVisible ? `${item.value}%` : '0%',
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}50`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 p-6 holographic backdrop-blur-md">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-display text-lg">Token Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Initial Supply:</span>
                    <span>21B MGF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Network:</span>
                    <span>Solana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span>SPL Token</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-display text-lg">Security</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Audit Status:</span>
                    <span className="text-accent-green">Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">LP Lock:</span>
                    <span>2 Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tax:</span>
                    <span>0/0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-1 md:order-2">
          <div className="relative aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-gradient-radial from-accent-purple/20 to-transparent animate-pulse-slow"></div>
            
            {/* Circular Progress */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {tokenomics.map((item, index) => {
                const circumference = 2 * Math.PI * 40; // radius is 40
                const offset = circumference - (item.value / 100) * circumference;
                const rotation = tokenomics
                  .slice(0, index)
                  .reduce((acc, curr) => acc + curr.value, 0) * 3.6;
                
                return (
                  <circle
                    key={index}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: isVisible ? offset : circumference,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: '50% 50%',
                      transitionDelay: `${index * 0.2}s`
                    }}
                    stroke={item.color}
                    strokeWidth="8"
                    fill="none"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                );
              })}
              
              {/* Center Circle */}
              <circle
                r="32"
                cx="50"
                cy="50"
                fill="#0a0c20"
                className="animate-pulse"
              />
              
              {/* MGF Text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy=".3em"
                className="font-display text-3xl"
                fill="#9945FF"
              >
                MGF
              </text>
            </svg>
            
            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: tokenomics[i % tokenomics.length].color,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${2 + Math.random() * 3}s linear infinite`,
                    animationDelay: `${-Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;