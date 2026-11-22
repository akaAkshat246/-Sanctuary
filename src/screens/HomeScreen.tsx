import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, MoodType, MoodLog } from '../types';
import { Storage } from '../lib/storage';
import { LITERARY_QUOTES } from '../data/quotes';
import { hapticLight, hapticSuccess } from '../lib/haptics';

interface HomeScreenProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

function computeTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'GOOD MORNING';
  if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
  if (hour >= 17 && hour < 22) return 'GOOD EVENING';
  return 'QUIET NIGHT';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ profile, onOpenProfile, showToast }) => {
  const [time, setTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Live timer for clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load existing mood for today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    Storage.getMoodsAsync().then((moods) => {
      const todayMood = moods.find((m) => m.date === todayStr);
      if (todayMood) {
        setSelectedMood(todayMood.mood);
      }
    });
  }, []);

  const handleSelectMood = async (mood: MoodType) => {
    hapticLight();
    setSelectedMood(mood);
    const todayStr = new Date().toISOString().split('T')[0];
    const log: MoodLog = {
      id: `mood_${Date.now()}`,
      date: todayStr,
      mood,
      createdAt: new Date().toISOString(),
    };
    await Storage.saveMood(log);
    hapticSuccess();
    showToast?.(`Mood recorded: ${mood}`, 'info');
  };

  const currentQuote = LITERARY_QUOTES[0];
  const greeting = useMemo(computeTimeGreeting, [time]);
  const subtitleQuote = 'Proud of you.';

  // Clock format matching video: "19 46" and small seconds "23"
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const formattedDate = time
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  const moods: Array<{ type: MoodType; label: string; icon: React.ReactNode }> = [
    {
      type: 'Radiant',
      label: 'Radiant',
      icon: <span className="w-3.5 h-3.5 rounded-full bg-[#8c6828] block" />,
    },
    {
      type: 'Calm',
      label: 'Calm',
      icon: <span className="w-3.5 h-3.5 rounded-sm bg-[#0d5947] block" />,
    },
    {
      type: 'Neutral',
      label: 'Neutral',
      icon: <span className="w-3.5 h-0.5 bg-[#4f6f65] block my-1.5" />,
    },
    {
      type: 'Low',
      label: 'Low',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-[#8fa7a0] block my-1 opacity-70" />,
    },
    {
      type: 'Stormy',
      label: 'Stormy',
      icon: <span className="text-[#dc2626] text-xs leading-none">★</span>,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Header Row matching frame 45s */}
      <div className="flex items-start justify-between pt-1">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold tracking-widest text-[#5b7970] uppercase">
            {greeting}
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
            Welcome back, {profile.name || 'Akshat'}
          </h1>
          <p className="font-quote italic text-sm text-[#5b7970] dark:text-[#8fa7a0]">
            {subtitleQuote}
          </p>
        </div>

        {/* Circular Avatar Button on Top Right */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full border border-[#12332a]/30 dark:border-white/30 flex items-center justify-center text-xs font-semibold text-[#12332a] dark:text-white hover:bg-white/40 dark:hover:bg-white/10 transition shadow-xs"
          aria-label="Profile"
        >
          {profile.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span>{profile.name.trim() ? profile.name.trim().charAt(0).toUpperCase() : 'A'}</span>
          )}
        </button>
      </div>

      {/* 2-Column Grid matching frame 45s */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Live Clock & Daily Mood */}
        <div className="space-y-6">
          {/* Card 1: LIVE CLOCK */}
          <div className="rounded-[28px] p-6 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-baseline gap-2 font-mono text-[#12332a] dark:text-white">
              <span className="text-4xl sm:text-5xl font-light tracking-tight">{hours}</span>
              <span className="text-4xl sm:text-5xl font-light tracking-tight">{minutes}</span>
              <span className="text-xs sm:text-sm text-[#5b7970] dark:text-[#8fa7a0] font-normal ml-1">
                {seconds}
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-[#8fa7a0] uppercase font-semibold">
              {formattedDate}
            </p>
          </div>

          {/* Card 2: DAILY MOOD */}
          <div className="rounded-[28px] p-6 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
              DAILY MOOD
            </div>

            {/* 5 Mood Icons */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {moods.map((m) => {
                const isSelected = selectedMood === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => handleSelectMood(m.type)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12332a] dark:focus-visible:ring-teal-400 ${
                      isSelected
                        ? 'bg-[#e5f0eb] dark:bg-white/15 shadow-xs scale-105 font-medium'
                        : 'hover:bg-[#eef5f2] dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="h-4 flex items-center justify-center">
                      {m.icon}
                    </div>
                    <span className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Confirmation state text matching frame 192s */}
            {selectedMood && (
              <p className="font-quote italic text-xs text-[#5b7970] dark:text-[#8fa7a0] text-center pt-1 animate-in fade-in">
                You felt {selectedMood.toLowerCase()} today
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Literary Quote Card */}
        <div className="rounded-[28px] p-8 bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs space-y-6 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4">
            <span className="font-quote text-4xl text-[#8fa7a0]/40 leading-none select-none block">
              ““
            </span>
            <blockquote className="font-quote text-base sm:text-lg italic text-[#12332a] dark:text-white leading-relaxed">
              "{currentQuote.text}"
            </blockquote>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#8fa7a0] font-semibold">
              - {currentQuote.author}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
