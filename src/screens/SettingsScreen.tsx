import React, { useState } from 'react';
import {
  Settings, Download, Trash2, ShieldCheck, FileText, Key, Sparkles, Check
} from 'lucide-react';
import type { UserProfile } from '../types';
import { Storage } from '../lib/storage';
import { ThemeToggle } from '../components/ThemeToggle';

interface SettingsScreenProps {
  profile: UserProfile;
  onRefresh: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
}) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sanctuary_gemini_key') || '');
  const [isSavedKey, setIsSavedKey] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sanctuary_gemini_key', apiKey.trim());
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2000);
  };

  const handleExportBackup = () => {
    const backupJson = Storage.exportBackup();
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-${now.getFullYear()}`;
    const filename = `sanctuary-backup-${dateStr}.json`;

    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will delete all your local sanctuary journals, memories, reminders, and settings. This action is irreversible.'
    );
    if (confirmed) {
      Storage.clearAllSanctuaryData();
      alert('Sanctuary has been reset. Refreshing...');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-1">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] flex items-center gap-1 mb-1"
          >
            ← Back to Sanctuary
          </button>
          <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-gold)]" /> Settings & Refuge
          </h2>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
          Appearance & Ambiance
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-[var(--color-on-surface)]">Theme Mode</div>
            <div className="text-xs text-[var(--color-on-surface-variant)]">
              Light ivory warm palette or deep dark teal refuge
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Gemini AI Integration Section */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            Gemini AI Muse
          </h3>
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
          Provide your Gemini API key from Google AI Studio to unlock personalized poetic prompts in your writing space.
        </p>

        <form onSubmit={handleSaveApiKey} className="flex gap-2">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] text-xs text-[var(--color-on-surface)] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-medium flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
          >
            {isSavedKey ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            {isSavedKey ? 'Saved' : 'Save Key'}
          </button>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
          Data & Local-First Sovereignty
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4 text-teal-600" /> Export Full Backup (.json)
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" /> Reset All Data
          </button>
        </div>
      </div>

      {/* Sanctuary Principles & Privacy Policy */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
          Sanctuary Declarations
        </h3>

        <button
          onClick={() => setShowPrivacy(true)}
          className="w-full flex items-center justify-between py-2 text-xs text-[var(--color-on-surface)] hover:text-[var(--color-primary)] border-b border-[var(--color-surface-border)]"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" /> Privacy Manifesto (Zero Tracking)
          </span>
          <span>→</span>
        </button>

        <button
          onClick={() => setShowTerms(true)}
          className="w-full flex items-center justify-between py-2 text-xs text-[var(--color-on-surface)] hover:text-[var(--color-primary)]"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-gold)]" /> Architecture & Principles
          </span>
          <span>→</span>
        </button>
      </div>

      {/* Privacy Policy Bottom Sheet */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-surface-border)]">
              <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                Privacy Manifesto
              </h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              >
                Close
              </button>
            </div>
            <div className="text-xs text-[var(--color-on-surface-variant)] space-y-2.5 leading-relaxed">
              <p>
                <strong>1. 100% Local-First:</strong> Sanctuary stores every journal entry, uploaded memory, reminder, and preference strictly on your local device.
              </p>
              <p>
                <strong>2. No Clouds, No Trackers:</strong> We do not operate remote user tracking databases or advertising beacons.
              </p>
              <p>
                <strong>3. Portable Backups:</strong> You can export your entire sanctuary as a standard JSON backup file anytime, or restore it on any device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms / Principles Bottom Sheet */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-surface-border)]">
              <h3 className="font-heading font-semibold text-base text-[var(--color-on-surface)]">
                Sanctuary Principles
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
              >
                Close
              </button>
            </div>
            <div className="text-xs text-[var(--color-on-surface-variant)] space-y-2.5 leading-relaxed">
              <p className="font-quote italic text-sm text-[var(--color-on-surface)]">
                "Sanctuary is designed as a peaceful digital refuge inspired by literature, quiet moments, and deep reverence for human thoughts."
              </p>
              <p>
                Built by Akshat Vats with clean engineering, elegant typography (Playfair Display & Josefin Sans), and local privacy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
