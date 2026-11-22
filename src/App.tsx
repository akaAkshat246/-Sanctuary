import { useState, useEffect, useCallback } from 'react';
import {
  MenuIcon as Menu,
  UserIcon as User,
  HomeIcon as Home,
  BookOpenIcon as BookOpen,
  VaultIcon as FolderArchive,
  BellIcon as Bell,
  MoreHorizontalIcon as MoreHorizontal,
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

    Storage.migrateFromLocalStorageIfNeeded().then(() => {
      refreshData();
    });
  }, [refreshData, profile.fontSize]);

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
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-[var(--color-text-mid)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-300 font-heading text-sm font-bold">
                S
              </div>
              <span className="font-heading font-semibold text-base tracking-tight text-[var(--color-on-surface)]">
                Sanctuary
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-800 text-white flex items-center justify-center font-heading font-semibold text-xs shadow-xs overflow-hidden"
            aria-label="Profile"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : profile.name.trim() ? (
              profile.name.trim().charAt(0).toUpperCase()
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </button>
        </header>

        {/* Dynamic View Content */}
        <main
          key={currentScreen}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto transition-opacity duration-200 animate-in fade-in"
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

        {/* Mobile Quick Bottom Navigation */}
        <nav className="md:hidden sticky bottom-0 z-20 flex items-center justify-around py-2 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-surface-border)] px-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition active:scale-95 ${
              currentScreen === 'home'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-[var(--color-text-light)]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('journal')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition active:scale-95 ${
              currentScreen === 'journal'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-[var(--color-text-light)]'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Journal</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('vault')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition active:scale-95 ${
              currentScreen === 'vault'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-[var(--color-text-light)]'
            }`}
          >
            <FolderArchive className="w-5 h-5" />
            <span className="text-[10px]">Vault</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('reminders')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl relative transition active:scale-95 ${
              currentScreen === 'reminders'
                ? 'text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-[var(--color-text-light)]'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Remind</span>
            {pendingRemindersCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              hapticLight();
              setIsMobileSidebarOpen(true);
            }}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[var(--color-text-light)] active:scale-95 transition"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
