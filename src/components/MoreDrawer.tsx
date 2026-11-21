import React from 'react';
import { X, Tag, Compass, Bookmark, Settings, ShieldCheck, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'journey' | 'tags' | 'links' | 'settings' | 'privacy' | 'terms') => void;
}

export const MoreDrawer: React.FC<MoreDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div className="relative w-full max-w-lg mx-auto bg-[var(--color-surface)] border-t border-[var(--color-surface-border)] rounded-t-3xl p-6 pb-12 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300">
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-[var(--color-surface-border)] rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-heading font-semibold text-[var(--color-on-surface)]">
              Refuge Navigation
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Additional sanctuaries and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              onSelectOption('journey');
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--color-surface-variant)]/60 hover:bg-[var(--color-surface-variant)] text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-[var(--color-primary)] group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-on-surface)]">Journey</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">Timeline story</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOption('tags');
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--color-surface-variant)]/60 hover:bg-[var(--color-surface-variant)] text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-on-surface)]">Tags</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">Organize memories</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOption('links');
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--color-surface-variant)]/60 hover:bg-[var(--color-surface-variant)] text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-on-surface)]">Saved Links</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">Digital bookmarks</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectOption('settings');
              onClose();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--color-surface-variant)]/60 hover:bg-[var(--color-surface-variant)] text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-on-surface)]">Settings</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">Backup & preferences</div>
            </div>
          </button>
        </div>

        {/* Footer links */}
        <div className="pt-4 border-t border-[var(--color-surface-border)] flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
          <button
            onClick={() => {
              onSelectOption('privacy');
              onClose();
            }}
            className="flex items-center gap-1.5 hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Local-First
          </button>
          <button
            onClick={() => {
              onSelectOption('terms');
              onClose();
            }}
            className="flex items-center gap-1.5 hover:underline"
          >
            <FileText className="w-3.5 h-3.5" /> Sanctuary Principles
          </button>
        </div>
      </div>
    </div>
  );
};

