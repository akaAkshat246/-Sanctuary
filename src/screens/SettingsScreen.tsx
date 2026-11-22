import React, { useState, useEffect } from 'react';
import {
  SunIcon as Sun,
  DownloadIcon as Download,
  TrashIcon as Trash2,
  ChevronRightIcon as ChevronRight,
  CloseIcon as X,
  ShieldIcon as Shield,
  HelpIcon as HelpCircle,
  FileTextIcon as FileText,
} from '../components/icons';
import type { UserProfile } from '../types';
import { Storage } from '../lib/storage';

interface SettingsScreenProps {
  profile: UserProfile;
  onRefresh: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ profile, onRefresh }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => Storage.getTheme());
  const [fontSize, setFontSizeState] = useState<'small' | 'default' | 'large'>(
    profile.fontSize || 'default'
  );
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    Storage.setFontSize(fontSize);
  }, [fontSize]);

  const handleToggleTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await Storage.setTheme(newTheme);
    onRefresh();
  };

  const handleSetFontSize = async (size: 'small' | 'default' | 'large') => {
    setFontSizeState(size);
    Storage.setFontSize(size);
    const updated: UserProfile = { ...profile, fontSize: size };
    await Storage.setProfile(updated);
    onRefresh();
  };

  const handleExportBackup = () => {
    const backupJson = Storage.exportBackup();
    const now = new Date().toISOString().split('T')[0];
    const filename = `sanctuary-backup-${now}.json`;

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

  const handleClearAll = async () => {
    await Storage.clearAllSanctuaryData();
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top Header Row matching Frame 180s */}
      <div className="space-y-1 pt-1">
        <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
          Personalize your Sanctuary experience.
        </p>
      </div>

      {/* Section 1: APPEARANCE matching Frame 180s */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8fa7a0]">
          <Sun className="w-3.5 h-3.5" />
          <span>APPEARANCE</span>
        </div>

        <div className="rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs p-5 space-y-4">
          {/* Theme row */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#12332a] dark:text-white">Theme</h4>
              <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                Choose your preferred visual style.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-white/10">
              <button
                type="button"
                onClick={() => handleToggleTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  theme === 'light'
                    ? 'bg-[#fbfdfc] dark:bg-white/20 text-[#12332a] dark:text-white font-medium shadow-xs'
                    : 'text-[#8fa7a0]'
                }`}
              >
                LIGHT
              </button>
              <button
                type="button"
                onClick={() => handleToggleTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  theme === 'dark'
                    ? 'bg-[#fbfdfc] dark:bg-white/20 text-[#12332a] dark:text-white font-medium shadow-xs'
                    : 'text-[#8fa7a0]'
                }`}
              >
                DARK
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          {/* Font Size row */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#12332a] dark:text-white">Font Size</h4>
              <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                Adjust text scaling for better readability.
              </p>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-white/10">
              {(['small', 'default', 'large'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSetFontSize(s)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize transition ${
                    fontSize === s
                      ? 'bg-[#fbfdfc] dark:bg-white/20 text-[#12332a] dark:text-white font-medium shadow-xs'
                      : 'text-[#8fa7a0]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: PRIVACY & DATA matching Frame 180s */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8fa7a0]">
          <Shield className="w-3.5 h-3.5" />
          <span>PRIVACY & DATA</span>
        </div>

        <div className="rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs p-5 space-y-4">
          {/* Export Row */}
          <div
            onClick={handleExportBackup}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#12332a] dark:text-white">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-teal-600 transition">
                  Export All Data
                </h4>
                <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                  Download a backup of your sanctuary.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          {/* Clear Row */}
          {!isConfirmingClear ? (
            <div
              onClick={() => setIsConfirmingClear(true)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-rose-500 transition">
                    Clear All Data
                  </h4>
                  <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                    Permanently delete everything.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Are you sure you want to wipe all data?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-white/10 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: ABOUT matching Frame 180s */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8fa7a0]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ABOUT</span>
        </div>

        <div className="rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#12332a] dark:text-white">Version</h4>
            <span className="text-xs font-mono text-[#8fa7a0]">1.2.0</span>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          <div
            onClick={() => setShowPrivacy(true)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <h4 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-teal-600 transition">
              Privacy Policy
            </h4>
            <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          <div
            onClick={() => setShowTerms(true)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <h4 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-teal-600 transition">
              Terms of Service
            </h4>
            <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#fbfdfc] dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="font-heading text-lg text-[#12332a] dark:text-white">
                  Privacy Policy
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#5b7970] dark:text-[#8fa7a0] space-y-3 leading-relaxed">
              <p>
                <strong>1. Local-First Storage Architecture:</strong> Sanctuary stores all personal reflections, mood logs, memory files, and tasks solely on your local device. We run zero analytics, zero external user-tracking SDKs, and zero third-party advertising monitors.
              </p>
              <p>
                <strong>2. Data Retention & Deletion:</strong> You retain complete ownership and sovereignty of your data. You can delete individual memories and journal entries or trigger a complete permanent data wipe anytime under the Data Management section.
              </p>
              <p>
                <strong>3. Age & Consent:</strong> Sanctuary is intended for users who are at least 13 years of age or older in compliance with international privacy protection standards.
              </p>
              <p>
                <strong>4. Backups:</strong> Because your data never leaves this device, you are responsible for maintaining your own backup files using the 'Export All Data' JSON feature.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#fbfdfc] dark:bg-[#0c1e19] border border-[#dce9e3] dark:border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="font-heading text-lg text-[#12332a] dark:text-white">
                  Terms of Service
                </h3>
              </div>
              <button
                onClick={() => setShowTerms(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#5b7970] dark:text-[#8fa7a0] space-y-3 leading-relaxed">
              <p>
                <strong>1. Nature of Service:</strong> Sanctuary provides an offline, self-hosted digital sanctuary for journaling, memory curation, and mindfulness. It is provided on an 'as-is' and 'as-available' basis without warranty of any kind.
              </p>
              <p>
                <strong>2. Acceptable Use:</strong> You agree to use Sanctuary solely for lawful purposes. Since files and media reside strictly on your own hardware, you are solely responsible for ensuring you have appropriate rights to store and manage those files.
              </p>
              <p>
                <strong>3. No Subscription Fees or Hidden Charges:</strong> Sanctuary features zero hidden recurring subscriptions, paywalls, or misleading dark-pattern billing flows.
              </p>
              <p>
                <strong>4. Contact Information:</strong> For inquiries, suggestions, or technical support, contact the project maintainer at <code>support@sanctuary.app</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
