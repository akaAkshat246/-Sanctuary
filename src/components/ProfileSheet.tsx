import React, { useState } from 'react';
import { X, User, Check, Calendar, Heart } from 'lucide-react';
import type { UserProfile, Gender } from '../types';
import { Storage } from '../lib/storage';

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const current = Storage.getProfile();
  const [name, setName] = useState(current.name);
  const [gender, setGender] = useState<Gender>(current.gender);
  const [birthday, setBirthday] = useState(current.birthday || '');
  const [avatar, setAvatar] = useState(current.avatar || '🐱');

  if (!isOpen) return null;

  const AVATARS = ['🐱', '🌸', '☕', '🌿', '🌙', '✨', '🐾', '🕊️'];
  const GENDERS: Gender[] = ['She/Her', 'He/Him', 'They/Them'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...current,
      name: name.trim() || 'Traveler',
      gender,
      birthday,
      avatar,
      hasCompletedOnboarding: true,
    };
    Storage.setProfile(updated);
    onProfileUpdated(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md mx-auto bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-surface-border)] mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--color-gold)]" />
            <h3 className="font-heading font-semibold text-lg text-[var(--color-on-surface)]">
              Your Sanctuary Identity
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1.5">
              Refuge Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                    avatar === av
                      ? 'scale-110 bg-teal-500/20 ring-2 ring-teal-500'
                      : 'bg-[var(--color-surface-variant)] hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
              Your Chosen Name
            </label>
            <input
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akshat"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Gender selection chips */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1.5">
              Pronouns / Identity
            </label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    gender === g
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/80'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Birthday picker */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">
              Birthday (For special celebrations & confetti)
            </label>
            <div className="relative">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
              <Calendar className="w-4 h-4 text-[var(--color-on-surface-variant)] absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-medium text-sm transition-all shadow-md active:scale-98"
            >
              <Check className="w-4 h-4" /> Save Sanctuary Profile
            </button>
          </div>
        </form>

        <p className="mt-4 text-[11px] text-center text-[var(--color-on-surface-variant)] flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-rose-400" /> Stored locally on this device. Never uploaded.
        </p>
      </div>
    </div>
  );
};
