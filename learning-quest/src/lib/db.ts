import Dexie, { type EntityTable } from 'dexie';

export interface UserStats {
  id: string;
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: "daily" | "main" | "side";
  category: string;
  xpReward: number;
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  linkedTopicId?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  title: string;
  parentId?: string;
  status: "locked" | "in-progress" | "mastered";
  progress: number;
  linkedNoteIds: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  topicsStudied: string[];
  durationMinutes: number;
  notes: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
}

const db = new Dexie('LearningQuestDB') as Dexie & {
  userStats: EntityTable<UserStats, 'id'>;
  quests: EntityTable<Quest, 'id'>;
  topics: EntityTable<Topic, 'id'>;
  notes: EntityTable<Note, 'id'>;
  dailyLogs: EntityTable<DailyLog, 'id'>;
  achievements: EntityTable<Achievement, 'id'>;
};

// Skema database
db.version(1).stores({
  userStats: 'id',
  quests: 'id, type, status, dueDate, category',
  topics: 'id, parentId, status',
  notes: 'id, title, createdAt, updatedAt',
  dailyLogs: 'id, date',
  achievements: 'id'
});

export { db };
