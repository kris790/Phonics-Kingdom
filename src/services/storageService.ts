// Storage Service - LocalStorage persistence layer
import { GameState, IslandProgress, SessionSummary, AnalyticsData } from '../types';

const STORAGE_KEYS = {
  GAME_STATE: 'phonics-kingdom-state',
  ANALYTICS: 'phonics-kingdom-analytics',
  TTS_CACHE: 'phonics-kingdom-tts-cache',
  SESSION_HISTORY: 'phonics-kingdom-sessions',
} as const;

// Default initial state
const getDefaultState = (): GameState => ({
  selectedCharacterId: null,
  currentIslandId: null,
  currentLevel: 1,
  totalStars: 0,
  shardsCollected: [],
  islandProgress: {},
  currentSession: null,
  audioEnabled: true,
  instructionSpeed: 'normal',
  view: 'character-select',
  isLoading: false,
  error: null,
});

export const storageService = {
  // Save entire game state
  saveState: (state: GameState): void => {
    try {
      const stateToSave = {
        ...state,
        // Don't persist transient UI state
        isLoading: false,
        error: null,
        currentSession: null,
      };
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  // Load game state
  loadState: (): Partial<GameState> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return null;
  },

  // Get initial state (merged with saved)
  getInitialState: (): GameState => {
    const defaultState = getDefaultState();
    const savedState = storageService.loadState();
    
    if (savedState) {
      return {
        ...defaultState,
        ...savedState,
        // Reset transient state
        isLoading: false,
        error: null,
        currentSession: null,
      };
    }
    
    return defaultState;
  },

  // Update island progress
  updateIslandProgress: (islandId: string, progress: Partial<IslandProgress>): void => {
    try {
      const state = storageService.loadState();
      if (state) {
        const currentProgress = state.islandProgress?.[islandId] || {
          islandId,
          completedLevels: 0,
          totalLevels: 5,
          masteryDays: [],
          hasShard: false,
        };
        
        const updatedProgress = { ...currentProgress, ...progress };
        const updatedState = {
          ...state,
          islandProgress: {
            ...state.islandProgress,
            [islandId]: updatedProgress,
          },
        };
        
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(updatedState));
      }
    } catch (error) {
      console.error('Failed to update island progress:', error);
    }
  },

  // Record mastery day
  recordMasteryDay: (islandId: string): boolean => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const state = storageService.loadState();
      
      if (state?.islandProgress?.[islandId]) {
        const progress = state.islandProgress[islandId];
        
        // Check if already recorded today
        if (progress.masteryDays.includes(today)) {
          return false;
        }
        
        const updatedDays = [...progress.masteryDays, today];
        const hasShard = updatedDays.length >= 3; // 3 days = mastery
        
        storageService.updateIslandProgress(islandId, {
          masteryDays: updatedDays,
          hasShard,
        });
        
        return hasShard;
      }
    } catch (error) {
      console.error('Failed to record mastery day:', error);
    }
    return false;
  },

  // Save session summary for analytics
  saveSessionSummary: (summary: SessionSummary): void => {
    try {
      const sessions = storageService.getSessionHistory();
      sessions.push(summary);
      
      // Keep only last 100 sessions
      const trimmed = sessions.slice(-100);
      localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save session summary:', error);
    }
  },

  // Get session history
  getSessionHistory: (): SessionSummary[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
    return [];
  },

  // Get analytics data for Parent Hub
  getAnalytics: (): AnalyticsData => {
    const sessions = storageService.getSessionHistory();
    const state = storageService.loadState();
    
    const totalSessions = sessions.length;
    const totalTasksCompleted = sessions.reduce((sum, s) => sum + s.tasksCompleted, 0);
    const averageAccuracy = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length
      : 0;
    const timeSpentMinutes = sessions.reduce((sum, s) => sum + s.timeSpentMinutes, 0);
    
    const masteredSkills = Object.values(state?.islandProgress || {})
      .filter(p => p.hasShard)
      .map(p => p.islandId);
    
    return {
      totalSessions,
      totalTasksCompleted,
      averageAccuracy: Math.round(averageAccuracy),
      timeSpentMinutes: Math.round(timeSpentMinutes),
      masteredSkills,
      recentSessions: sessions.slice(-10).reverse(),
    };
  },

  // TTS Cache management
  cacheTTS: (phrase: string, audioData: string): void => {
    try {
      const cache = storageService.getTTSCache();
      cache[phrase] = audioData;
      
      // Limit cache size (keep ~50 items)
      const keys = Object.keys(cache);
      if (keys.length > 50) {
        const toRemove = keys.slice(0, keys.length - 50);
        toRemove.forEach(key => delete cache[key]);
      }
      
      localStorage.setItem(STORAGE_KEYS.TTS_CACHE, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache TTS:', error);
    }
  },

  getTTSCache: (): Record<string, string> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TTS_CACHE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load TTS cache:', error);
    }
    return {};
  },

  getCachedTTS: (phrase: string): string | null => {
    const cache = storageService.getTTSCache();
    return cache[phrase] || null;
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Export data for backup
  exportData: (): string => {
    const data = {
      state: storageService.loadState(),
      sessions: storageService.getSessionHistory(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import data from backup
  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.state) {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data.state));
      }
      if (data.sessions) {
        localStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.sessions));
      }
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },
};
