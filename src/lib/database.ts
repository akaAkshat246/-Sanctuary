import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { JournalEntry, MemoryItem, ReminderItem, SavedLink, MoodLog } from '../types';

const DB_NAME = 'sanctuary_db';
let sqliteConnection: SQLiteConnection | null = null;
let dbInstance: SQLiteDBConnection | null = null;

// Initialize SQLite Database and create tables
export async function getDatabase(): Promise<SQLiteDBConnection | null> {
  if (!Capacitor.isNativePlatform()) {
    // In web mode, we return null and fallback gracefully
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    if (!sqliteConnection) {
      sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    const ret = await sqliteConnection.checkConnectionsConsistency();
    const isConn = (await sqliteConnection.isConnection(DB_NAME, false)).result;

    if (ret.result && isConn) {
      dbInstance = await sqliteConnection.retrieveConnection(DB_NAME, false);
    } else {
      dbInstance = await sqliteConnection.createConnection(
        DB_NAME,
        false,
        'no-encryption',
        1,
        false
      );
    }

    await dbInstance.open();

    // Define table schemas
    const schema = `
      CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood TEXT NOT NULL,
        tags TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileName TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        mimeType TEXT NOT NULL,
        isFavourite INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        priority TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS moods (
        id TEXT PRIMARY KEY,
        date TEXT UNIQUE NOT NULL,
        score INTEGER NOT NULL,
        label TEXT NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    await dbInstance.execute(schema);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    return null;
  }
}

// Native SQLite CRUD Operations with Web Safe Fallbacks

export const Database = {
  // Journals
  async getJournals(): Promise<JournalEntry[] | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM journals ORDER BY createdAt DESC;');
      if (!res.values) return [];
      return res.values.map(v => ({
        ...v,
        tags: v.tags ? JSON.parse(v.tags) : []
      })) as JournalEntry[];
    } catch (e) {
      console.error('SQLite getJournals error:', e);
      return null;
    }
  },

  async saveJournal(entry: JournalEntry): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      const sql = `
        INSERT OR REPLACE INTO journals (id, title, content, mood, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      await db.run(sql, [
        entry.id,
        entry.title,
        entry.content,
        entry.mood,
        JSON.stringify(entry.tags || []),
        entry.createdAt,
        entry.updatedAt
      ]);
      return true;
    } catch (e) {
      console.error('SQLite saveJournal error:', e);
      return false;
    }
  },

  async deleteJournal(id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('DELETE FROM journals WHERE id = ?;', [id]);
      return true;
    } catch (e) {
      console.error('SQLite deleteJournal error:', e);
      return false;
    }
  },

  // Memories
  async getMemories(): Promise<MemoryItem[] | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM memories ORDER BY createdAt DESC;');
      if (!res.values) return [];
      return res.values.map(v => ({
        id: v.id,
        title: v.title,
        type: v.type,
        fileUrl: v.filePath,
        fileName: v.fileName,
        fileSize: v.fileSize,
        mimeType: v.mimeType,
        isFavourite: Boolean(v.isFavourite),
        createdAt: v.createdAt
      })) as MemoryItem[];
    } catch (e) {
      console.error('SQLite getMemories error:', e);
      return null;
    }
  },

  async saveMemory(item: MemoryItem, nativePath?: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      const sql = `
        INSERT OR REPLACE INTO memories (id, title, type, filePath, fileName, fileSize, mimeType, isFavourite, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      await db.run(sql, [
        item.id,
        item.title,
        item.type,
        nativePath || item.fileUrl,
        item.fileName,
        item.fileSize,
        item.mimeType,
        item.isFavourite ? 1 : 0,
        item.createdAt
      ]);
      return true;
    } catch (e) {
      console.error('SQLite saveMemory error:', e);
      return false;
    }
  },

  async deleteMemory(id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('DELETE FROM memories WHERE id = ?;', [id]);
      return true;
    } catch (e) {
      console.error('SQLite deleteMemory error:', e);
      return false;
    }
  },

  async toggleMemoryFavourite(id: string, isFav: boolean): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('UPDATE memories SET isFavourite = ? WHERE id = ?;', [isFav ? 1 : 0, id]);
      return true;
    } catch (e) {
      console.error('SQLite toggleMemoryFavourite error:', e);
      return false;
    }
  },

  // Reminders
  async getReminders(): Promise<ReminderItem[] | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM reminders ORDER BY dueDate ASC;');
      if (!res.values) return [];
      return res.values.map(v => ({
        ...v,
        completed: Boolean(v.completed)
      })) as ReminderItem[];
    } catch (e) {
      console.error('SQLite getReminders error:', e);
      return null;
    }
  },

  async saveReminder(reminder: ReminderItem): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      const sql = `
        INSERT OR REPLACE INTO reminders (id, title, description, dueDate, priority, completed, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      await db.run(sql, [
        reminder.id,
        reminder.title,
        reminder.description || null,
        reminder.dueDate,
        reminder.priority,
        reminder.completed ? 1 : 0,
        reminder.createdAt
      ]);
      return true;
    } catch (e) {
      console.error('SQLite saveReminder error:', e);
      return false;
    }
  },

  async deleteReminder(id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('DELETE FROM reminders WHERE id = ?;', [id]);
      return true;
    } catch (e) {
      console.error('SQLite deleteReminder error:', e);
      return false;
    }
  },

  async toggleReminderComplete(id: string, completed: boolean): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('UPDATE reminders SET completed = ? WHERE id = ?;', [completed ? 1 : 0, id]);
      return true;
    } catch (e) {
      console.error('SQLite toggleReminderComplete error:', e);
      return false;
    }
  },

  // Moods
  async getMoods(): Promise<MoodLog[] | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM moods ORDER BY date DESC LIMIT 30;');
      return (res.values || []) as MoodLog[];
    } catch (e) {
      console.error('SQLite getMoods error:', e);
      return null;
    }
  },

  async saveMood(log: MoodLog): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      const sql = `
        INSERT OR REPLACE INTO moods (id, date, score, label, note, createdAt)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      await db.run(sql, [log.id, log.date, log.score, log.label, log.note || null, log.createdAt]);
      return true;
    } catch (e) {
      console.error('SQLite saveMood error:', e);
      return false;
    }
  },

  // Links
  async getLinks(): Promise<SavedLink[] | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const res = await db.query('SELECT * FROM links ORDER BY createdAt DESC;');
      return (res.values || []) as SavedLink[];
    } catch (e) {
      console.error('SQLite getLinks error:', e);
      return null;
    }
  },

  async saveLink(link: SavedLink): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      const sql = 'INSERT OR REPLACE INTO links (id, title, url, createdAt) VALUES (?, ?, ?, ?);';
      await db.run(sql, [link.id, link.title, link.url, link.createdAt]);
      return true;
    } catch (e) {
      console.error('SQLite saveLink error:', e);
      return false;
    }
  },

  async deleteLink(id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) return false;
    try {
      await db.run('DELETE FROM links WHERE id = ?;', [id]);
      return true;
    } catch (e) {
      console.error('SQLite deleteLink error:', e);
      return false;
    }
  }
};
