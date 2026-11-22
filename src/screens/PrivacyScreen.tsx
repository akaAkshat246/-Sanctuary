import React, { useState } from 'react';
import {
  ShieldIcon as Shield,
  LockIcon as Lock,
  EyeOffIcon as EyeOff,
  DownloadIcon as Download,
  TrashIcon as Trash2,
  ChevronRightIcon as ChevronRight,
  DatabaseIcon as Database,
  AlertCircleIcon as AlertCircle,
} from '../components/icons';
import { Storage } from '../lib/storage';

export const PrivacyScreen: React.FC = () => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

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
      {/* Top Header Row matching Frame 186s */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <Shield className="w-8 h-8 text-[#12332a] dark:text-white stroke-[1.5]" />
        <h1 className="text-3xl font-heading font-normal tracking-tight text-[#12332a] dark:text-white">
          Privacy & Security
        </h1>
        <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0]">
          Your sanctuary is built on a foundation of absolute privacy.
        </p>
      </div>

      {/* 2 Top Cards matching Frame 186s */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Local Storage */}
        <div className="p-6 rounded-[24px] bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs space-y-3">
          <Lock className="w-5 h-5 text-[#12332a] dark:text-white stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-[#12332a] dark:text-white">
            Local Storage
          </h3>
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] leading-relaxed">
            Every journal entry and memory is stored directly on your device. We never upload your data to any server.
          </p>
        </div>

        {/* Card 2: No Tracking */}
        <div className="p-6 rounded-[24px] bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs space-y-3">
          <EyeOff className="w-5 h-5 text-[#12332a] dark:text-white stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-[#12332a] dark:text-white">
            No Tracking
          </h3>
          <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] leading-relaxed">
            We don't use any analytics or tracking tools. Your activity in Sanctuary is completely private and invisible to us.
          </p>
        </div>
      </div>

      {/* Middle Section: DATA MANAGEMENT matching Frame 186s */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa7a0]">
          DATA MANAGEMENT
        </h4>

        <div className="rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs p-5 space-y-4">
          <div
            onClick={handleExportBackup}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-[#12332a] dark:text-white" />
              <div>
                <h5 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-teal-600 transition">
                  Export Your Data
                </h5>
                <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                  Download a full backup of your sanctuary in JSON format.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          {!isConfirmingClear ? (
            <div
              onClick={() => setIsConfirmingClear(true)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#12332a] dark:text-white group-hover:text-rose-500 transition">
                    Clear All Data
                  </h5>
                  <p className="text-[11px] text-[#5b7970] dark:text-[#8fa7a0]">
                    Permanently delete everything from this device.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8fa7a0]" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Are you sure you want to delete everything?
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

      {/* Bottom Section: Technical Details matching Frame 186s */}
      <div className="rounded-2xl bg-[#fbfdfc] dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#12332a] dark:text-white" />
          <h4 className="font-heading text-sm font-semibold text-[#12332a] dark:text-white">
            Technical Details
          </h4>
        </div>
        <p className="text-xs text-[#5b7970] dark:text-[#8fa7a0] leading-relaxed">
          Sanctuary uses native sandboxed storage and SQLite database to persist your data. This data is tied to your device. Clearing device application storage may result in data loss if you haven't exported a backup.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-[#8fa7a0] pt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Always keep a regular backup of your data.</span>
        </div>
      </div>
    </div>
  );
};
