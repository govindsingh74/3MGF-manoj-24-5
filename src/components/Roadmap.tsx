import React, { useRef, useEffect, useState } from 'react';
import { CheckCircle, Circle, ArrowRight, Server, Globe, Shield, Cpu } from 'lucide-react';

interface RoadmapItem {
  phase: string;
  title: string;
  description: string;
  completed: boolean;
  items: string[];
  icon: React.ElementType;
  color: string;
}

const Roadmap: React.FC = () => {
  const [activePhase, setActivePhase] = useState(0);
  const roadmapRef = useRef<HTMLDivElement>(null);
  
  const roadmapItems: RoadmapItem[] = [
    {
      phase: 'Phase 1',
      title: 'System Initialization',
      description: 'Launch MGF token and establish core infrastructure',
      completed: true,
      icon: Server,
      color: '#14F195',
      items: [
        'Smart Contract Deployment',
        'Security Audit Completion',
        'Initial Liquidity Lock',
        'Community Node Setup'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Network Expansion',
      description: 'Scale ecosystem and enhance utility',
      completed: false,
      icon: Globe,
      color: '#9945FF',
      items: [
        'Cross-chain Bridge Development',
        'DEX Integration Protocol',
        'Governance System Launch',
        'Staking Protocol Implementation'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Protocol Hardening',
      description: 'Advanced security and scalability',
      completed: false,
      icon: Shield,
      color: '#5D5FEF',
      items: [
        'Zero-knowledge Proof Integration',
        'Layer 2 Scaling Solution',
        'Multi-sig Treasury Setup',
        'Advanced Security Protocols'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Quantum Evolution',
      description: 'Next-gen blockchain integration',
      completed: false,
      icon: Cpu,
      color: '#F472B6',
      items: [
        'AI-powered Trading System',
        'Quantum-resistant Encryption',
        'Metaverse Integration',
        'Cross-chain Atomic Swaps'
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (roadmapRef.current) {
        const items = roadmapRef.current.querySelectorAll('.roadmap-item');
        
        items.forEach((item, index) => {
          const rect = item.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
            setActivePhase(index);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="roadmap" className="section bg-gradient-to-b from-primary to-primary/80">
      <h2 className="section-title">Roadmap</h2>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Mobile Phase Selector */}
        <div className="md:hidden flex overflow-x-auto pb-4 space-x-3 mb-8">
          {roadmapItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActivePhase(index);
                const el = document.getElementById(`phase-${index}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-display transition-all ${
                index === activePhase
                  ? 'bg-accent-purple text-white'
                  : 'bg-white/5 text-text-secondary'
              }`}
            >
              {item.phase}
            </button>
          ))}
        </div>
        
        {/* Vertical Line for Desktop */}
        <div className="hidden md:block absolute left-[calc(50%-1px)] top-0 bottom-0 w-0.5 bg-accent-purple/30 z-0">
          <div 
            className="absolute w-full h-1/2 bg-gradient-to-b from-accent-purple to-accent-green"
            style={{
              top: `${(activePhase / (roadmapItems.length - 1)) * 100}%`,
              transition: 'top 0.5s ease-out'
            }}
          />
        </div>
        
        <div ref={roadmapRef} className="space-y-16 relative z-10">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                id={`phase-${index}`}
                key={index}
                className={`roadmap-item md:grid md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Marker (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${item.color}20`,
                      border: `2px solid ${item.color}`
                    }}
                  >
                    <Icon size={20} color={item.color} />
                  </div>
                </div>
                
                {/* Phase Content */}
                <div 
                  className={`p-6 holographic backdrop-blur-sm transition-all duration-500 ${
                    index % 2 === 1 ? 'md:text-right md:ml-auto' : 'md:text-left md:mr-auto'
                  }`}
                  style={{
                    borderColor: item.color,
                    boxShadow: `0 0 20px ${item.color}20`
                  }}
                >
                  <div className="flex items-center mb-2 gap-2">
                    {/* Timeline Marker (Mobile) */}
                    <div className="md:hidden">
                      {item.completed ? (
                        <CheckCircle className="text-accent-green w-5 h-5" />
                      ) : (
                        <Circle className="text-accent-purple w-5 h-5" />
                      )}
                    </div>
                    <span style={{ color: item.color }} className="font-display">
                      {item.phase}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-display mb-2">{item.title}</h3>
                  <p className="text-text-secondary mb-4">{item.description}</p>
                  
                  <ul className={`space-y-2 ${index % 2 === 1 ? 'md:ml-auto' : ''}`}>
                    {item.items.map((listItem, i) => (
                      <li 
                        key={i} 
                        className="flex items-center gap-2"
                        style={{
                          transform: `translateX(${activePhase >= index ? '0' : '-20px'})`,
                          opacity: activePhase >= index ? 1 : 0.5,
                          transition: `all 0.5s ease-out ${i * 0.1}s`
                        }}
                      >
                        <ArrowRight style={{ color: item.color }} className="w-4 h-4 flex-shrink-0" />
                        <span>{listItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Empty Cell for Grid Layout */}
                <div className="hidden md:block"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;