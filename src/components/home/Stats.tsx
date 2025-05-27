import React from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';

const Stats: React.FC = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: '420K+',
      label: 'Total Volume',
      color: 'text-accent-purple'
    },
    {
      icon: Users,
      value: '50K+',
      label: 'Community Members',
      color: 'text-accent-green'
    },
    {
      icon: Zap,
      value: '1.2M',
      label: 'Transactions',
      color: 'text-accent-purple'
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary"></div>
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="holographic p-6 text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <div className="text-3xl font-display mb-2">{stat.value}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;