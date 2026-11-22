import React, { useRef, useState } from 'react';
import {
  CloudOffIcon as CloudOff,
  DownloadIcon as Download,
  UploadIcon as Upload,
  CheckCircleIcon as CheckCircle2,
} from '../components/icons';
import { Storage } from '../lib/storage';

interface SyncScreenProps {
  onRefresh: () => void;
}

export const SyncScreen: React.FC<SyncScreenProps> = ({ onRefresh }) => {
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const success = await Storage.importBackup(text);
        if (success) {
          setImportStatus('Backup restored successfully!');
          onRefresh();
        } else {
          setImportStatus('Failed to restore backup.');
        }
        setTimeout(() => setImportStatus(''), 4000);
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1 pt-2">
        <span className="text-[11px] font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase">
          DATA RESIDENCY
        </span>
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-[var(--color-on-surface)]">
          Sync & Storage
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-mid)]">
          Sanctuary runs locally on your device with native SQLite persistence.
        </p>
      </div>

      {/* Local Status Banner */}
      <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CloudOff className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-[var(--color-on-surface)]">
              Local Device Mode Active
            </h3>
            <p className="text-xs text-[var(--color-text-mid)]">
              Zero cloud sync enabled. All data is written directly to native device storage.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface-variant)]/60 border border-[var(--color-surface-border)] space-y-2 text-xs text-[var(--color-text-mid)] leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Encrypted SQLite Native Database Connected</span>
          </div>
          <p>
            Your reflections, reminders, and tags will persist safely across app restarts without requiring internet access or a user account.
          </p>
        </div>
      </div>

      {/* Manual Sync / Backup Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[var(--color-on-surface)]">
              Export Archive
            </h4>
            <p className="text-xs text-[var(--color-text-mid)] leading-relaxed">
              Create an unencrypted portable JSON archive of your entire sanctuary.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] mt-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-[var(--color-on-surface)]">
              Restore Archive
            </h4>
            <p className="text-xs text-[var(--color-text-mid)] leading-relaxed">
              Restore data from a previously exported Sanctuary JSON backup file.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-border)] text-[var(--color-on-surface)] font-medium text-xs flex items-center justify-center gap-2 border border-[var(--color-surface-border)] transition active:scale-[0.98] mt-2"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Select Backup File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center text-xs text-teal-700 dark:text-teal-300 font-medium animate-in fade-in">
          {importStatus}
        </div>
      )}
    </div>
  );
};
