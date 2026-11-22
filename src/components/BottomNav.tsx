import React from 'react';
import {
  HomeIcon as Home,
  ImageIcon as GalleryIcon,
  FeatherIcon as Feather,
  BellIcon as Bell,
  GridIcon as Grid2X2,
} from './icons';

export type NavTab = 'home' | 'vault' | 'journal' | 'reminders';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMore: () => void;
  pendingRemindersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
  pendingRemindersCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'vault' as NavTab, label: 'Vault', icon: GalleryIcon },
    { id: 'journal' as NavTab, label: 'Journal', icon: Feather },
    { id: 'reminders' as NavTab, label: 'Tasks', icon: Bell, badge: pendingRemindersCount },
  ];

  return (
    <div
      className="fixed bottom-5 z-40 w-[92%] max-w-[420px] transition-all duration-300"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <nav
        className="glass-pill h-[52px] px-3 flex items-center justify-around rounded-full shadow-lg border border-[var(--nav-border)]"
        aria-label="Sanctuary Navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex items-center justify-center min-w-[48px] h-10 rounded-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-[var(--nav-icon-active)] font-medium scale-105'
                  : 'text-[var(--nav-icon-inactive)] hover:text-[var(--color-primary-light)]'
              }`}
              aria-label={tab.label}
            >
              {/* Active pill background aura */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-teal-500/15 -z-10 animate-fade-in" />
              )}

              <Icon className="w-5 h-5 stroke-[2]" />

              {/* Reminders count badge */}
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-amber-600 rounded-full shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More Drawer toggle (Grid2x2 icon as per Day 2 spec) */}
        <button
          onClick={onOpenMore}
          className="relative flex items-center justify-center min-w-[48px] h-10 rounded-full text-[var(--nav-icon-inactive)] hover:text-[var(--color-primary-light)] transition-all duration-200 active:scale-90"
          aria-label="More options"
        >
          <Grid2X2 className="w-5 h-5 stroke-[2]" />
        </button>
      </nav>
    </div>
  );
};

