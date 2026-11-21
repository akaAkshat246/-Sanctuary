import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, JournalEntry, MemoryItem, ReminderItem, SavedLink } from './types';
import { Storage } from './lib/storage';
import { BottomNav } from './components/BottomNav';
import type { NavTab } from './components/BottomNav';
import { MoreDrawer } from './components/MoreDrawer';
import { ProfileSheet } from './components/ProfileSheet';
import { OnboardingModal } from './components/OnboardingModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { VaultScreen } from './screens/VaultScreen';
import { JournalScreen } from './screens/JournalScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { JourneyScreen } from './screens/JourneyScreen';
import { TagsScreen } from './screens/TagsScreen';
import { LinksScreen } from './screens/LinksScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(() => Storage.getProfile());
  const [journals, setJournals] = useState<JournalEntry[]>(() => Storage.getJournals());
  const [memories, setMemories] = useState<MemoryItem[]>(() => Storage.getMemories());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => Storage.getReminders());
  const [links, setLinks] = useState<SavedLink[]>(() => Storage.getLinks());

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subView, setSubView] = useState<'journey' | 'tags' | 'links' | 'settings' | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);

  // Modals
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !Storage.getProfile().hasCompletedOnboarding);

  // Reload all sanctuary data from native storage (SQLite + Preferences + Filesystem)
  const refreshData = useCallback(async () => {
    const [prof, jnls, mems, rems, lnks] = await Promise.all([
      Storage.getProfileAsync(),
      Storage.getJournalsAsync(),
      Storage.getMemoriesAsync(),
      Storage.getRemindersAsync(),
      Storage.getLinksAsync(),
    ]);

    setProfile(prof);
    setJournals(jnls);
    setMemories(mems);
    setReminders(rems);
    setLinks(lnks);
  }, []);

  useEffect(() => {
    const savedTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initial background migration & sync
    Storage.migrateFromLocalStorageIfNeeded().then(() => {
      refreshData();
    });
  }, [refreshData]);

  const handleOpenJournal = (id: string) => {
    setSubView(null);
    setEditingJournalId(id);
    setActiveTab('journal');
  };

  const handleStartNewJournal = () => {
    setSubView(null);
    setEditingJournalId(null);
    setActiveTab('journal');
  };

  const pendingRemindersCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-on-surface)] transition-colors duration-300 relative flex flex-col selection:bg-teal-500/20">
      {/* Background ambient gradient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none -z-10" />

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-4 flex-1">
        {subView === 'journey' ? (
          <JourneyScreen
            entries={journals}
            onOpenJournal={handleOpenJournal}
            onBack={() => setSubView(null)}
          />
        ) : subView === 'tags' ? (
          <TagsScreen
            entries={journals}
            onOpenJournal={handleOpenJournal}
            onBack={() => setSubView(null)}
          />
        ) : subView === 'links' ? (
          <LinksScreen
            links={links}
            onRefresh={refreshData}
            onBack={() => setSubView(null)}
          />
        ) : subView === 'settings' ? (
          <SettingsScreen
            profile={profile}
            onRefresh={refreshData}
            onBack={() => setSubView(null)}
          />
        ) : activeTab === 'home' ? (
          <HomeScreen
            profile={profile}
            journals={journals}
            memories={memories}
            reminders={reminders}
            onOpenProfile={() => setIsProfileOpen(true)}
            onNavigateTab={(tab) => {
              setSubView(null);
              setActiveTab(tab);
            }}
            onNewJournal={handleStartNewJournal}
          />
        ) : activeTab === 'vault' ? (
          <VaultScreen memories={memories} onRefresh={refreshData} />
        ) : activeTab === 'journal' ? (
          <JournalScreen
            entries={journals}
            onRefresh={refreshData}
            initialEditingId={editingJournalId}
            onClearInitialEdit={() => setEditingJournalId(null)}
          />
        ) : (
          <RemindersScreen reminders={reminders} onRefresh={refreshData} />
        )}
      </main>

      {/* Floating Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSubView(null);
          setActiveTab(tab);
        }}
        onOpenMore={() => setIsMoreOpen(true)}
        pendingRemindersCount={pendingRemindersCount}
      />

      {/* More Options Drawer */}
      <MoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onSelectOption={(option) => {
          if (option === 'privacy' || option === 'terms') {
            setSubView('settings');
          } else {
            setSubView(option);
          }
        }}
      />

      {/* Profile Modal */}
      <ProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(updated) => {
          Storage.setProfile(updated);
          setProfile(updated);
        }}
      />

      {/* Onboarding Modal for First Launch */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newProfile) => {
          Storage.setProfile(newProfile);
          setProfile(newProfile);
          setIsOnboardingOpen(false);
        }}
      />
    </div>
  );
}

export default App;
