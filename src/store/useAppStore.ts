import { create } from 'zustand';
import { dbApi, Child, SurahProgress, Achievement, MemorizationSession, ReviewSession } from '../lib/db';
import { JUZ_AMMA, TOTAL_JUZ_AMMA_AYAHS, TOTAL_JUZ_AMMA_SURAHS } from '../lib/constants';

interface AppState {
  child: Child | null;
  progress: Record<number, SurahProgress>;
  achievements: Record<string, Achievement>;
  sessions: MemorizationSession[];
  reviews: ReviewSession[];
  isLoading: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  updateChild: (child: Partial<Child>) => Promise<void>;
  addSession: (session: MemorizationSession) => Promise<void>;
  addReview: (review: ReviewSession) => Promise<void>;
  checkAchievements: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  child: null,
  progress: {},
  achievements: {},
  sessions: [],
  reviews: [],
  isLoading: true,

  loadData: async () => {
    set({ isLoading: true });
    const child = await dbApi.getChild();
    const progressList = await dbApi.getAllProgress();
    const achievementsList = await dbApi.getAchievements();
    const sessions = await dbApi.getAllSessions();
    const reviews = await dbApi.getReviews();

    const progressMap: Record<number, SurahProgress> = {};
    progressList.forEach(p => { progressMap[p.surahId] = p; });

    const achievementsMap: Record<string, Achievement> = {};
    achievementsList.forEach(a => { achievementsMap[a.id] = a; });

    set({ 
      child: child || null, 
      progress: progressMap, 
      achievements: achievementsMap,
      sessions,
      reviews,
      isLoading: false 
    });
  },

  updateChild: async (updates: Partial<Child>) => {
    const current = get().child;
    let newChild: Child;
    if (current) {
      newChild = { ...current, ...updates };
    } else {
      newChild = {
        id: 1,
        name: updates.name || '',
        startDate: new Date().toISOString(),
        dailyGoal: 5,
        mainGoal: "جزء عمّ",
        stars: 0,
        completedOnboarding: true,
        completedTour: false,
        ...updates
      };
    }
    await dbApi.saveChild(newChild);
    set({ child: newChild });
  },

  addSession: async (session: MemorizationSession) => {
    const { progress, child } = get();
    if (!child) return;
    
    // Save session
    await dbApi.addSession(session);
    
    // Update progress
    let surahProg = progress[session.surahId];
    if (!surahProg) {
      surahProg = {
        surahId: session.surahId,
        savedAyahs: 0,
        ayahsArray: [],
        retentionScore: 0,
        confirmed: false
      };
    }
    
    // Add unique ayahs
    const newAyahs = new Set(surahProg.ayahsArray);
    for (let i = session.fromAyah; i <= session.toAyah; i++) {
      newAyahs.add(i);
    }
    surahProg.ayahsArray = Array.from(newAyahs).sort((a, b) => a - b);
    surahProg.savedAyahs = surahProg.ayahsArray.length;
    
    await dbApi.saveProgress(surahProg);
    
    // Award stars (1 per ayah + 20 for completion)
    const newAyahsCount = session.count; 
    let starsEarned = newAyahsCount;
    
    const surahInfo = JUZ_AMMA.find(s => s.id === session.surahId);
    if (surahInfo && surahProg.savedAyahs === surahInfo.ayahCount && !surahProg.confirmed) {
       // Completed surah for the first time
       starsEarned += 20;
    }
    
    await get().updateChild({ stars: child.stars + starsEarned });
    
    await get().loadData();
    await get().checkAchievements();
  },

  addReview: async (review: ReviewSession) => {
    const { progress, child } = get();
    if (!child) return;

    await dbApi.addReview(review);

    let surahProg = progress[review.surahId];
    if (surahProg) {
      surahProg.lastReview = review.date;
      // Simple retention formula based on score (1-5)
      // Score 5 = +20%, Score 1 = -20%
      const retentionChange = (review.score - 3) * 10; 
      surahProg.retentionScore = Math.max(0, Math.min(100, surahProg.retentionScore + retentionChange));
      if (review.score === 5 && !surahProg.confirmed) {
         surahProg.confirmed = true;
      }
      await dbApi.saveProgress(surahProg);
    }
    
    await get().updateChild({ stars: child.stars + 5 + (review.score === 5 ? 10 : 0) });
    
    await get().loadData();
    await get().checkAchievements();
  },

  checkAchievements: async () => {
    const { sessions, progress, achievements, child } = get();
    if (!child) return;

    const newAchievements: Achievement[] = [];
    
    const checkAndAward = async (id: string, condition: boolean) => {
      if (condition && !achievements[id]) {
        const achievement = { id, unlocked: true, date: new Date().toISOString() };
        await dbApi.saveAchievement(achievement);
        newAchievements.push(achievement);
      }
    };

    // 1. First step
    await checkAndAward('first_step', sessions.length > 0);
    
    // 2. Total ayahs logic
    const totalAyahs = Object.values(progress).reduce((acc, p) => acc + p.savedAyahs, 0);
    await checkAndAward('ayahs_50', totalAyahs >= 50);
    await checkAndAward('ayahs_100', totalAyahs >= 100);
    
    // 3. Completed surahs
    let completedSurahs = 0;
    for (const s of JUZ_AMMA) {
      if (progress[s.id] && progress[s.id].savedAyahs === s.ayahCount) {
        completedSurahs++;
      }
    }
    await checkAndAward('first_surah', completedSurahs >= 1);
    await checkAndAward('surahs_10', completedSurahs >= 10);
    await checkAndAward('juz_half', completedSurahs >= 18); // roughly half
    await checkAndAward('juz_amma', completedSurahs === TOTAL_JUZ_AMMA_SURAHS);

    // 4. Streak (simplified)
    // Extract unique dates
    const uniqueDates = Array.from(new Set(sessions.map(s => s.date.split('T')[0]))).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    
    if (uniqueDates.length > 0) {
      currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
         const prev = new Date(uniqueDates[i-1]);
         const curr = new Date(uniqueDates[i]);
         const diffTime = Math.abs(curr.getTime() - prev.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
         } else {
            currentStreak = 1;
         }
      }
    }
    await checkAndAward('streak_7', maxStreak >= 7);
    await checkAndAward('streak_30', maxStreak >= 30);

    if (newAchievements.length > 0) {
      await get().loadData(); // reload to get new achievements
    }
  }
}));
