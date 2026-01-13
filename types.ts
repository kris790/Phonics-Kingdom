
export enum SkillLevel {
  PHONEMIC_AWARENESS = 'PHONEMIC_AWARENESS',
  LETTER_SOUNDS = 'LETTER_SOUNDS',
  DIGRAPHS_BLENDS = 'DIGRAPHS_BLENDS',
  BLENDING_CVC = 'BLENDING_CVC',
  SIGHT_WORDS = 'SIGHT_WORDS'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export type CharacterType = 
  | 'BRIO' 
  | 'VOWELIA' 
  | 'DIESEL' 
  | 'ZIPPY';

export type ActivityType = 
  | 'MULTIPLE_CHOICE' 
  | 'TRACING' 
  | 'RHYME_RACER' 
  | 'WORD_WEAVER' 
  | 'SOUND_SORTER'
  | 'CVC_BUILDER'
  | 'VOICE_LAB'
  | 'SKYFALL_SHOOTER';

export type PhonicsSound = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export interface Task {
  prompt: string;
  narrative?: string;
  options: string[];
  correctIndex: number;
  type: ActivityType;
  targetWord?: string;
  wordParts?: string[];
  letterToTrace?: string;
  targetSound?: string;
}

export interface SlotState {
  id: number;
  position: 'initial' | 'middle' | 'final';
  expectedLetter: string;
  currentLetter: string | null;
  isCorrect: boolean | null;
  phoneme: PhonicsSound;
}

export interface SkillNode {
  id: string;
  level: SkillLevel;
  title: string;
  description: string;
  standard: string; 
  isLocked: boolean;
  isMastered: boolean;
  attempts: number;
  successivePasses: number;
  accuracy: number;
  coordinates: { x: number; y: number };
  lastAttemptAt?: number;
  timeSpent: number;
}

export interface MasteredGuardian {
  sound: string;
  name: string;
  lore: string;
  imageUrl: string;
}

export interface UserSettings {
  speechRate: number;
  dyslexicFont: boolean;
  highContrast: boolean;
  difficulty: DifficultyLevel;
}

export interface PairingState {
  isPaired: boolean;
  pairingCode?: string;
  parentDeviceId?: string;
  lastSynced?: number;
}

// User & Progress
export interface UserProfile {
  id: string;
  playerName: string;
  characterType: CharacterType;
  totalStars: number;
  totalSoundShards: number;
  totalMagicSeeds: number;
  createdDate: number;
  lastActive: number;
  masteryLevel: number;
  consecutiveDays: number;
  onboardingCompleted: boolean;
  placementScore: number;
  lastDailyChallenge?: number;
  notifications: string[];
  pairing?: PairingState;
}

// Game Session
export interface GameSession {
  id: string;
  skillId: string;
  startTime: number;
  endTime?: number;
  accuracy: number;
  tasksCompleted: number;
  errorStreak: number;
  hintCount: number;
  avgResponseTime: number;
  starsEarned: number;
  shardsEarned: number;
  seedsEarned: number;
}

export interface AppState {
  nodes: SkillNode[];
  stars: number;
  soundShards: number;
  magicSeeds: number;
  characterType: CharacterType;
  settings: UserSettings;
  guardians: Record<string, MasteredGuardian>;
  profile: UserProfile;
  sessions: GameSession[];
}

export interface ActivityProps {
  skill: SkillNode;
  characterType: CharacterType;
  onComplete: (accuracy: number, skillId: string, timeSpent: number, session: GameSession) => void;
  onExit: () => void;
  settings: UserSettings;
}
