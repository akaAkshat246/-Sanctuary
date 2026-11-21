import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Storage } from '../lib/storage';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = Storage.getTheme();
    setTheme(current);
    document.documentElement.setAttribute('data-theme', current);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    Storage.setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle Dark Mode"
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 focus:outline-none hover:scale-105 active:scale-95 ${
        theme === 'dark'
          ? 'bg-emerald-950/40 text-amber-300 border border-teal-800/40 shadow-inner'
          : 'bg-emerald-100/60 text-teal-800 border border-emerald-200/60 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
};

