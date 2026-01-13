
import { AppState, UserSettings, DifficultyLevel } from '../types';
import { INITIAL_NODES } from '../constants';

const STORAGE_VERSION = 'v6'; 
const KEY = `phonics_kingdom_${STORAGE_VERSION}`;

const DEFAULT_SETTINGS: UserSettings = {
  speechRate: 1.0,
  dyslexicFont: false,
  highContrast: false,
  difficulty: DifficultyLevel.NORMAL
};

export const storageService = {
  /**
   * Persists state using a multi-tiered approach.
   * Priority: Native Bridge (Survivable) > LocalStorage (Fallback)
   */
  async save(state: AppState): Promise<void> {
    try {
      const data = {
        ...state,
        _version: STORAGE_VERSION,
        _timestamp: Date.now()
      };
      const json = JSON.stringify(data);

      // 1. Web Fallback
      localStorage.setItem(KEY, json);

      // 2. Native Bridge Hook (Capacitor Secure Storage)
      if ((window as any).Capacitor?.Plugins?.SecureStorage) {
        await (window as any).Capacitor.Plugins.SecureStorage.set({
          key: KEY,
          value: json
        });
      }
      
      // 3. Cloud Sync Hook (Trigger sync if online and paired)
      if (state.profile.pairing?.isPaired && navigator.onLine) {
        this.syncWithCloud(data);
      }
    } catch (e) {
      console.error('Storage save failed:', e);
    }
  },

  async load(): Promise<AppState | null> {
    try {
      let saved: string | null = null;

      // 1. Try Native First (Survives app reinstall)
      if ((window as any).Capacitor?.Plugins?.SecureStorage) {
        const result = await (window as any).Capacitor.Plugins.SecureStorage.get({ key: KEY });
        saved = result.value;
      }

      // 2. Fallback to LocalStorage
      if (!saved) {
        saved = localStorage.getItem(KEY);
      }

      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      return this.migrateIfNeeded(parsed);
    } catch (e) {
      console.error('Storage load failed:', e);
      return null;
    }
  },

  // Removed 'private' modifier because storageService is an object literal
  async syncWithCloud(state: AppState) {
    // Placeholder for Phase 5: Firebase/Supabase Sync
    console.debug('[Cloud Sync] Pushing update to parent paired device...');
  },

  migrateIfNeeded(parsed: any): AppState {
    if (!parsed._version || parsed._version !== STORAGE_VERSION) {
      // Fix: Added missing magicSeeds to AppState and totalMagicSeeds to UserProfile default
      return {
        nodes: parsed.nodes || INITIAL_NODES,
        stars: parsed.stars || 0,
        soundShards: parsed.soundShards || 0,
        magicSeeds: parsed.magicSeeds || 0,
        characterType: parsed.characterType || 'BRIO',
        settings: parsed.settings || DEFAULT_SETTINGS,
        guardians: parsed.guardians || {},
        profile: parsed.profile || {
          id: `user_${Date.now()}`,
          playerName: 'Sound Scout',
          characterType: 'BRIO',
          totalStars: 0,
          totalSoundShards: 0,
          totalMagicSeeds: 0,
          createdDate: Date.now(),
          lastActive: Date.now(),
          masteryLevel: 1,
          consecutiveDays: 1,
          notifications: [],
          onboardingCompleted: false,
          placementScore: 0
        },
        sessions: parsed.sessions || []
      };
    }
    return parsed as AppState;
  },

  migrateFromOldVersions(): void {
    const oldKeys = ['phonics_kingdom_v1', 'phonics_kingdom_v2', 'phonics_kingdom_v3', 'phonics_kingdom_v4', 'phonics_kingdom_v5'];
    oldKeys.forEach(oldKey => {
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        try {
          const oldData = JSON.parse(oldRaw);
          if (oldData.nodes) {
            const migrated = this.migrateIfNeeded(oldData);
            this.save(migrated);
          }
          localStorage.removeItem(oldKey);
        } catch (e) {
          localStorage.removeItem(oldKey);
        }
      }
    });
  },

  clear(): void {
    localStorage.removeItem(KEY);
  }
};