import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Child {
  id: number;
  name: string;
  age?: number;
  photo?: string;
  startDate: string;
  dailyGoal: number; // e.g., 5
  mainGoal: string; // e.g., "جزء عمّ"
  stars: number;
  completedOnboarding: boolean;
  completedTour: boolean;
}

export interface MemorizationSession {
  id?: number;
  surahId: number;
  fromAyah: number;
  toAyah: number;
  count: number;
  date: string;
  duration: number; // in minutes
  notes?: string;
}

export interface ReviewSession {
  id?: number;
  surahId: number;
  date: string;
  score: number; // 1 to 5
  notes?: string;
}

export interface SurahProgress {
  surahId: number;
  savedAyahs: number; // Total unique ayahs saved
  ayahsArray: number[]; // Array of exactly which ayahs are saved to prevent overlap
  lastReview?: string;
  retentionScore: number; // 0 to 100
  confirmed: boolean; // Confirmed by parent if 100% completed
}

export interface Achievement {
  id: string; // e.g., "first_step", "surah_1", "ayahs_50"
  unlocked: boolean;
  date?: string;
}

interface QuranAppDB extends DBSchema {
  child: {
    key: number;
    value: Child;
  };
  sessions: {
    key: number;
    value: MemorizationSession;
    indexes: { 'by-date': string; 'by-surah': number };
  };
  reviews: {
    key: number;
    value: ReviewSession;
    indexes: { 'by-date': string; 'by-surah': number };
  };
  progress: {
    key: number;
    value: SurahProgress;
  };
  achievements: {
    key: string;
    value: Achievement;
  };
}

let dbPromise: Promise<IDBPDatabase<QuranAppDB>> | null = null;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<QuranAppDB>('QuranJourneyDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('child')) {
          db.createObjectStore('child', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('by-date', 'date');
          sessionStore.createIndex('by-surah', 'surahId');
        }
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
          reviewStore.createIndex('by-date', 'date');
          reviewStore.createIndex('by-surah', 'surahId');
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'surahId' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const dbApi = {
  async getChild(): Promise<Child | undefined> {
    const db = await initDB();
    return db.get('child', 1);
  },
  async saveChild(child: Child): Promise<void> {
    const db = await initDB();
    await db.put('child', child);
  },
  async getProgress(surahId: number): Promise<SurahProgress | undefined> {
    const db = await initDB();
    return db.get('progress', surahId);
  },
  async getAllProgress(): Promise<SurahProgress[]> {
    const db = await initDB();
    return db.getAll('progress');
  },
  async saveProgress(progress: SurahProgress): Promise<void> {
    const db = await initDB();
    await db.put('progress', progress);
  },
  async addSession(session: MemorizationSession): Promise<number> {
    const db = await initDB();
    return db.add('sessions', session);
  },
  async getSessionsByDate(date: string): Promise<MemorizationSession[]> {
    const db = await initDB();
    return db.getAllFromIndex('sessions', 'by-date', date);
  },
  async getAllSessions(): Promise<MemorizationSession[]> {
    const db = await initDB();
    return db.getAll('sessions');
  },
  async addReview(review: ReviewSession): Promise<number> {
    const db = await initDB();
    return db.add('reviews', review);
  },
  async getReviews(): Promise<ReviewSession[]> {
    const db = await initDB();
    return db.getAll('reviews');
  },
  async saveAchievement(achievement: Achievement): Promise<void> {
    const db = await initDB();
    await db.put('achievements', achievement);
  },
  async getAchievements(): Promise<Achievement[]> {
    const db = await initDB();
    return db.getAll('achievements');
  },
  async exportData(): Promise<string> {
    const db = await initDB();
    const child = await db.get('child', 1);
    const sessions = await db.getAll('sessions');
    const reviews = await db.getAll('reviews');
    const progress = await db.getAll('progress');
    const achievements = await db.getAll('achievements');
    
    return JSON.stringify({ child, sessions, reviews, progress, achievements });
  },
  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const db = await initDB();
    
    const tx = db.transaction(['child', 'sessions', 'reviews', 'progress', 'achievements'], 'readwrite');
    if (data.child) await tx.objectStore('child').put(data.child);
    
    if (data.sessions) {
      await tx.objectStore('sessions').clear();
      for (const s of data.sessions) await tx.objectStore('sessions').put(s);
    }
    if (data.reviews) {
      await tx.objectStore('reviews').clear();
      for (const r of data.reviews) await tx.objectStore('reviews').put(r);
    }
    if (data.progress) {
      await tx.objectStore('progress').clear();
      for (const p of data.progress) await tx.objectStore('progress').put(p);
    }
    if (data.achievements) {
      await tx.objectStore('achievements').clear();
      for (const a of data.achievements) await tx.objectStore('achievements').put(a);
    }
    await tx.done;
  }
};
