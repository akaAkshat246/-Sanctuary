import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertCircleIcon, CloseIcon } from './icons';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-auto animate-in slide-in-from-bottom duration-250 select-none"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#082a20] dark:bg-[#0c1e19] text-white border border-teal-800/40 dark:border-white/15 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {toast.type === 'error' ? (
            <AlertCircleIcon className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 stroke-[2.2]" />
          )}
          <span className="text-xs font-medium truncate font-body">
            {toast.text}
          </span>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 rounded-lg text-white/60 hover:text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
          aria-label="Dismiss notification"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

