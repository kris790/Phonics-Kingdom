// Dummy Data Service - Sample data for testing and demos
// This populates the app with realistic session history and progress

import { GameState, SessionSummary, IslandProgress } from '../types';
import { storageService } from './storageService';

// Generate a date string for N days ago
const daysAgo = (n: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
};

// Sample session data representing 2 weeks of play
const DUMMY_SESSIONS: SessionSummary[] = [
  // Week 1 - Starting with Consonant Cove
  { date: daysAgo(14), islandId: 'consonant-cove', levelId: 'consonant-cove-level-1', accuracy: 75, tasksCompleted: 5, timeSpentMinutes: 8 },
  { date: daysAgo(13), islandId: 'consonant-cove', levelId: 'consonant-cove-level-1', accuracy: 82, tasksCompleted: 5, timeSpentMinutes: 7 },
  { date: daysAgo(12), islandId: 'consonant-cove', levelId: 'consonant-cove-level-2', accuracy: 88, tasksCompleted: 5, timeSpentMinutes: 6 },
  { date: daysAgo(11), islandId: 'consonant-cove', levelId: 'consonant-cove-level-2', accuracy: 92, tasksCompleted: 5, timeSpentMinutes: 5 },
  { date: daysAgo(10), islandId: 'consonant-cove', levelId: 'consonant-cove-level-3', accuracy: 85, tasksCompleted: 5, timeSpentMinutes: 7 },
  
  // Week 2 - Moved to Vowel Valley, struggling a bit
  { date: daysAgo(9), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 68, tasksCompleted: 5, timeSpentMinutes: 10 },
  { date: daysAgo(8), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 55, tasksCompleted: 5, timeSpentMinutes: 12 },
  { date: daysAgo(7), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 72, tasksCompleted: 5, timeSpentMinutes: 9 },
  { date: daysAgo(5), islandId: 'vowel-valley', levelId: 'vowel-valley-level-2', accuracy: 78, tasksCompleted: 5, timeSpentMinutes: 8 },
  { date: daysAgo(4), islandId: 'consonant-cove', levelId: 'consonant-cove-level-4', accuracy: 90, tasksCompleted: 5, timeSpentMinutes: 6 },
  
  // Recent days - Mix of practice
  { date: daysAgo(3), islandId: 'consonant-cove', levelId: 'consonant-cove-level-5', accuracy: 88, tasksCompleted: 5, timeSpentMinutes: 7 },
  { date: daysAgo(2), islandId: 'vowel-valley', levelId: 'vowel-valley-level-2', accuracy: 82, tasksCompleted: 5, timeSpentMinutes: 8 },
  { date: daysAgo(1), islandId: 'blend-beach', levelId: 'blend-beach-level-1', accuracy: 70, tasksCompleted: 5, timeSpentMinutes: 10 },
  { date: daysAgo(0), islandId: 'blend-beach', levelId: 'blend-beach-level-1', accuracy: 75, tasksCompleted: 5, timeSpentMinutes: 9 },
];

// Sample island progress
const DUMMY_ISLAND_PROGRESS: Record<string, IslandProgress> = {
  'consonant-cove': {
    islandId: 'consonant-cove',
    completedLevels: 4,
    totalLevels: 5,
    masteryDays: [daysAgo(10), daysAgo(4), daysAgo(3)], // 3 days = mastered!
    hasShard: true,
  },
  'vowel-valley': {
    islandId: 'vowel-valley',
    completedLevels: 2,
    totalLevels: 5,
    masteryDays: [daysAgo(5)], // Only 1 mastery day so far
    hasShard: false,
  },
  'blend-beach': {
    islandId: 'blend-beach',
    completedLevels: 0,
    totalLevels: 5,
    masteryDays: [],
    hasShard: false,
  },
  'digraph-den': {
    islandId: 'digraph-den',
    completedLevels: 0,
    totalLevels: 5,
    masteryDays: [],
    hasShard: false,
  },
  'sight-word-summit': {
    islandId: 'sight-word-summit',
    completedLevels: 0,
    totalLevels: 5,
    masteryDays: [],
    hasShard: false,
  },
};

// Dummy game state
const DUMMY_GAME_STATE: Partial<GameState> = {
  selectedCharacterId: 'brio',
  currentIslandId: null,
  currentLevel: 1,
  totalStars: 28, // Earned from completed sessions
  shardsCollected: ['consonant-cove'], // One mastered island
  islandProgress: DUMMY_ISLAND_PROGRESS,
  audioEnabled: true,
  instructionSpeed: 'normal',
  view: 'magic-map',
};

