// Native Storage Service - Persistent storage across app reinstalls
// Uses Capacitor Preferences (native) with localStorage fallback (web)

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { GameState, IslandProgress, SessionSummary } from '../types';

// Storage keys - same as storageService for migration
const STORAGE_KEYS = {
  GAME_STATE: 'phonics-kingdom-state',
  ANALYTICS: 'phonics-kingdom-analytics',
  SESSION_HISTORY: 'phonics-kingdom-sessions',
  SYNC_TIMESTAMP: 'phonics-kingdom-last-sync',
  USER_ID: 'phonics-kingdom-user-id',
} as const;

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

/**
 * Generate a unique anonymous user ID for data sync
 */
const generateUserId = (): string => {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Low-level get from native storage
 */
const nativeGet = async (key: string): Promise<string | null> => {
  if (isNative) {
    const { value } = await Preferences.get({ key });
    return value;
  } else {
    return localStorage.getItem(key);
  }
};

/**
 * Low-level set to native storage
 */
const nativeSet = async (key: string, value: string): Promise<void> => {
  if (isNative) {
    await Preferences.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
};

/**
 * Low-level remove from native storage
 */
const nativeRemove = async (key: string): Promise<void> => {
  if (isNative) {
    await Preferences.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
};

/**
 * Native Storage Service
 * Provides persistent storage that survives app reinstalls on native platforms
 */
export const nativeStorageService = {
  /**
   * Check if using native storage
   */
  isNative: (): boolean => isNative,

  /**
   * Get or create anonymous user ID
   */
  getUserId: async (): Promise<string> => {
    let userId = await nativeGet(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = generateUserId();
      await nativeSet(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  },

  /**
   * Save game state to persistent storage
   */
  saveState: async (state: GameState): Promise<void> => {
    try {
      const stateToSave = {
        ...state,
        // Don't persist transient UI state
        isLoading: false,
        error: null,
        currentSession: null,
        // Add sync metadata
        _lastSaved: new Date().toISOString(),
      };
      await nativeSet(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateToSave));
      
      // Also save to localStorage for web fallback
      if (isNative) {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(stateToSave));
      }
    } catch (error) {
      console.error('[NativeStorage] Failed to save state:', error);
      throw error;
    }
  },

  /**
   * Load game state from persistent storage
   */
  loadState: async (): Promise<Partial<GameState> | null> => {
    try {
      const saved = await nativeGet(STORAGE_KEYS.GAME_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Remove internal metadata
        delete parsed._lastSaved;
        return parsed;
      }
    } catch (error) {
      console.error('[NativeStorage] Failed to load state:', error);
    }
    return null;
  },

  /**
   * Update island progress
   */
  updateIslandProgress: async (
    islandId: string, 
    progress: Partial<IslandProgress>
  ): Promise<void> => {
    try {
      const state = await nativeStorageService.loadState();
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
        
        await nativeSet(STORAGE_KEYS.GAME_STATE, JSON.stringify(updatedState));
      }
    } catch (error) {
      console.error('[NativeStorage] Failed to update island progress:', error);
    }
  },

  /**
   * Save session history
   */
  saveSession: async (session: SessionSummary): Promise<void> => {
    try {
      const history = await nativeStorageService.getSessionHistory();
      
      // Keep last 50 sessions
      const updatedHistory = [session, ...history].slice(0, 50);
      await nativeSet(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('[NativeStorage] Failed to save session:', error);
    }
  },

  /**
   * Get session history
   */
  getSessionHistory: async (): Promise<SessionSummary[]> => {
    try {
      const saved = await nativeGet(STORAGE_KEYS.SESSION_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('[NativeStorage] Failed to load session history:', error);
    }
    return [];
  },

  /**
   * Migrate data from localStorage to native storage
   * Call this once on app upgrade from web to native
   */
  migrateFromLocalStorage: async (): Promise<boolean> => {
    if (!isNative) return false;

    try {
      // Check if already migrated
      const existingNative = await nativeGet(STORAGE_KEYS.GAME_STATE);
      if (existingNative) {
        console.log('[NativeStorage] Already has native data, skipping migration');
        return false;
      }

      // Migrate game state
      const localState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (localState) {
        await nativeSet(STORAGE_KEYS.GAME_STATE, localState);
        console.log('[NativeStorage] Migrated game state');
      }

      // Migrate session history
      const localSessions = localStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
      if (localSessions) {
        await nativeSet(STORAGE_KEYS.SESSION_HISTORY, localSessions);
        console.log('[NativeStorage] Migrated session history');
      }

      console.log('[NativeStorage] Migration complete');
      return true;
    } catch (error) {
      console.error('[NativeStorage] Migration failed:', error);
      return false;
    }
  },

  /**
   * Clear all data
   */
  clearAll: async (): Promise<void> => {
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        await nativeRemove(key);
        localStorage.removeItem(key);
      }
      console.log('[NativeStorage] All data cleared');
    } catch (error) {
      console.error('[NativeStorage] Failed to clear data:', error);
    }
  },

  /**
   * Export all data for backup
   */
  exportData: async (): Promise<string> => {
    const [state, sessions, userId] = await Promise.all([
      nativeStorageService.loadState(),
      nativeStorageService.getSessionHistory(),
      nativeStorageService.getUserId(),
    ]);

    const exportData = {
      version: 1,
      userId,
      state,
      sessions,
      exportedAt: new Date().toISOString(),
      platform: isNative ? Capacitor.getPlatform() : 'web',
    };

    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Import data from backup
   */
  importData: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.state) {
        await nativeSet(STORAGE_KEYS.GAME_STATE, JSON.stringify(data.state));
      }
      if (data.sessions) {
        await nativeSet(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(data.sessions));
      }
      
      console.log('[NativeStorage] Data imported successfully');
      return true;
    } catch (error) {
      console.error('[NativeStorage] Import failed:', error);
      return false;
    }
  },

  /**
   * Get storage info for debugging
   */
  getStorageInfo: async (): Promise<{
    isNative: boolean;
    platform: string;
    hasState: boolean;
    sessionCount: number;
    userId: string;
  }> => {
    const [state, sessions, userId] = await Promise.all([
      nativeStorageService.loadState(),
      nativeStorageService.getSessionHistory(),
      nativeStorageService.getUserId(),
    ]);

    return {
      isNative,
      platform: isNative ? Capacitor.getPlatform() : 'web',
      hasState: state !== null,
      sessionCount: sessions.length,
      userId,
    };
  },
};

export default nativeStorageService;
