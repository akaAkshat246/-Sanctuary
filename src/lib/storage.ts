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
  OCCASIONS_SHOWN: 'sanctuary_occasions_shown',
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

// Safe JSON parse helper
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving localStorage key "${key}":`, error);
  }
}

export const Storage = {
  // Profile
  getProfile: (): UserProfile => {
    return safeGet<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },
  setProfile: (profile: UserProfile): void => {
    safeSet(STORAGE_KEYS.PROFILE, profile);
  },

  // Theme
  getTheme: (): 'light' | 'dark' => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },
  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Journals
  getJournals: (): JournalEntry[] => {
    return safeGet<JournalEntry[]>(STORAGE_KEYS.JOURNALS, []);
  },
  saveJournal: (entry: JournalEntry): void => {
    const list = Storage.getJournals();
    const index = list.findIndex(j => j.id === entry.id);
    if (index >= 0) {
      list[index] = entry;
    } else {
      list.unshift(entry);
    }
    safeSet(STORAGE_KEYS.JOURNALS, list);
  },
  deleteJournal: (id: string): void => {
    const list = Storage.getJournals().filter(j => j.id !== id);
    safeSet(STORAGE_KEYS.JOURNALS, list);
  },

  // Draft
  getDraft: (): { title: string; content: string } | null => {
    return safeGet(STORAGE_KEYS.DRAFT, null);
  },
  saveDraft: (draft: { title: string; content: string }): void => {
    safeSet(STORAGE_KEYS.DRAFT, draft);
  },
  clearDraft: (): void => {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  },

  // Memories
  getMemories: (): MemoryItem[] => {
    return safeGet<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
  },
  saveMemory: (item: MemoryItem): void => {
    const list = Storage.getMemories();
    list.unshift(item);
    safeSet(STORAGE_KEYS.MEMORIES, list);
  },
  deleteMemory: (id: string): void => {
    const list = Storage.getMemories().filter(m => m.id !== id);
    safeSet(STORAGE_KEYS.MEMORIES, list);
  },
  toggleMemoryFavourite: (id: string): void => {
    const list = Storage.getMemories();
    const item = list.find(m => m.id === id);
    if (item) {
      item.isFavourite = !item.isFavourite;
      safeSet(STORAGE_KEYS.MEMORIES, list);
    }
  },

  // Reminders
  getReminders: (): ReminderItem[] => {
    return safeGet<ReminderItem[]>(STORAGE_KEYS.REMINDERS, []);
  },
  saveReminder: (reminder: ReminderItem): void => {
    const list = Storage.getReminders();
    const index = list.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      list[index] = reminder;
    } else {
      list.unshift(reminder);
    }
    safeSet(STORAGE_KEYS.REMINDERS, list);
  },
  deleteReminder: (id: string): void => {
    const list = Storage.getReminders().filter(r => r.id !== id);
    safeSet(STORAGE_KEYS.REMINDERS, list);
  },
  toggleReminderComplete: (id: string): void => {
    const list = Storage.getReminders();
    const item = list.find(r => r.id === id);
    if (item) {
      item.completed = !item.completed;
      safeSet(STORAGE_KEYS.REMINDERS, list);
    }
  },

  // Moods
  getMoods: (): MoodLog[] => {
    return safeGet<MoodLog[]>(STORAGE_KEYS.MOODS, []);
  },
  saveMood: (log: MoodLog): void => {
    const list = Storage.getMoods();
    const existingIndex = list.findIndex(m => m.date === log.date);
    if (existingIndex >= 0) {
      list[existingIndex] = log;
    } else {
      list.unshift(log);
    }
    safeSet(STORAGE_KEYS.MOODS, list);
  },

  // Links
  getLinks: (): SavedLink[] => {
    return safeGet<SavedLink[]>(STORAGE_KEYS.LINKS, []);
  },
  saveLink: (link: SavedLink): void => {
    const list = Storage.getLinks();
    list.unshift(link);
    safeSet(STORAGE_KEYS.LINKS, list);
  },
  deleteLink: (id: string): void => {
    const list = Storage.getLinks().filter(l => l.id !== id);
    safeSet(STORAGE_KEYS.LINKS, list);
  },

  // Clear all sanctuary data
  clearAllSanctuaryData: (): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sanctuary_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Export full backup
  exportBackup: (): string => {
    const data: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([, key]) => {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    });
    return JSON.stringify(data, null, 2);
  }
};
