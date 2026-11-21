import React, { useState, useEffect } from 'react';

export const Clock: React.FC = React.memo(() => {
  const [time, setTime] = useState(new Date());
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setColonVisible(prev => !prev);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center text-xs tracking-widest font-mono font-medium text-[var(--color-gold)]">
      <span>{hours}</span>
      <span className={`mx-0.5 transition-opacity duration-200 ${colonVisible ? 'opacity-100' : 'opacity-20'}`}>
        :
      </span>
      <span>{minutes}</span>
      <span className={`mx-0.5 transition-opacity duration-200 ${colonVisible ? 'opacity-100' : 'opacity-20'}`}>
        :
      </span>
      <span className="text-[10px] opacity-80">{seconds}</span>
    </div>
  );
});

Clock.displayName = 'SanctuaryClock';

