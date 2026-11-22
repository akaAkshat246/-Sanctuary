import React, { useState, useEffect } from 'react';
import { DownloadIcon as Download, CloseIcon as X, MindfulStarIcon as Sparkles } from './icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt banner after 30 seconds as specified in Day 20
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('sanctuary_pwa_dismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }, 30000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('sanctuary_pwa_dismissed', 'true');
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-in slide-in-from-top duration-300">
      <div className="glass-panel p-3.5 rounded-2xl border border-[var(--color-surface-border)] shadow-xl flex items-center justify-between gap-3 bg-[var(--color-surface)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[var(--color-gold)]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-heading font-semibold text-[var(--color-on-surface)] truncate">
              Install Sanctuary
            </h4>
            <p className="text-[10px] text-[var(--color-on-surface-variant)] truncate">
              Add to home screen for instant offline refuge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

