import React, { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface MochiCatProps {
  moodName?: string;
  onPet?: () => void;
}

export const MochiCat: React.FC<MochiCatProps> = ({
  moodName = 'Peaceful',
  onPet,
}) => {
  const [isPurring, setIsPurring] = useState(false);
  const [blinking, setBlinking] = useState(false);

  const handleTap = async () => {
    setIsPurring(true);
    setBlinking(true);

    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // ignore
      }
    }

    onPet?.();
    setTimeout(() => setBlinking(false), 400);
    setTimeout(() => setIsPurring(false), 2000);
  };

  return (
    <div
      onClick={handleTap}
      className="cursor-pointer select-none flex flex-col items-center justify-center group"
      title="Tap to pet Mochi"
    >
      <div className={`relative transition-transform duration-300 ${isPurring ? 'scale-105' : 'hover:scale-102'}`}>
        <svg
          viewBox="0 0 160 140"
          className="w-32 h-28 drop-shadow-md animate-[pulse_4s_ease-in-out_infinite]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft Shadow */}
          <ellipse cx="80" cy="130" rx="55" ry="8" fill="rgba(26, 74, 74, 0.12)" />

          {/* Cat Tail (gentle curved sway) */}
          <path
            d="M 125 105 C 145 95 155 70 142 55 C 135 48 128 58 132 70 C 136 82 125 95 115 102 Z"
            fill="var(--color-primary-light)"
            opacity="0.85"
            className="origin-bottom-left transition-transform duration-700 group-hover:rotate-6"
          />

          {/* Body */}
          <ellipse cx="80" cy="95" rx="46" ry="34" fill="var(--color-surface)" stroke="var(--color-surface-border)" strokeWidth="2.5" />

          {/* Chest Patch */}
          <ellipse cx="80" cy="98" rx="28" ry="20" fill="var(--color-primary-pale)" opacity="0.6" />

          {/* Left Ear */}
          <path
            d="M 45 45 L 35 15 L 65 30 Z"
            fill="var(--color-surface)"
            stroke="var(--color-surface-border)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M 46 40 L 40 22 L 60 32 Z" fill="#fca5a5" opacity="0.5" />

          {/* Right Ear */}
          <path
            d="M 115 45 L 125 15 L 95 30 Z"
            fill="var(--color-surface)"
            stroke="var(--color-surface-border)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M 114 40 L 120 22 L 100 32 Z" fill="#fca5a5" opacity="0.5" />

          {/* Head */}
          <circle cx="80" cy="55" r="36" fill="var(--color-surface)" stroke="var(--color-surface-border)" strokeWidth="2.5" />

          {/* Eyes (Open or Happy Curved Blinking) */}
          {blinking || isPurring ? (
            <>
              {/* Happy curved eyes (^_^) */}
              <path d="M 60 55 Q 67 48 74 55" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 86 55 Q 93 48 100 55" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Curious open eyes */}
              <ellipse cx="66" cy="54" rx="4.5" ry="6" fill="var(--color-primary)" />
              <circle cx="68" cy="52" r="1.8" fill="#ffffff" />
              <ellipse cx="94" cy="54" rx="4.5" ry="6" fill="var(--color-primary)" />
              <circle cx="96" cy="52" r="1.8" fill="#ffffff" />
            </>
          )}

          {/* Pink Cheeks */}
          <ellipse cx="56" cy="62" rx="5" ry="3" fill="#fca5a5" opacity="0.6" />
          <ellipse cx="104" cy="62" rx="5" ry="3" fill="#fca5a5" opacity="0.6" />

          {/* Cute Nose */}
          <polygon points="80,62 77,59 83,59" fill="#f87171" />

          {/* Mouth */}
          <path d="M 77 62 Q 80 66 80 67 Q 80 66 83 62" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 74 65 Q 77 68 80 67 Q 83 68 86 65" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <path d="M 45 58 L 28 56" stroke="var(--color-surface-border)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 45 64 L 30 66" stroke="var(--color-surface-border)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 115 58 L 132 56" stroke="var(--color-surface-border)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 115 64 L 130 66" stroke="var(--color-surface-border)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Paws Resting */}
          <ellipse cx="68" cy="118" rx="8" ry="6" fill="var(--color-surface)" stroke="var(--color-surface-border)" strokeWidth="2" />
          <ellipse cx="92" cy="118" rx="8" ry="6" fill="var(--color-surface)" stroke="var(--color-surface-border)" strokeWidth="2" />

          {/* Purring note / hearts if purring */}
          {isPurring && (
            <text x="110" y="30" fill="var(--color-gold)" fontSize="16" className="animate-bounce">
              ♥
            </text>
          )}
        </svg>

        {/* Purring pill indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--color-surface-variant)] border border-[var(--color-surface-border)] text-[var(--color-primary)] font-medium shadow-2xs">
            {isPurring ? 'Purrrr... ♥' : `Mochi · ${moodName}`}
          </span>
        </div>
      </div>
    </div>
  );
};

