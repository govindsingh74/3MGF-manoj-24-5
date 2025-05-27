import React, { useState, useEffect } from 'react';

interface StatsCounterProps {
  label: string;
  value: number;
  suffix?: string;
  duration?: number;
}

const StatsCounter: React.FC<StatsCounterProps> = ({ 
  label, 
  value, 
  suffix = '', 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const totalMilSecDur = duration;
    const incrementTime = (totalMilSecDur / end) * 1000;
    
    // Don't start animation immediately
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);
      
      return () => {
        clearInterval(timer);
      };
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [value, duration]);

  const formattedValue = count.toLocaleString();

  return (
    <div className="text-center">
      <div className="font-display text-xl md:text-2xl font-bold">
        <span className="text-white">{formattedValue}</span>
        <span className="text-accent-green">{suffix}</span>
      </div>
      <div className="text-text-secondary text-sm">{label}</div>
    </div>
  );
};

export default StatsCounter;