export const dummyDataService = {
  /**
   * Check if dummy data has already been loaded
   */
  isDummyDataLoaded: (): boolean => {
    const sessions = storageService.getSessionHistory();
    return sessions.length > 0;
  },

  /**
   * Seed the app with dummy data for testing/demo
   * Only seeds if no data exists
   */
  seedIfEmpty: (): boolean => {
    if (dummyDataService.isDummyDataLoaded()) {
      console.log('[DummyData] Data already exists, skipping seed');
      return false;
    }

    return dummyDataService.forceSeed();
  },

  /**
   * Force seed dummy data (overwrites existing)
   */
  forceSeed: (): boolean => {
    try {
      console.log('[DummyData] Seeding dummy data...');

      // Clear existing data
      storageService.clearAll();

      // Save game state
      const fullState: GameState = {
        ...DUMMY_GAME_STATE,
        // User profile fields
        playerName: DUMMY_GAME_STATE.playerName || 'Demo Player',
        hasCompletedOnboarding: true,
        hasCompletedAssessment: true,
        hasSeenWorldIntro: true,
        startingSkillLevel: null,
        masteredGuardians: [],
        lastDailyChallengeDate: null,
        dailyChallengeStreak: 0,
        // Existing fields
        selectedCharacterId: DUMMY_GAME_STATE.selectedCharacterId || null,
        currentIslandId: DUMMY_GAME_STATE.currentIslandId || null,
        currentLevel: DUMMY_GAME_STATE.currentLevel || 1,
        totalStars: DUMMY_GAME_STATE.totalStars || 0,
        shardsCollected: DUMMY_GAME_STATE.shardsCollected || [],
        islandProgress: DUMMY_GAME_STATE.islandProgress || {},
        currentSession: null,
        audioEnabled: DUMMY_GAME_STATE.audioEnabled ?? true,
        instructionSpeed: DUMMY_GAME_STATE.instructionSpeed || 'normal',
        view: 'magic-map',
        isLoading: false,
        error: null,
      };
      storageService.saveState(fullState);

      // Save session history
      for (const session of DUMMY_SESSIONS) {
        storageService.saveSessionSummary(session);
      }

      console.log('[DummyData] Seeding complete!');
      console.log(`  - ${DUMMY_SESSIONS.length} sessions`);
      console.log(`  - ${Object.keys(DUMMY_ISLAND_PROGRESS).length} islands with progress`);
      console.log(`  - ${fullState.totalStars} stars earned`);
      console.log(`  - ${fullState.shardsCollected.length} King Shard(s)`);

      return true;
    } catch (error) {
      console.error('[DummyData] Failed to seed:', error);
      return false;
    }
  },

  /**
   * Get a summary of what dummy data would create
   */
  getSummary: (): {
    sessions: number;
    stars: number;
    shards: number;
    islandsWithProgress: number;
  } => {
    return {
      sessions: DUMMY_SESSIONS.length,
      stars: DUMMY_GAME_STATE.totalStars || 0,
      shards: DUMMY_GAME_STATE.shardsCollected?.length || 0,
      islandsWithProgress: Object.values(DUMMY_ISLAND_PROGRESS).filter(p => p.completedLevels > 0).length,
    };
  },

  /**
   * Add a single dummy session (for incremental testing)
   */
  addSession: (overrides?: Partial<SessionSummary>): void => {
    const session: SessionSummary = {
      date: new Date().toISOString().split('T')[0],
      islandId: 'consonant-cove',
      levelId: 'consonant-cove-level-1',
      accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
      tasksCompleted: 5,
      timeSpentMinutes: Math.floor(Math.random() * 5) + 5, // 5-10 min
      ...overrides,
    };
    storageService.saveSessionSummary(session);
  },

  /**
   * Simulate a struggling learner (for testing recommendations)
   */
  seedStrugglingProfile: (): void => {
    storageService.clearAll();

    const strugglingSessions: SessionSummary[] = [
      { date: daysAgo(5), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 45, tasksCompleted: 5, timeSpentMinutes: 15 },
      { date: daysAgo(4), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 52, tasksCompleted: 5, timeSpentMinutes: 14 },
      { date: daysAgo(3), islandId: 'vowel-valley', levelId: 'vowel-valley-level-1', accuracy: 48, tasksCompleted: 5, timeSpentMinutes: 16 },
      { date: daysAgo(2), islandId: 'consonant-cove', levelId: 'consonant-cove-level-1', accuracy: 55, tasksCompleted: 5, timeSpentMinutes: 12 },
      { date: daysAgo(1), islandId: 'consonant-cove', levelId: 'consonant-cove-level-1', accuracy: 50, tasksCompleted: 5, timeSpentMinutes: 13 },
    ];

    for (const session of strugglingSessions) {
      storageService.saveSessionSummary(session);
    }

    const strugglingState: GameState = {
      playerName: 'Struggling Learner',
      hasCompletedOnboarding: true,
      hasCompletedAssessment: true,
      hasSeenWorldIntro: true,
      startingSkillLevel: null,
      masteredGuardians: [],
      lastDailyChallengeDate: null,
      dailyChallengeStreak: 0,
      selectedCharacterId: 'vowelia',
      currentIslandId: null,
      currentLevel: 1,
      totalStars: 5,
      shardsCollected: [],
      islandProgress: {
        'consonant-cove': { islandId: 'consonant-cove', completedLevels: 0, totalLevels: 5, masteryDays: [], hasShard: false },
        'vowel-valley': { islandId: 'vowel-valley', completedLevels: 0, totalLevels: 5, masteryDays: [], hasShard: false },
      },
      currentSession: null,
      audioEnabled: true,
      instructionSpeed: 'slow',
      view: 'magic-map',
      isLoading: false,
      error: null,
    };
    storageService.saveState(strugglingState);

    console.log('[DummyData] Seeded struggling learner profile');
  },

  /**
   * Simulate an advanced learner (for testing mastery features)
   */
  seedAdvancedProfile: (): void => {
    storageService.clearAll();

    const advancedSessions: SessionSummary[] = [];
    for (let i = 20; i >= 0; i--) {
      advancedSessions.push({
        date: daysAgo(i),
        islandId: i > 15 ? 'consonant-cove' : i > 10 ? 'vowel-valley' : i > 5 ? 'blend-beach' : 'digraph-den',
        levelId: 'level-' + ((i % 5) + 1),
        accuracy: 85 + Math.floor(Math.random() * 15), // 85-100%
        tasksCompleted: 5,
        timeSpentMinutes: 5 + Math.floor(Math.random() * 3),
      });
    }

    for (const session of advancedSessions) {
      storageService.saveSessionSummary(session);
    }

    const advancedState: GameState = {
      playerName: 'Advanced Learner',
      hasCompletedOnboarding: true,
      hasCompletedAssessment: true,
      hasSeenWorldIntro: true,
      startingSkillLevel: null,
      masteredGuardians: [],
      lastDailyChallengeDate: null,
      dailyChallengeStreak: 5,
      selectedCharacterId: 'diesel',
      currentIslandId: null,
      currentLevel: 1,
      totalStars: 85,
      shardsCollected: ['consonant-cove', 'vowel-valley', 'blend-beach'],
      islandProgress: {
        'consonant-cove': { islandId: 'consonant-cove', completedLevels: 5, totalLevels: 5, masteryDays: [daysAgo(18), daysAgo(17), daysAgo(16)], hasShard: true },
        'vowel-valley': { islandId: 'vowel-valley', completedLevels: 5, totalLevels: 5, masteryDays: [daysAgo(13), daysAgo(12), daysAgo(11)], hasShard: true },
        'blend-beach': { islandId: 'blend-beach', completedLevels: 5, totalLevels: 5, masteryDays: [daysAgo(8), daysAgo(7), daysAgo(6)], hasShard: true },
        'digraph-den': { islandId: 'digraph-den', completedLevels: 3, totalLevels: 5, masteryDays: [daysAgo(3), daysAgo(2)], hasShard: false },
        'sight-word-summit': { islandId: 'sight-word-summit', completedLevels: 0, totalLevels: 5, masteryDays: [], hasShard: false },
      },
      currentSession: null,
      audioEnabled: true,
      instructionSpeed: 'fast',
      view: 'magic-map',
      isLoading: false,
      error: null,
    };
    storageService.saveState(advancedState);

    console.log('[DummyData] Seeded advanced learner profile');
  },
};

export default dummyDataService;
