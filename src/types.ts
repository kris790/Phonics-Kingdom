// Phonics Kingdom Types

// ============================================
// Character Types
// ============================================
export interface CharacterPersonality {
  trait: string;
  fear: string;
  dream: string;
  quirk: string;
  backstory: string;
  teachingStyle: string;
}

export interface CharacterVoiceLines {
  greeting: string[];
  correct: string[];
  incorrect: string[];
  encouragement: string[];
  levelComplete: string[];
}

export interface Character {
  id: string;
  name: string;
  color: string;
  tailwindColor: string;
  voice: 'Kore' | 'Puck' | 'Zephyr';
  personality: CharacterPersonality;
  catchphrase: string;
  specialty: string;
  voiceLines: CharacterVoiceLines;
  visualQuirk: string;
}

export const CHARACTERS: Record<string, Character> = {
  brio: {
    id: 'brio',
    name: 'Brio the Beatboxer',
    color: '#2dd4bf',
    tailwindColor: 'brio-teal',
    voice: 'Puck',
    catchphrase: "Let's find your beat!",
    specialty: 'Consonant sounds & rhythm',
    visualQuirk: 'beatbox-dots',
    personality: {
      trait: 'Anxious perfectionist who finds courage through rhythm',
      fear: 'Losing his rhythm and confidence',
      dream: 'To teach every child to find their own beat',
      quirk: 'Taps everything he sees - tables, walls, his own knees',
      backstory: 'Former royal musician who lost confidence when the Scrambler stole the kingdom\'s music. Now rebuilds his courage by teaching children to find their rhythm.',
      teachingStyle: 'Uses beats and rhythm to make sounds memorable',
    },
    voiceLines: {
      greeting: [
        "*tsk-ka-tsk* You're back! Let's bounce!",
        "Hey rhythm seeker! Ready to find your beat?",
        "*beatboxes softly* Hear that? That's the sound of learning!",
      ],
      correct: [
        "*tsk-ka-tsk* YES! That rhythm's in your bones now!",
        "You're finding your beat! *happy beatbox*",
        "Feel that groove? That's the sound of success!",
        "*beatboxes celebration* Nailed it!",
      ],
      incorrect: [
        "Almost... listen to the space between the sounds...",
        "*gentle tap-tap* That's close! Let's find the rhythm together.",
        "Hey, even I miss beats sometimes. Try tapping it out!",
      ],
      encouragement: [
        "Every great beatboxer started with one sound!",
        "*soft rhythm* Take your time, find your flow...",
        "The rhythm is inside you - let's bring it out!",
      ],
      levelComplete: [
        "*full beatbox celebration* You ROCKED that level!",
        "The kingdom's rhythm is getting stronger because of you!",
        "Come back soon - the beat misses you!",
      ],
    },
  },
  vowelia: {
    id: 'vowelia',
    name: 'Vowelia the Weaver',
    color: '#a855f7',
    tailwindColor: 'vowelia-purple',
    voice: 'Kore',
    catchphrase: 'Even whispers can be powerful...',
    specialty: 'Vowel sounds & word magic',
    visualQuirk: 'glowing-aura',
    personality: {
      trait: 'Shy but secretly powerful',
      fear: 'Speaking too loudly and overwhelming others',
      dream: 'To help every child discover the magic in their voice',
      quirk: 'Her hair glows brighter when children succeed',
      backstory: 'A shy librarian who discovered her whispers could make flowers bloom. Gains confidence as children master vowels, eventually revealing her full magical singing voice.',
      teachingStyle: 'Gentle, patient, weaves sounds into visual patterns',
    },
    voiceLines: {
      greeting: [
        "*whispers* Welcome back, brave learner...",
        "The vowels have been waiting for you...",
        "*soft glow* I sense a word-weaver approaching!",
      ],
      correct: [
        "*hair glows brightly* Beautiful! You felt the sound!",
        "Yes! The vowels are singing for you!",
        "*whispers with wonder* You're becoming a true weaver...",
        "Even I couldn't have woven that better!",
      ],
      incorrect: [
        "*gentle whisper* Not quite... feel the sound in your heart...",
        "Close your eyes... can you hear the difference?",
        "The vowels are tricky friends. Let's try together...",
      ],
      encouragement: [
        "Every master weaver started with a single thread...",
        "*soft glow* Take your time... magic can't be rushed...",
        "I believe in you. The vowels believe in you.",
      ],
      levelComplete: [
        "*full radiant glow* You've woven something beautiful!",
        "The kingdom's voice grows stronger! *sings softly*",
        "Until next time, young weaver... *magical shimmer*",
      ],
    },
  },
  diesel: {
    id: 'diesel',
    name: 'Diesel the Digger',
    color: '#eab308',
    tailwindColor: 'diesel-yellow',
    voice: 'Zephyr',
    catchphrase: 'Dig deep, find treasures!',
    specialty: 'Blends & digraphs',
    visualQuirk: 'digging-animation',
    personality: {
      trait: 'Enthusiastic excavator of hidden sounds',
      fear: 'Missing a treasure buried right under his nose',
      dream: 'To uncover every sound-treasure in the kingdom',
      quirk: 'Gets covered in "word dust" when digging for sounds',
      backstory: 'An archaeologist who discovered that letters are ancient treasures. Digs up buried sounds and shows children how consonants combine into blends like precious gems.',
      teachingStyle: 'Adventurous, makes learning feel like treasure hunting',
    },
    voiceLines: {
      greeting: [
        "*dusts off helmet* Ready to dig for treasure?",
        "I've found some amazing sounds buried here!",
        "Grab your shovel - there's phonics gold below!",
      ],
      correct: [
        "TREASURE! You dug up the right sound!",
        "*celebration dance* That's pure phonics gold!",
        "You've got the eye of a true sound-archaeologist!",
        "Dig it! *happy excavator noises*",
      ],
      incorrect: [
        "Hmm, we're close to the treasure... try digging here...",
        "*brushes away dust* Not quite... but keep digging!",
        "Even I dig up rocks sometimes. What else is down there?",
      ],
      encouragement: [
        "Every treasure hunter starts with empty pockets!",
        "The best finds are just a little deeper...",
        "I can feel it - you're about to strike gold!",
      ],
      levelComplete: [
        "*shows off treasure* Look what we found together!",
        "Your treasure chest is overflowing! Amazing dig!",
        "Same time tomorrow? There's more to uncover!",
      ],
    },
  },
  zippy: {
    id: 'zippy',
    name: 'Zippy the Zoomer',
    color: '#ef4444',
    tailwindColor: 'zippy-red',
    voice: 'Puck',
    catchphrase: 'Zoom zoom! Knowledge at the speed of fun!',
    specialty: 'Sight words & quick recognition',
    visualQuirk: 'speed-lines',
    personality: {
      trait: 'Lightning-fast but learns to slow down for others',
      fear: 'Missing important details by going too fast',
      dream: 'To help children read as fast as they can imagine',
      quirk: 'Leaves colorful speed trails when excited',
      backstory: 'The fastest reader in the kingdom who learned that speed means nothing without understanding. Now teaches children to recognize words instantly while savoring each one.',
      teachingStyle: 'Energetic, competitive, makes speed fun and accurate',
    },
    voiceLines: {
      greeting: [
        "*zooooom* Ready to race? I promise to slow down!",
        "Speed-reader in training? Let's goooo!",
        "*skids to a stop* Perfect timing! Let's zoom!",
      ],
      correct: [
        "ZOOM ZOOM! Lightning fast AND correct!",
        "*speed celebration* You're faster than I expected!",
        "Pit crew celebrates! That was perfect!",
        "Finish line! *confetti trails*",
      ],
      incorrect: [
        "*gentle brake sounds* Pit stop! Let's check the map...",
        "Speed bump ahead... slow down and try again!",
        "Even racers make pit stops. Take your time!",
      ],
      encouragement: [
        "Even the fastest racers started in first gear!",
        "You're warming up - the fast laps are coming!",
        "I see potential for serious speed!",
      ],
      levelComplete: [
        "*victory lap* CHAMPION! You zoomed through!",
        "Trophy time! You earned every star!",
        "Race you back here tomorrow? *zooms off*",
      ],
    },
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
  // User profile
  playerName: string | null;
  hasCompletedOnboarding: boolean;
  hasCompletedAssessment: boolean;
  hasSeenWorldIntro: boolean;
  startingSkillLevel: SkillLevel | null;
  
  // User progress
  selectedCharacterId: string | null;
  currentIslandId: string | null;
  currentLevel: number;
  totalStars: number;
  shardsCollected: string[]; // Island IDs with mastery
  masteredGuardians: MasteredGuardian[];
  
  // Daily challenge
  lastDailyChallengeDate: string | null;
  dailyChallengeStreak: number;
  
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
  | 'landing'
  | 'onboarding'
  | 'placement-assessment'
  | 'world-intro'
  | 'character-select'
  | 'magic-map'
  | 'game'
  | 'parent-hub'
  | 'parent-lock'
  | 'settings'
  | 'sound-vault'
  | 'daily-challenge'
  | 'character-chat';

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
  | { type: 'REPLAY_LEVEL' }
  | { type: 'SET_PLAYER_NAME'; name: string }
  | { type: 'COMPLETE_ONBOARDING'; characterId: string }
  | { type: 'COMPLETE_ASSESSMENT'; skillLevel: SkillLevel }
  | { type: 'COMPLETE_WORLD_INTRO' }
  | { type: 'COMPLETE_DAILY_CHALLENGE'; stars: number }
  | { type: 'ADD_MASTERED_GUARDIAN'; guardian: MasteredGuardian };

// ============================================
// Island Types
// ============================================
export interface IslandLore {
  subtitle: string;
  secret: string;
  environmentalStory: string;
  magicMechanic: string;
}

export interface Island {
  id: string;
  name: string;
  magicalName: string;
  description: string;
  lore: IslandLore;
  category: PhonicsCategory;
  levels: number;
  unlockRequirement: number; // Star Fragments needed
  position: { x: number; y: number };
  color: string;
  gradient: string;
}

export const ISLANDS: Island[] = [
  {
    id: 'consonant-cove',
    name: 'Consonant Cove',
    magicalName: 'The Whispering Caves',
    description: 'Letters carved in crystal sing when touched',
    lore: {
      subtitle: 'Where Sounds Echo Forever',
      secret: 'Tap the C-crystal 3 times to reveal an ancient letter song',
      environmentalStory: 'Faded murals show the kingdom before the Great Silence. Each letter you master restores part of the cave\'s song.',
      magicMechanic: 'Crystals harmonize when you get 5 sounds correct in a row',
    },
    category: 'consonants',
    levels: 5,
    unlockRequirement: 0,
    position: { x: 20, y: 70 },
    color: '#3b82f6',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
  },
  {
    id: 'vowel-valley',
    name: 'Vowel Valley',
    magicalName: 'The Echoing Glade',
    description: 'Your voice creates colored mist that forms words',
    lore: {
      subtitle: 'Where Colors Speak',
      secret: 'Perfect accuracy makes rainbow mist and singing birds appear',
      environmentalStory: 'This glade was once gray and silent. As you master vowels, flowers bloom and birds return to sing.',
      magicMechanic: 'Each vowel you master adds a new color to the glade\'s rainbow',
    },
    category: 'short-vowels',
    levels: 5,
    unlockRequirement: 5,
    position: { x: 40, y: 50 },
    color: '#a855f7',
    gradient: 'from-purple-600 via-pink-500 to-rose-400',
  },
  {
    id: 'blend-beach',
    name: 'Blend Beach',
    magicalName: 'Tidepool Tempo',
    description: 'Ocean waves blend letters together as they crash',
    lore: {
      subtitle: 'Where Sounds Combine',
      secret: 'Watch the tide pools - they reveal blend patterns in their swirls',
      environmentalStory: 'The Scrambler broke apart the blending waves. Your learning helps the ocean remember how to mix sounds again.',
      magicMechanic: 'Waves get more colorful and musical as you master blends',
    },
    category: 'blends',
    levels: 5,
    unlockRequirement: 15,
    position: { x: 60, y: 65 },
    color: '#f59e0b',
    gradient: 'from-amber-500 via-orange-400 to-yellow-300',
  },
  {
    id: 'digraph-den',
    name: 'Digraph Den',
    magicalName: 'The Crystal Caverns',
    description: 'Two crystals that only glow when paired correctly',
    lore: {
      subtitle: 'Where Two Become One',
      secret: 'Find the matching crystal pairs hidden in the walls',
      environmentalStory: 'Deep in these caverns, letter pairs sleep in crystal cocoons. Only correct combinations awaken their magic.',
      magicMechanic: 'Crystal pairs light up the entire cavern when you master their sound',
    },
    category: 'digraphs',
    levels: 5,
    unlockRequirement: 25,
    position: { x: 75, y: 40 },
    color: '#10b981',
    gradient: 'from-emerald-600 via-green-500 to-lime-400',
  },
  {
    id: 'sight-word-summit',
    name: 'Sight Word Summit',
    magicalName: 'The Memory Spire',
    description: 'Ancient words carved in stone that glow when remembered',
    lore: {
      subtitle: 'Where Knowledge Shines',
      secret: 'At the peak, all the words you\'ve mastered form a constellation',
      environmentalStory: 'The highest point in the kingdom, where the king once kept his most treasured words. Your mastery rebuilds the light.',
      magicMechanic: 'Each sight word mastered adds a star to the night sky above the summit',
    },
    category: 'sight-words',
    levels: 5,
    unlockRequirement: 35,
    position: { x: 50, y: 25 },
    color: '#ef4444',
    gradient: 'from-red-600 via-rose-500 to-pink-400',
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

// ============================================
// Magical Rewards System
// ============================================
export const REWARD_NAMES = {
  // Renamed from generic "stars"
  starFragment: {
    singular: 'Star Fragment',
    plural: 'Star Fragments',
    emoji: '✨',
    description: 'A piece of the fallen Night Sky',
    lore: 'When the Scrambler attacked, the stars shattered. Each fragment you collect brings the night sky closer to restoration.',
  },
  
  // Renamed from generic "shards"  
  memoryCrystal: {
    singular: 'Memory Crystal',
    plural: 'Memory Crystals',
    emoji: '💎',
    description: 'A glowing crystal containing the King\'s voice',
    lore: 'These crystals hold memories of the kingdom before the Great Silence. Collect them to hear the King\'s stories.',
    requiredAccuracy: 85,
  },
  
  // New reward type
  echoStone: {
    singular: 'Echo Stone',
    plural: 'Echo Stones',
    emoji: '🔮',
    description: 'Replays any sound you\'ve mastered',
    lore: 'Found in the Whispering Caves, these stones remember every sound perfectly.',
  },
  
  // Streak reward
  heartbeat: {
    singular: 'Heartbeat',
    plural: 'Heartbeats',
    emoji: '💓',
    description: 'The rhythm of consistent practice',
    lore: 'The kingdom\'s heart beats stronger with each day you practice.',
  },
};

// Helper function to get reward display text
export const getRewardText = (
  type: 'starFragment' | 'memoryCrystal' | 'echoStone' | 'heartbeat',
  count: number
): string => {
  const reward = REWARD_NAMES[type];
  return `${count} ${count === 1 ? reward.singular : reward.plural}`;
};

// Kingdom story arc progress
export const KINGDOM_RESTORATION = {
  stage1: {
    minAccuracy: 0,
    maxAccuracy: 30,
    worldState: 'Gray and silent - NPCs mime without sound',
    music: 'Single lonely piano notes',
    description: 'The Great Silence still holds the kingdom',
  },
  stage2: {
    minAccuracy: 31,
    maxAccuracy: 60,
    worldState: 'Colors returning - whispers heard in mastered areas',
    music: 'Piano duets with soft flute',
    description: 'Hope stirs in the kingdom',
  },
  stage3: {
    minAccuracy: 61,
    maxAccuracy: 85,
    worldState: 'Restored areas fully colored - conversations return',
    music: 'Small ensemble playing',
    description: 'The kingdom remembers its voice',
  },
  stage4: {
    minAccuracy: 86,
    maxAccuracy: 100,
    worldState: 'Kingdom festival - fireworks and singing',
    music: 'Full orchestral celebration',
    description: 'The Scrambler\'s curse is broken!',
  },
};

// ============================================
// Extended Types for New App Architecture
// ============================================

export enum SkillLevel {
  PHONEMIC_AWARENESS = 'PHONEMIC_AWARENESS',
  LETTER_SOUNDS = 'LETTER_SOUNDS',
  DIGRAPHS_BLENDS = 'DIGRAPHS_BLENDS',
  BLENDING_CVC = 'BLENDING_CVC',
  SIGHT_WORDS = 'SIGHT_WORDS',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  accuracy: number;
  successivePasses: number;
  isMastered: boolean;
  isLocked: boolean;
  attempts: number;
  timeSpent: number;
  lastAttemptAt?: number;
}

export interface MasteredGuardian {
  sound: string;
  name: string;
  image: string;
  masteredAt: number;
  nodeId: string;
}

export interface UserSettings {
  speechRate: number;
  dyslexicFont: boolean;
  highContrast: boolean;
  difficulty: DifficultyLevel;
}

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
  notifications: string[];
  pairing: { isPaired: boolean; parentCode?: string };
  lastDailyChallenge?: number;
}

export interface GameSession {
  id: string;
  nodeId: string;
  startTime: number;
  endTime: number;
  accuracy: number;
  starsEarned: number;
  wordsAttempted: string[];
  wordsMastered: string[];
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

export type CharacterType = 'brio' | 'vowelia' | 'diesel' | 'zippy' | 'BRIO' | 'VOWELIA' | 'DIESEL' | 'ZIPPY';
