export type GenderType = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | 'He/Him' | 'She/Her' | 'They/Them';
export type Gender = GenderType;

export interface UserProfile {
  id: string;
  name: string;
  gender: GenderType;
  birthday: string; // YYYY-MM-DD
  avatar?: string;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'default' | 'large';
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export type MoodType = 'Radiant' | 'Calm' | 'Neutral' | 'Low' | 'Stormy';

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  note?: string;
  createdAt: string;
}

export type JournalCategory = 'PEACEFUL' | 'JOYFUL' | 'REFLECTIVE' | 'MELANCHOLIC' | 'ENERGETIC';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: JournalCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type MemoryCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'DOC' | 'OTHER';

export interface MemoryItem {
  id: string;
  title: string;
  caption?: string;
  type: MemoryCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isFavourite: boolean;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  completed: boolean;
  createdAt: string;
}

export interface TagItem {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}
