import { Preferences } from '@capacitor/preferences';
import { Database } from './database';
import { NativeFiles } from './filesystem';
import type { UserProfile, JournalEntry, MemoryItem, ReminderItem, MoodLog, TagItem, SavedLink } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'sanctuary_profile',
  THEME: 'sanctuary_theme',
  JOURNALS: 'sanctuary_journals',
  MEMORIES: 'sanctuary_memories',
  REMINDERS: 'sanctuary_reminders',
  MOODS: 'sanctuary_moods',
  LINKS: 'sanctuary_links',
  TAGS: 'sanctuary_tags',
  DRAFT: 'sanctuary_draft',
  MIGRATED: 'sanctuary_migrated_sqlite_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_default',
  name: 'Akshat',
  gender: 'Male',
  birthday: '2006-09-18',
  avatar: '',
  theme: 'light',
  fontSize: 'default',
  hasCompletedOnboarding: false,
  createdAt: new Date().toISOString(),
};

const DEFAULT_TAGS: TagItem[] = [
  { id: 'tag_1', name: 'Peaceful', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'tag_2', name: 'Ideas', color: '#06b6d4', createdAt: new Date().toISOString() },
  { id: 'tag_3', name: 'Daily', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'tag_4', name: 'Mindset', color: '#8b5cf6', createdAt: new Date().toISOString() },
  { id: 'tag_5', name: 'Gratitude', color: '#ec4899', createdAt: new Date().toISOString() },
];

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

  // Tags
  getTags(): TagItem[] {
    return safeGetLocal<TagItem[]>(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
  },
  async getTagsAsync(): Promise<TagItem[]> {
    return Storage.getTags();
  },
  async saveTag(tag: TagItem): Promise<void> {
    const list = Storage.getTags();
    const index = list.findIndex(t => t.id === tag.id);
    if (index >= 0) {
      list[index] = tag;
    } else {
      list.push(tag);
    }
    safeSetLocal(STORAGE_KEYS.TAGS, list);
  },
  async deleteTag(id: string): Promise<void> {
    const list = Storage.getTags().filter(t => t.id !== id);
    safeSetLocal(STORAGE_KEYS.TAGS, list);
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

  // Font Size
  setFontSize(size: 'small' | 'default' | 'large'): void {
    const root = document.documentElement;
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  },

  // Wipe all sanctuary data safely
  async clearAllSanctuaryData(): Promise<void> {
    try {
      await Preferences.clear();
    } catch {
      // ignore
    }
    try {
      await Database.clearAllTables();
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
  },

  // Import full backup
  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      for (const [key, val] of Object.entries(data)) {
        if (!key.startsWith('sanctuary_')) continue;
        const serialized = typeof val === 'string' ? val : JSON.stringify(val);
        localStorage.setItem(key, serialized);

        // Also sync profile into Preferences if present
        if (key === STORAGE_KEYS.PROFILE) {
          try {
            await Preferences.set({ key, value: serialized });
          } catch {
            // ignore
          }
        }
      }

      // Sync imported items into SQLite
      if (Array.isArray(data[STORAGE_KEYS.JOURNALS])) {
        for (const j of data[STORAGE_KEYS.JOURNALS] as JournalEntry[]) {
          await Database.saveJournal(j);
        }
      }
      if (Array.isArray(data[STORAGE_KEYS.REMINDERS])) {
        for (const r of data[STORAGE_KEYS.REMINDERS] as ReminderItem[]) {
          await Database.saveReminder(r);
        }
      }
      if (Array.isArray(data[STORAGE_KEYS.MEMORIES])) {
        for (const m of data[STORAGE_KEYS.MEMORIES] as MemoryItem[]) {
          await Database.saveMemory(m);
        }
      }

      return true;
    } catch (e) {
      console.error('Storage importBackup error:', e);
      return false;
    }
  }
};
