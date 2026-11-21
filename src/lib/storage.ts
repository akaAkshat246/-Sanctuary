import { Preferences } from '@capacitor/preferences';
import { Database } from './database';
import { NativeFiles } from './filesystem';
import type { UserProfile, JournalEntry, MemoryItem, ReminderItem, SavedLink, MoodLog } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'sanctuary_profile',
  THEME: 'sanctuary_theme',
  JOURNALS: 'sanctuary_journals',
  MEMORIES: 'sanctuary_memories',
  REMINDERS: 'sanctuary_reminders',
  LINKS: 'sanctuary_links',
  MOODS: 'sanctuary_moods',
  DRAFT: 'sanctuary_draft',
  MIGRATED: 'sanctuary_migrated_sqlite_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default',
  name: 'Traveler',
  gender: 'They/Them',
  birthday: '',
  avatar: '🐱',
  theme: 'light',
  hasCompletedOnboarding: false,
  createdAt: new Date().toISOString(),
};

function safeGetLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function safeSetLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving localStorage key "${key}":`, error);
  }
}

export const Storage = {
  // App Startup Migration Check (Day 11 & Day 14)
  async migrateFromLocalStorageIfNeeded(): Promise<void> {
    const alreadyMigrated = localStorage.getItem(STORAGE_KEYS.MIGRATED);
    if (alreadyMigrated) return;

    try {
      // Migrate Profile to Preferences
      const localProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (localProfile) {
        await Preferences.set({ key: STORAGE_KEYS.PROFILE, value: localProfile });
      }

      // Migrate Journals to SQLite
      const localJournals = safeGetLocal<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
      for (const j of localJournals) {
        await Database.saveJournal(j);
      }

      // Migrate Reminders to SQLite
      const localReminders = safeGetLocal<ReminderItem[]>(STORAGE_KEYS.REMINDERS, []);
      for (const r of localReminders) {
        await Database.saveReminder(r);
      }

      // Migrate Memories to SQLite
      const localMemories = safeGetLocal<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
      for (const m of localMemories) {
        await Database.saveMemory(m);
      }

      // Migrate Links to SQLite
      const localLinks = safeGetLocal<SavedLink[]>(STORAGE_KEYS.LINKS, []);
      for (const l of localLinks) {
        await Database.saveLink(l);
      }

      localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
      console.log('Sanctuary: Local data migration to native storage layer succeeded.');
    } catch (e) {
      console.warn('Migration to native storage skipped or errored:', e);
    }
  },

  // Profile (Preferences + Cache)
  getProfile(): UserProfile {
    return safeGetLocal<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },
  async getProfileAsync(): Promise<UserProfile> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.PROFILE });
      if (value) {
        const parsed = JSON.parse(value);
        safeSetLocal(STORAGE_KEYS.PROFILE, parsed);
        return parsed;
      }
    } catch {
      // fallback to local
    }
    return Storage.getProfile();
  },
  async setProfile(profile: UserProfile): Promise<void> {
    safeSetLocal(STORAGE_KEYS.PROFILE, profile);
    try {
      await Preferences.set({
        key: STORAGE_KEYS.PROFILE,
        value: JSON.stringify(profile)
      });
    } catch (e) {
      console.warn('Preferences setProfile error:', e);
    }
  },

  // Theme
  getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      await Preferences.set({ key: STORAGE_KEYS.THEME, value: theme });
    } catch {
      // ignore
    }
  },

  // Journals (SQLite with fallback)
  async getJournalsAsync(): Promise<JournalEntry[]> {
    const fromDb = await Database.getJournals();
    if (fromDb !== null) {
      safeSetLocal(STORAGE_KEYS.JOURNALS, fromDb);
      return fromDb;
    }
    return safeGetLocal<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
  },
  getJournals(): JournalEntry[] {
    return safeGetLocal<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
  },
  async saveJournal(entry: JournalEntry): Promise<void> {
    const list = Storage.getJournals();
    const index = list.findIndex(j => j.id === entry.id);
    if (index >= 0) {
      list[index] = entry;
    } else {
      list.unshift(entry);
    }
    safeSetLocal(STORAGE_KEYS.JOURNALS, list);
    await Database.saveJournal(entry);
  },
  async deleteJournal(id: string): Promise<void> {
    const list = Storage.getJournals().filter(j => j.id !== id);
    safeSetLocal(STORAGE_KEYS.JOURNALS, list);
    await Database.deleteJournal(id);
  },

  // Draft
  getDraft(): { title: string; content: string } | null {
    return safeGetLocal(STORAGE_KEYS.DRAFT, null);
  },
  saveDraft(draft: { title: string; content: string }): void {
    safeSetLocal(STORAGE_KEYS.DRAFT, draft);
  },
  clearDraft(): void {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  },

  // Memories (Filesystem + SQLite with fallback)
  async getMemoriesAsync(): Promise<MemoryItem[]> {
    const fromDb = await Database.getMemories();
    if (fromDb !== null) {
      // Convert URIs for display
      const processed = fromDb.map(m => ({
        ...m,
        fileUrl: NativeFiles.getDisplayUrl(m.fileUrl)
      }));
      safeSetLocal(STORAGE_KEYS.MEMORIES, processed);
      return processed;
    }
    return safeGetLocal<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
  },
  getMemories(): MemoryItem[] {
    return safeGetLocal<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
  },
  async saveMemory(item: MemoryItem): Promise<void> {
    // 1. Save file data to phone filesystem (or keep dataUrl in web)
    const nativeUri = await NativeFiles.saveFile(item.fileName, item.fileUrl);
    const updatedItem: MemoryItem = {
      ...item,
      fileUrl: nativeUri
    };

    // 2. Save reference to SQLite
    await Database.saveMemory(updatedItem, nativeUri);

    // 3. Cache locally for immediate UI display
    const list = Storage.getMemories();
    list.unshift({
      ...updatedItem,
      fileUrl: NativeFiles.getDisplayUrl(nativeUri)
    });
    safeSetLocal(STORAGE_KEYS.MEMORIES, list);
  },
  async deleteMemory(id: string, fileUri?: string): Promise<void> {
    if (fileUri) {
      await NativeFiles.deleteFile(fileUri);
    }
    await Database.deleteMemory(id);
    const list = Storage.getMemories().filter(m => m.id !== id);
    safeSetLocal(STORAGE_KEYS.MEMORIES, list);
  },
  async toggleMemoryFavourite(id: string): Promise<void> {
    const list = Storage.getMemories();
    const item = list.find(m => m.id === id);
    if (item) {
      item.isFavourite = !item.isFavourite;
      await Database.toggleMemoryFavourite(id, item.isFavourite);
      safeSetLocal(STORAGE_KEYS.MEMORIES, list);
    }
  },

  // Reminders (SQLite with fallback)
  async getRemindersAsync(): Promise<ReminderItem[]> {
    const fromDb = await Database.getReminders();
    if (fromDb !== null) {
      safeSetLocal(STORAGE_KEYS.REMINDERS, fromDb);
      return fromDb;
    }
    return safeGetLocal<ReminderItem[]>(STORAGE_KEYS.REMINDERS, []);
  },
  getReminders(): ReminderItem[] {
    return safeGetLocal<ReminderItem[]>(STORAGE_KEYS.REMINDERS, []);
  },
  async saveReminder(reminder: ReminderItem): Promise<void> {
    const list = Storage.getReminders();
    const index = list.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      list[index] = reminder;
    } else {
      list.unshift(reminder);
    }
    safeSetLocal(STORAGE_KEYS.REMINDERS, list);
    await Database.saveReminder(reminder);
  },
  async deleteReminder(id: string): Promise<void> {
    const list = Storage.getReminders().filter(r => r.id !== id);
    safeSetLocal(STORAGE_KEYS.REMINDERS, list);
    await Database.deleteReminder(id);
  },
  async toggleReminderComplete(id: string): Promise<void> {
    const list = Storage.getReminders();
    const item = list.find(r => r.id === id);
    if (item) {
      item.completed = !item.completed;
      await Database.toggleReminderComplete(id, item.completed);
      safeSetLocal(STORAGE_KEYS.REMINDERS, list);
    }
  },

  // Moods
  async getMoodsAsync(): Promise<MoodLog[]> {
    const fromDb = await Database.getMoods();
    if (fromDb !== null) {
      safeSetLocal(STORAGE_KEYS.MOODS, fromDb);
      return fromDb;
    }
    return safeGetLocal<MoodLog[]>(STORAGE_KEYS.MOODS, []);
  },
  async saveMood(log: MoodLog): Promise<void> {
    const list = safeGetLocal<MoodLog[]>(STORAGE_KEYS.MOODS, []);
    const existingIndex = list.findIndex(m => m.date === log.date);
    if (existingIndex >= 0) {
      list[existingIndex] = log;
    } else {
      list.unshift(log);
    }
    safeSetLocal(STORAGE_KEYS.MOODS, list);
    await Database.saveMood(log);
  },

  // Links
  async getLinksAsync(): Promise<SavedLink[]> {
    const fromDb = await Database.getLinks();
    if (fromDb !== null) {
      safeSetLocal(STORAGE_KEYS.LINKS, fromDb);
      return fromDb;
    }
    return safeGetLocal<SavedLink[]>(STORAGE_KEYS.LINKS, []);
  },
  getLinks(): SavedLink[] {
    return safeGetLocal<SavedLink[]>(STORAGE_KEYS.LINKS, []);
  },
  async saveLink(link: SavedLink): Promise<void> {
    const list = Storage.getLinks();
    list.unshift(link);
    safeSetLocal(STORAGE_KEYS.LINKS, list);
    await Database.saveLink(link);
  },
  async deleteLink(id: string): Promise<void> {
    const list = Storage.getLinks().filter(l => l.id !== id);
    safeSetLocal(STORAGE_KEYS.LINKS, list);
    await Database.deleteLink(id);
  },

  // Wipe all sanctuary data safely
  async clearAllSanctuaryData(): Promise<void> {
    try {
      await Preferences.clear();
    } catch {
      // ignore
    }
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sanctuary_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Export full backup
  exportBackup(): string {
    const data: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([, key]) => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          data[key] = JSON.parse(val);
        } catch {
          data[key] = val;
        }
      }
    });
    return JSON.stringify(data, null, 2);
  }
};
