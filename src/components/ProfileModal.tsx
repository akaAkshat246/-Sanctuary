import React, { useState, useEffect } from 'react';
import {
  CloseIcon as X,
  SaveIcon as Save,
  DownloadIcon as Download,
  TrashIcon as Trash2,
} from './icons';
import type { UserProfile, GenderType, JournalEntry, MemoryItem, ReminderItem } from '../types';
import { Storage } from '../lib/storage';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  journals: JournalEntry[];
  memories: MemoryItem[];
  reminders: ReminderItem[];
  onProfileUpdated: (updated: UserProfile) => void;
  onDataCleared: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  journals,
  memories,
  reminders,
  onProfileUpdated,
  onDataCleared,
}) => {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<GenderType>(profile.gender || 'Male');
  const [birthday, setBirthday] = useState(profile.birthday || '2006-09-18');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender || 'Male');
    setBirthday(profile.birthday || '2006-09-18');
    setIsConfirmingClear(false);
    setSaveSuccess(false);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    hapticMedium();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Akshat',
      gender,
      birthday,
    };
    await Storage.setProfile(updated);
    onProfileUpdated(updated);
    hapticSuccess();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 500);
  };

  const handleExportData = () => {
    const backupJson = Storage.exportBackup();
    const now = new Date().toISOString().split('T')[0];
    const filename = `sanctuary-backup-${now}.json`;

    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    await Storage.clearAllSanctuaryData();
    setIsConfirmingClear(false);
    onDataCleared();
    window.location.reload();
  };

  // Format date display: e.g. "September 18, 2006"
  const formattedBirthDate = (() => {
    if (!birthday) return 'September 18, 2006';
    try {
      const parts = birthday.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return birthday;
  })();

  const genders: GenderType[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto px-4 py-6">
        {/* Close Button matching Frame 198s */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Profile Header matching Frame 198s */}
        <div className="flex flex-col items-center text-center space-y-2 pt-4">
          <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center font-heading text-xl text-white shadow-md">
            <span>{name.trim() ? name.trim().charAt(0).toUpperCase() : 'A'}</span>
          </div>

          <h2 className="text-2xl font-heading font-normal text-white">
            {name || 'Akshat'}
          </h2>

          <p className="text-xs text-white/50 font-body">
            {gender} · {formattedBirthDate}
          </p>
        </div>

        {/* 4 Stats Pills in horizontal row matching Frame 198s */}
        <div className="flex items-center justify-center gap-2 py-1">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            Entries {journals.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            Memories {memories.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            Reminders {reminders.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80">
            Streak {journals.length > 0 ? '1d' : '0d'}
          </span>
        </div>

        {/* Edit Form matching Frame 198s */}
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50 block">
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30 transition"
            />
          </div>

          {/* Gender Selector Bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50 block">
              GENDER
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
              {genders.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setGender(g);
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-medium transition truncate ${
                    gender === g
                      ? 'bg-white/15 text-white shadow-xs'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Birthday Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/50 block">
              BIRTHDAY
            </label>
            <div className="relative">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30 transition [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Action Links stacked at bottom matching Frame 198s */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-4">
            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveSuccess ? 'Changes Saved!' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export My Data</span>
            </button>

            {!isConfirmingClear ? (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-xs text-rose-400">Permanently delete everything?</span>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-3 py-1 rounded-xl bg-white/10 text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
