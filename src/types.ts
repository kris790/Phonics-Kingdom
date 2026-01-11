// Phonics Kingdom Types

// ============================================
// Character Types
// ============================================
export interface Character {
  id: string;
  name: string;
  color: string;
  tailwindColor: string;
  voice: 'Kore' | 'Puck' | 'Zephyr';
  personality: string;
  catchphrase: string;
  specialty: string;
}

export const CHARACTERS: Record<string, Character> = {
  brio: {
    id: 'brio',
    name: 'Brio the Brave',
    color: '#2dd4bf',
    tailwindColor: 'brio-teal',
    voice: 'Puck',
    personality: 'Adventurous and encouraging',
    catchphrase: 'Sparkling Success!',
    specialty: 'Consonant sounds',
  },
  vowelia: {
    id: 'vowelia',
    name: 'Vowelia the Wise',
    color: '#a855f7',
    tailwindColor: 'vowelia-purple',
    voice: 'Kore',
    personality: 'Gentle and patient',
    catchphrase: 'Wonderful work!',
    specialty: 'Vowel sounds',
  },
  diesel: {
    id: 'diesel',
    name: 'Diesel the Digger',
    color: '#eab308',
    tailwindColor: 'diesel-yellow',
    voice: 'Zephyr',
    personality: 'Energetic and playful',
    catchphrase: 'Dig it!',
    specialty: 'Blends and digraphs',
  },
  zippy: {
    id: 'zippy',
    name: 'Zippy the Zoomer',
    color: '#ef4444',
    tailwindColor: 'zippy-red',
    voice: 'Puck',
    personality: 'Fast and fun',
    catchphrase: 'Zoom zoom!',
    specialty: 'Sight words',
  },
};

// ============================================
// Phonics Types
// ============================================
export type PhonicsCategory = 
  | 'short-vowels'
  | 'long-vowels'
  | 'consonants'
  | 'blends'
  | 'digraphs'
  | 'r-controlled'
  | 'diphthongs'
  | 'silent-e'
  | 'sight-words';

export interface PhonicsRule {
  id: string;
  category: PhonicsCategory;
  pattern: string;
  description: string;
  examples: string[];
  level: number;
}

// ============================================
// Task Types
// ============================================
export type TaskType = 
  | 'letter-sound'
  | 'word-builder'
  | 'rhyme-time'
  | 'sound-match'
  | 'fill-blank'
  | 'skyfall-shooter'
  | 'letter-trace'
  | 'word-complete';

export interface TaskOption {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  isCorrect: boolean;
}

export interface Task {
  id: string;
  type: TaskType;
  targetPhoneme: string;
  instruction: string;
  prompt: string;
  options: TaskOption[];
  correctAnswer: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
  characterId: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface TaskResult {
  taskId: string;
  correct: boolean;
  attempts: number;
  timeSpentMs: number;
  timestamp: Date;
}

// ============================================
// Game State Types
// ============================================
export interface IslandProgress {
  islandId: string;
  completedLevels: number;
  totalLevels: number;
  masteryDays: string[]; // ISO date strings of successful days
  hasShard: boolean;
}

export interface LevelSession {
  levelId: string;
  tasks: Task[];
  currentTaskIndex: number;
  results: TaskResult[];
  startTime: Date;
  isComplete: boolean;
}

export interface GameState {
  // User progress
  selectedCharacterId: string | null;
  currentIslandId: string | null;
  currentLevel: number;
  totalStars: number;
  shardsCollected: string[]; // Island IDs with mastery
  
  // Island progress
  islandProgress: Record<string, IslandProgress>;
  
  // Current session
  currentSession: LevelSession | null;
  
  // Settings
  audioEnabled: boolean;
  instructionSpeed: 'slow' | 'normal' | 'fast';
  
  // UI state
  view: AppView;
  isLoading: boolean;
  error: string | null;
}

export type AppView = 
  | 'character-select'
  | 'magic-map'
  | 'game'
  | 'parent-hub'
  | 'settings';

// ============================================
// Action Types
// ============================================
export type GameAction =
  | { type: 'SELECT_CHARACTER'; characterId: string }
  | { type: 'NAVIGATE'; view: AppView }
  | { type: 'SELECT_ISLAND'; islandId: string }
  | { type: 'START_LEVEL'; levelId: string; tasks: Task[] }
  | { type: 'SUBMIT_ANSWER'; result: TaskResult }
  | { type: 'NEXT_TASK' }
  | { type: 'GAME_COMPLETE'; accuracy: number }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'SET_INSTRUCTION_SPEED'; speed: 'slow' | 'normal' | 'fast' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'LOAD_STATE'; state: Partial<GameState> }
  | { type: 'RESET_SESSION' }
  | { type: 'REPLAY_LEVEL' };

// ============================================
// Island Types
// ============================================
export interface Island {
  id: string;
  name: string;
  description: string;
  category: PhonicsCategory;
  levels: number;
  unlockRequirement: number; // Stars needed
  position: { x: number; y: number };
  color: string;
}

export const ISLANDS: Island[] = [
  {
    id: 'consonant-cove',
    name: 'Consonant Cove',
    description: 'Learn the sounds of consonants',
    category: 'consonants',
    levels: 5,
    unlockRequirement: 0,
    position: { x: 20, y: 70 },
    color: '#3b82f6',
  },
  {
    id: 'vowel-valley',
    name: 'Vowel Valley',
    description: 'Master short and long vowels',
    category: 'short-vowels',
    levels: 5,
    unlockRequirement: 5,
    position: { x: 40, y: 50 },
    color: '#a855f7',
  },
  {
    id: 'blend-beach',
    name: 'Blend Beach',
    description: 'Combine consonants together',
    category: 'blends',
    levels: 5,
    unlockRequirement: 15,
    position: { x: 60, y: 65 },
    color: '#f59e0b',
  },
  {
    id: 'digraph-den',
    name: 'Digraph Den',
    description: 'Two letters, one sound',
    category: 'digraphs',
    levels: 5,
    unlockRequirement: 25,
    position: { x: 75, y: 40 },
    color: '#10b981',
  },
  {
    id: 'sight-word-summit',
    name: 'Sight Word Summit',
    description: 'Words to know by heart',
    category: 'sight-words',
    levels: 5,
    unlockRequirement: 35,
    position: { x: 50, y: 25 },
    color: '#ef4444',
  },
];

// ============================================
// Telemetry Types
// ============================================
export interface TelemetryEvent {
  eventType: 'task_complete' | 'level_complete' | 'session_start' | 'session_end';
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface AnalyticsData {
  totalSessions: number;
  totalTasksCompleted: number;
  averageAccuracy: number;
  timeSpentMinutes: number;
  masteredSkills: string[];
  recentSessions: SessionSummary[];
}

export interface SessionSummary {
  date: string;
  islandId: string;
  levelId: string;
  accuracy: number;
  tasksCompleted: number;
  timeSpentMinutes: number;
}

