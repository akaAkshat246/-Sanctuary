import React from 'react';
import {
  HomeIcon as Home,
  BookOpenIcon as BookOpen,
  VaultIcon as Archive,
  BellIcon as Bell,
  TagIcon as Tag,
  MapIcon as Map,
  SettingsIcon as Settings,
  HelpIcon as HelpCircle,
  ShieldIcon as Shield,
  SyncIcon as RotateCw,
} from './icons';
import type { UserProfile } from '../types';
import { hapticLight } from '../lib/haptics';

export type SanctuaryScreen =
  | 'home'
  | 'journal'
  | 'vault'
  | 'reminders'
  | 'tags'
  | 'journey'
  | 'settings'
  | 'help'
  | 'privacy'
  | 'sync';

interface SidebarProps {
  currentScreen: SanctuaryScreen;
  onNavigate: (screen: SanctuaryScreen) => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  pendingRemindersCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  profile,
  onOpenProfile,
  pendingRemindersCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const menuItems: Array<{
    id: SanctuaryScreen;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'vault', label: 'Vault', icon: <Archive className="w-4 h-4 stroke-[1.6]" /> },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: <Bell className="w-4 h-4 stroke-[1.6]" />,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
    },
    { id: 'tags', label: 'Tags', icon: <Tag className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'journey', label: 'Journey', icon: <Map className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'help', label: 'Help', icon: <HelpCircle className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4 stroke-[1.6]" /> },
    { id: 'sync', label: 'Sync', icon: <RotateCw className="w-4 h-4 stroke-[1.6]" /> },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between py-6 px-4 select-none">
      {/* Top Header Logo */}
      <div className="space-y-6">
        <div className="px-3 pt-1">
          <h1 className="font-heading text-2xl font-normal tracking-wide text-[#12332a] dark:text-white">
            Sanctuary
          </h1>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  hapticLight();
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12332a] dark:focus-visible:ring-teal-400 ${
                  isActive
                    ? 'bg-white dark:bg-white/10 text-[#12332a] dark:text-white font-medium shadow-xs'
                    : 'text-[#608075] dark:text-[#8fa7a0] hover:text-[#12332a] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#12332a] dark:text-white' : 'text-[#8fa7a0]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Pill */}
      <div>
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#fbfdfc]/90 dark:bg-white/5 border border-[#dce9e3] dark:border-white/10 shadow-xs hover:border-[#12332a]/30 transition text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12332a] dark:focus-visible:ring-teal-400"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 text-[#12332a] dark:text-white flex items-center justify-center font-semibold text-xs overflow-hidden flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.name.trim() ? profile.name.trim().charAt(0).toUpperCase() : 'A'}</span>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-semibold text-[#12332a] dark:text-white truncate">
              {profile.name || 'Akshat'}
            </h4>
            <p className="text-[10px] text-[#8fa7a0] truncate">
              Daily Explorer
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="hidden md:flex w-56 h-screen sticky top-0 flex-col z-30 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[#ebf4f0] dark:bg-[#06120f] shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
