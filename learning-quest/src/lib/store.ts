import { create } from 'zustand';
import { db } from './db';

interface GameState {
  level: number;
  xp: number;
  streak: number;
  loadStats: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  checkStreak: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  xp: 0,
  streak: 0,
  
  loadStats: async () => {
    let stats = await db.userStats.get('main');
    if (!stats) {
      stats = {
        id: 'main',
        level: 1,
        xp: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      };
      await db.userStats.put(stats);
    }
    set({ level: stats.level, xp: stats.xp, streak: stats.streak });
  },

  addXp: async (amount: number) => {
    const current = get();
    let newXp = current.xp + amount;
    let newLevel = current.level;
    
    // Logic dasar: Butuh XP (Level * 100) untuk naik level
    let xpRequiredForNextLevel = newLevel * 100;
    while (newXp >= xpRequiredForNextLevel) {
      newXp -= xpRequiredForNextLevel;
      newLevel += 1;
      xpRequiredForNextLevel = newLevel * 100;
      // TODO: Trigger animasi level up atau notifikasi
    }

    set({ xp: newXp, level: newLevel });
    await db.userStats.update('main', { xp: newXp, level: newLevel });
  },

  checkStreak: async () => {
    const stats = await db.userStats.get('main');
    if (!stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = stats.lastActiveDate;
    
    if (today !== lastActive) {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      let newStreak = stats.streak;
      if (lastActive === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1; // Streak putus
      }

      set({ streak: newStreak });
      await db.userStats.update('main', { 
        streak: newStreak, 
        lastActiveDate: today 
      });
    }
  }
}));
