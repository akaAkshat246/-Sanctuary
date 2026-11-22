import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  MenuIcon as Menu,
  UserIcon as User,
  HomeIcon as Home,
  BookOpenIcon as BookOpen,
  VaultIcon as FolderArchive,
  BellIcon as Bell,
} from './components/icons';
import type { UserProfile, JournalEntry, MemoryItem, ReminderItem } from './types';
import { Storage } from './lib/storage';

// Layout & Modals
import { Sidebar } from './components/Sidebar';
import type { SanctuaryScreen } from './components/Sidebar';
import { ProfileModal } from './components/ProfileModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Toast, type ToastMessage } from './components/Toast';
import { hapticLight } from './lib/haptics';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { JournalScreen } from './screens/JournalScreen';
import { VaultScreen } from './screens/VaultScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { TagsScreen } from './screens/TagsScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { HelpScreen } from './screens/HelpScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { SyncScreen } from './screens/SyncScreen';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(() => Storage.getProfile());
  const [journals, setJournals] = useState<JournalEntry[]>(() => Storage.getJournals());
  const [memories, setMemories] = useState<MemoryItem[]>(() => Storage.getMemories());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => Storage.getReminders());

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<SanctuaryScreen>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(
    () => !Storage.getProfile().hasCompletedOnboarding
  );
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ id: String(Date.now()), text, type });
  }, []);

  const navigateTo = useCallback((screen: SanctuaryScreen) => {
    hapticLight();
    setCurrentScreen(screen);
  }, []);

  // Reload all sanctuary data from native storage
  const refreshData = useCallback(async () => {
    const [prof, jnls, mems, rems] = await Promise.all([
      Storage.getProfileAsync(),
      Storage.getJournalsAsync(),
      Storage.getMemoriesAsync(),
      Storage.getRemindersAsync(),
    ]);

    setProfile(prof);
    setJournals(jnls);
    setMemories(mems);
    setReminders(rems);
  }, []);

  useEffect(() => {
    const savedTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    Storage.setFontSize(profile.fontSize || 'default');

    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      const isDark = savedTheme === 'dark';
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDark ? '#0c1e19' : '#ebf4f0' }).catch(() => {});
    }

    Storage.migrateFromLocalStorageIfNeeded().then(() => {
      refreshData();
    });
  }, [refreshData, profile.fontSize, profile.theme]);

  const handleOpenJournal = (id: string) => {
    setEditingJournalId(id);
    setCurrentScreen('journal');
  };

  const handleStartNewJournal = () => {
    setEditingJournalId(null);
    setCurrentScreen('journal');
  };

  const pendingRemindersCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-on-surface)] transition-colors duration-300 flex flex-col md:flex-row selection:bg-teal-500/20">
      {/* Onboarding Flow if not completed */}
      {isOnboardingOpen && (
        <OnboardingFlow
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setIsOnboardingOpen(false);
            refreshData();
            showToast('Welcome to your Sanctuary!');
          }}
        />
      )}

      {/* Floating System Snackbar / Toast (Jetpack Compose / Kliourr pattern) */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Desktop & Mobile Left Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        pendingRemindersCount={pendingRemindersCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        journals={journals}
        memories={memories}
        reminders={reminders}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          refreshData();
          showToast('Profile updated');
        }}
        onDataCleared={() => {
          refreshData();
          showToast('All local data cleared', 'info');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Top App Bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top,0px),0.75rem)] pb-3 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-surface-border)] shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                hapticLight();
                setIsMobileSidebarOpen(true);
              }}
              className="w-11 h-11 -ml-1.5 rounded-2xl flex items-center justify-center text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] active:scale-90 transition-all touch-manipulation cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 stroke-[1.8]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-300 font-heading text-sm font-bold">
                S
              </div>
              <span className="font-heading font-semibold text-base tracking-tight text-[var(--color-on-surface)]">
                Sanctuary
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsProfileOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-700 to-emerald-900 text-white flex items-center justify-center font-heading font-semibold text-xs shadow-xs overflow-hidden active:scale-90 transition touch-manipulation cursor-pointer"
            aria-label="Profile"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : profile.name.trim() ? (
              profile.name.trim().charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>
        </header>

        {/* Dynamic View Content */}
        <main
          key={currentScreen}
          className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 pb-28 sm:pb-16 max-w-5xl w-full mx-auto animate-page-enter"
        >
          {currentScreen === 'home' && (
            <HomeScreen
              profile={profile}
              onOpenProfile={() => setIsProfileOpen(true)}
              showToast={showToast}
            />
          )}

          {currentScreen === 'journal' && (
            <JournalScreen
              entries={journals}
              onRefresh={refreshData}
              initialEditingId={editingJournalId}
              onClearInitialEdit={() => setEditingJournalId(null)}
              showToast={showToast}
            />
          )}

          {currentScreen === 'vault' && (
            <VaultScreen
              memories={memories}
              onRefresh={refreshData}
              showToast={showToast}
            />
          )}

          {currentScreen === 'reminders' && (
            <RemindersScreen
              reminders={reminders}
              onRefresh={refreshData}
              showToast={showToast}
            />
          )}

          {currentScreen === 'tags' && (
            <TagsScreen
              entries={journals}
              onOpenJournal={handleOpenJournal}
            />
          )}

          {currentScreen === 'journey' && (
            <JourneyScreen
              entries={journals}
              onOpenJournal={handleOpenJournal}
              onNewEntry={handleStartNewJournal}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              profile={profile}
              onRefresh={refreshData}
            />
          )}

          {currentScreen === 'help' && (
            <HelpScreen />
          )}

          {currentScreen === 'privacy' && (
            <PrivacyScreen />
          )}

          {currentScreen === 'sync' && (
            <SyncScreen
              onRefresh={refreshData}
            />
          )}
        </main>

        {/* Mobile Interactive Floating Bottom Navigation Dock */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 pointer-events-none flex justify-center pb-[max(env(safe-area-inset-bottom,0px),0.75rem)] px-4">
          <nav
            role="navigation"
            aria-label="Primary Navigation"
            className="pointer-events-auto w-full max-w-xs rounded-full bg-[#fbfdfc]/95 dark:bg-[#0c1e19]/95 backdrop-blur-xl border border-[#dce9e3] dark:border-white/10 shadow-lg px-2 py-1.5 flex items-center justify-between"
          >
            {[
              { id: 'home' as const, label: 'Home', icon: Home },
              { id: 'journal' as const, label: 'Journal', icon: BookOpen },
              { id: 'vault' as const, label: 'Vault', icon: FolderArchive },
              { id: 'reminders' as const, label: 'Reminders', icon: Bell, badge: pendingRemindersCount },
            ].map((item) => {
              const isActive = currentScreen === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`relative flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full transition-all duration-200 active:scale-90 touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-[#0d2e26] dark:bg-white/15 text-white shadow-xs font-semibold'
                      : 'text-[#608075] dark:text-[#8fa7a0] hover:text-[#12332a] dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComp className="w-4 h-4 stroke-[2]" />
                  <span className={`text-xs ${isActive ? 'inline-block' : 'hidden'}`}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-2" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default App;
