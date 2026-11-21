import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RefreshCw, Sparkles, BookOpen, Heart, Bell, Image as GalleryIcon } from 'lucide-react';
import type { UserProfile, JournalEntry, MemoryItem, ReminderItem } from '../types';
import { Clock } from '../components/Clock';
import { LITERARY_QUOTES } from '../data/quotes';
import { CAT_COMPANIONS, GENDER_NICKNAMES } from '../data/cats';
import { checkSpecialOccasion } from '../data/occasions';

interface HomeScreenProps {
  profile: UserProfile;
  journals: JournalEntry[];
  memories: MemoryItem[];
  reminders: ReminderItem[];
  onOpenProfile: () => void;
  onNavigateTab: (tab: 'home' | 'vault' | 'journal' | 'reminders') => void;
  onNewJournal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  journals,
  memories,
  reminders,
  onOpenProfile,
  onNavigateTab,
  onNewJournal,
}) => {
  // Quote State
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return dayOfYear % LITERARY_QUOTES.length;
  });

  // Cat State
  const [catIndex, setCatIndex] = useState(0);

  // Rotate cat companion smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCatIndex((prev) => (prev + 1) % CAT_COMPANIONS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const currentCat = CAT_COMPANIONS[catIndex];

  // Random nickname based on gender
  const nickname = useMemo(() => {
    const list = GENDER_NICKNAMES[profile.gender] || GENDER_NICKNAMES['They/Them'];
    return list[Math.floor(Math.random() * list.length)];
  }, [profile.gender]);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Peaceful Night';
  }, []);

  // Check Occasion / Birthday
  const occasion = useMemo(() => {
    return checkSpecialOccasion(profile.birthday);
  }, [profile.birthday]);

  // Birthday confetti trigger
  useEffect(() => {
    if (occasion && occasion.title.includes('Birthday')) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9a84c', '#7ebdac', '#f0f7f4', '#e8c87a'],
      });
    }
  }, [occasion]);

  const handleNextQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % LITERARY_QUOTES.length);
  }, []);

  const currentQuote = LITERARY_QUOTES[quoteIndex];
  const pendingReminders = reminders.filter((r) => !r.completed).length;
  const favouriteMemories = memories.filter((m) => m.isFavourite).length;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-widest text-[var(--color-gold)] font-medium">
            Sanctuary
          </span>
          <Clock />
        </div>

        {/* Profile Avatar (40px circle) */}
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition-all"
          title="Open Profile"
          aria-label="Profile"
        >
          {profile.avatar || '🐱'}
        </button>
      </div>

      {/* Special Occasion Banner if active */}
      {occasion && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30 flex items-center gap-3.5 shadow-sm">
          <span className="text-3xl animate-bounce">{occasion.emoji}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
              {occasion.title}
            </div>
            <div className="text-xs text-[var(--color-on-surface)] mt-0.5 font-medium">
              {occasion.message}
            </div>
          </div>
        </div>
      )}

      {/* Hero Greeting Card */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-xs font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">
          {greeting},
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[var(--color-on-surface)] mt-1">
          {profile.name} <span className="text-[var(--color-gold)] font-normal">({nickname})</span>
        </h1>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 leading-relaxed">
          Your private refuge remains untouched and peaceful. Here is your quiet overview.
        </p>

        {/* Live Stats Row */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-5 border-t border-[var(--color-surface-border)] text-center">
          <button
            onClick={() => onNavigateTab('vault')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            <GalleryIcon className="w-4 h-4 text-teal-600 mb-1" />
            <span className="text-base font-bold text-[var(--color-on-surface)]">{memories.length}</span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)]">Memories</span>
          </button>

          <button
            onClick={() => onNavigateTab('vault')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-500 mb-1" />
            <span className="text-base font-bold text-[var(--color-on-surface)]">{favouriteMemories}</span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)]">Stars</span>
          </button>

          <button
            onClick={() => onNavigateTab('journal')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-500 mb-1" />
            <span className="text-base font-bold text-[var(--color-on-surface)]">{journals.length}</span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)]">Journals</span>
          </button>

          <button
            onClick={() => onNavigateTab('reminders')}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-base font-bold text-[var(--color-on-surface)]">{pendingReminders}</span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)]">Pending</span>
          </button>
        </div>
      </div>

      {/* Kawaii Cat Companion Card */}
      <div
        onClick={() => setCatIndex((prev) => (prev + 1) % CAT_COMPANIONS.length)}
        className="cursor-pointer p-5 rounded-3xl bg-gradient-to-br from-teal-950/5 via-[var(--color-surface)] to-teal-900/10 border border-teal-800/20 shadow-sm relative transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-sm font-mono font-medium text-[var(--color-primary)]">
              {currentCat.avatar}
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-on-surface)] flex items-center gap-1.5">
                {currentCat.name}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 font-normal">
                  {currentCat.mood}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-on-surface-variant)]">
                Companion
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-[var(--color-gold)] animate-pulse" />
        </div>

        <p className="mt-3.5 text-xs italic text-[var(--color-on-surface)] font-quote leading-relaxed text-base tracking-wide pl-2 border-l-2 border-teal-500/40">
          "{currentCat.phrases[quoteIndex % currentCat.phrases.length]}"
        </p>
      </div>

      {/* Literary Quotes Card (Kafka / Dostoevsky) */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-gold)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Literary Reflection
          </div>
          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1 text-[11px] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors p-1"
            title="Next quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cycle</span>
          </button>
        </div>

        <blockquote className="font-quote italic text-lg sm:text-xl text-[var(--color-on-surface)] leading-relaxed">
          "{currentQuote.text}"
        </blockquote>

        <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-on-surface-variant)] pt-3 border-t border-[var(--color-surface-border)]">
          <span className="font-semibold text-[var(--color-on-surface)] font-heading">
            — {currentQuote.author}
          </span>
          {currentQuote.work && (
            <span className="italic text-[11px] text-[var(--color-gold)]">
              {currentQuote.work}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex gap-3">
        <button
          onClick={onNewJournal}
          className="flex-1 py-3 px-4 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-medium shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" /> Write New Journal
        </button>
        <button
          onClick={() => onNavigateTab('vault')}
          className="py-3 px-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-on-surface)] text-xs font-medium shadow-sm transition-all hover:bg-[var(--color-surface-variant)] active:scale-98 flex items-center justify-center gap-2"
        >
          <GalleryIcon className="w-4 h-4 text-teal-600" /> Open Vault
        </button>
      </div>
    </div>
  );
};
