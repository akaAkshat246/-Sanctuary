import React, { useState } from 'react';
import {
  Sparkles, Heart, ShieldCheck, ChevronRight, Check, Compass, HardDrive, BookOpen
} from 'lucide-react';
import type { UserProfile, Gender } from '../types';
import { Storage } from '../lib/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('They/Them');
  const [birthday, setBirthday] = useState('');

  if (!isOpen) return null;

  const slides = [
    {
      title: "Welcome to Sanctuary",
      desc: "A distraction-free, quiet digital refuge designed by Akshat Vats to protect your memories, thoughts, and reflections.",
      icon: <Sparkles className="w-12 h-12 text-[var(--color-gold)]" />,
    },
    {
      title: "100% Local-First Privacy",
      desc: "No accounts, no remote trackers, no advertising beacons. Your sanctuary belongs strictly to this device.",
      icon: <ShieldCheck className="w-12 h-12 text-teal-600" />,
    },
    {
      title: "10–15 GB Memory Vault",
      desc: "Store uncompressed photos, video memories, audio notes, and documents in your permanent native vault.",
      icon: <HardDrive className="w-12 h-12 text-amber-500" />,
    },
    {
      title: "Writing Space & Kafka Wisdom",
      desc: "Daily inner weather moods, auto-saving drafts, Gemini poetic inspiration, and curated Franz Kafka reflections.",
      icon: <BookOpen className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: "Kawaii Companions & Calm",
      desc: "Meet Mochi and rotating kawaii cat companions who keep gentle watch over your day with soft purrs.",
      icon: <Heart className="w-12 h-12 text-rose-500" />,
    },
  ];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Akshat',
      gender,
      birthday,
      avatar: '🐱',
      theme: 'light',
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    };
    Storage.setProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {slide < slides.length ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 flex items-center justify-center shadow-inner">
              {slides[slide].icon}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-bold">
                Chapter {slide + 1} of {slides.length}
              </span>
              <h3 className="text-2xl font-heading font-semibold text-[var(--color-on-surface)]">
                {slides[slide].title}
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed max-w-xs mx-auto">
                {slides[slide].desc}
              </p>
            </div>

            <div className="flex justify-center gap-1.5 pt-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    slide === i ? 'w-6 bg-[var(--color-gold)]' : 'w-2 bg-[var(--color-surface-border)]'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {slide > 0 && (
                <button
                  type="button"
                  onClick={() => setSlide((prev) => prev - 1)}
                  className="px-4 py-3 rounded-2xl bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] text-xs font-semibold hover:bg-[var(--color-surface-border)] transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => setSlide((prev) => prev + 1)}
                className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {slide === slides.length - 1 ? 'Personalize Identity' : 'Continue'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Profile Setup Slide */
          <form onSubmit={handleFinish} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-[var(--color-gold)] flex items-center justify-center mb-2">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-[var(--color-on-surface)]">
                Personalize Your Refuge
              </h3>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                Tell us how you would like to be greeted in your sanctuary.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Akshat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1.5">
                Pronouns
              </label>
              <div className="flex gap-2">
                {(['She/Her', 'He/Him', 'They/Them'] as Gender[]).map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                      gender === g
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
                Birthday (Optional)
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Check className="w-4 h-4" /> Enter Sanctuary
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
