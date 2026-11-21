export type Gender = 'She/Her' | 'He/Him' | 'They/Them';

export interface UserProfile {
  id: string;
  name: string;
  gender: Gender;
  birthday: string; // YYYY-MM-DD
  avatar: string;
  theme: 'light' | 'dark' | 'system';
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export type MoodType = 'peaceful' | 'radiant' | 'contemplative' | 'tender' | 'weary';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type MemoryFileType = 'image' | 'video' | 'audio' | 'doc' | 'pdf';

export interface MemoryItem {
  id: string;
  title: string;
  type: MemoryFileType;
  fileUrl: string; // Data URL or Native File URI
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  isFavourite: boolean;
  createdAt: string;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: PriorityLevel;
  completed: boolean;
  createdAt: string;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  score: number; // 1-5
  label: MoodType;
  note?: string;
  createdAt: string;
}
