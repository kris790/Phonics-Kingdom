// Recommendation Service - "Areas for Play" engine
// Analyzes mastery data and suggests which islands/activities to focus on

import { GameState, ISLANDS, Island, SessionSummary, IslandProgress } from '../types';
import { storageService } from './storageService';
import { telemetryService } from './telemetryService';

// ============================================
// Types
// ============================================
export interface Recommendation {
  id: string;
  type: 'struggling' | 'ready-to-advance' | 'needs-review' | 'maintain-streak' | 'new-area';
  priority: 'high' | 'medium' | 'low';
  islandId: string;
  island: Island;
  title: string;
  description: string;
  emoji: string;
  reason: string;
  actionText: string;
}

export interface RecommendationAnalysis {
  recommendations: Recommendation[];
  topPick: Recommendation | null;
  summary: {
    areasStruggling: number;
    areasReadyToAdvance: number;
    areasMastered: number;
    overallHealth: 'excellent' | 'good' | 'needs-attention' | 'struggling';
  };
}

interface IslandPerformance {
  islandId: string;
  island: Island;
  recentSessions: SessionSummary[];
  avgAccuracy: number;
  attemptCount: number;
  errorStreak: number;
  daysSinceLastPlay: number;
  progress: IslandProgress | null;
  isUnlocked: boolean;
  isMastered: boolean;
  masteryProgress: number; // 0-3
}

// ============================================
// Constants
// ============================================
const MASTERY_THRESHOLD = 85; // 85% accuracy for mastery
const STRUGGLING_THRESHOLD = 60; // Below 60% = struggling
const REVIEW_DAYS = 7; // Suggest review after 7 days inactive
const MIN_SESSIONS_FOR_ANALYSIS = 2; // Need at least 2 sessions to analyze

// ============================================
// Core Analysis Functions
// ============================================
function analyzeIslandPerformance(
  island: Island,
  sessions: SessionSummary[],
  state: GameState | null
): IslandPerformance {
  const islandSessions = sessions.filter(s => s.islandId === island.id);
  const recentSessions = islandSessions.slice(-10); // Last 10 sessions
  
  // Calculate average accuracy from recent sessions
  const avgAccuracy = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
    : 0;
  
  // Count consecutive low-accuracy sessions (error streak)
  let errorStreak = 0;
  for (let i = recentSessions.length - 1; i >= 0; i--) {
    if (recentSessions[i].accuracy < STRUGGLING_THRESHOLD) {
      errorStreak++;
    } else {
      break;
    }
  }
  
  // Calculate days since last play
  const lastSession = recentSessions[recentSessions.length - 1];
  const daysSinceLastPlay = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  
  // Get progress from state
  const progress = state?.islandProgress?.[island.id] || null;
  const totalStars = state?.totalStars || 0;
  const isUnlocked = totalStars >= island.unlockRequirement;
  const isMastered = progress?.hasShard || false;
  const masteryProgress = progress?.masteryDays?.length || 0;
  
  return {
    islandId: island.id,
    island,
    recentSessions,
    avgAccuracy: Math.round(avgAccuracy),
    attemptCount: islandSessions.length,
    errorStreak,
    daysSinceLastPlay,
    progress,
    isUnlocked,
    isMastered,
    masteryProgress,
  };
}

function generateRecommendation(perf: IslandPerformance): Recommendation | null {
  const { island, avgAccuracy, attemptCount, errorStreak, daysSinceLastPlay, isUnlocked, isMastered, masteryProgress } = perf;
  
  // Skip locked islands
  if (!isUnlocked) return null;
  
  // Priority 1: Struggling areas (error streak or consistently low accuracy)
  if (errorStreak >= 2 || (attemptCount >= MIN_SESSIONS_FOR_ANALYSIS && avgAccuracy < STRUGGLING_THRESHOLD)) {
    return {
      id: `struggling-${island.id}`,
      type: 'struggling',
      priority: 'high',
      islandId: island.id,
      island,
      title: `Extra Practice Needed`,
      description: `${island.name} needs more attention`,
      emoji: '🎯',
      reason: errorStreak >= 2
        ? `${errorStreak} sessions in a row below 60% accuracy`
        : `Average accuracy is ${avgAccuracy}%`,
      actionText: 'Practice Now',
    };
  }
  
  // Priority 2: Ready to advance (high accuracy, not yet mastered)
  if (!isMastered && avgAccuracy >= MASTERY_THRESHOLD && attemptCount >= MIN_SESSIONS_FOR_ANALYSIS) {
    const daysNeeded = 3 - masteryProgress;
    return {
      id: `advance-${island.id}`,
      type: 'ready-to-advance',
      priority: 'medium',
      islandId: island.id,
      island,
      title: `Almost Mastered!`,
      description: `${island.name} is ${masteryProgress}/3 to King Shard`,
      emoji: '👑',
      reason: `Excellent ${avgAccuracy}% average accuracy! Play ${daysNeeded} more day${daysNeeded > 1 ? 's' : ''} to earn the King Shard.`,
      actionText: 'Keep Going',
    };
  }
  
  // Priority 3: Needs review (mastered but not played recently)
  if (isMastered && daysSinceLastPlay >= REVIEW_DAYS) {
    return {
      id: `review-${island.id}`,
      type: 'needs-review',
      priority: 'low',
      islandId: island.id,
      island,
      title: `Time for Review`,
      description: `Revisit ${island.name}`,
      emoji: '🔄',
      reason: `It's been ${daysSinceLastPlay} days since you played here. A quick review keeps skills fresh!`,
      actionText: 'Quick Review',
    };
  }
  
  // Priority 4: Not mastered, needs more sessions (moderate accuracy)
  if (!isMastered && attemptCount >= MIN_SESSIONS_FOR_ANALYSIS && avgAccuracy >= STRUGGLING_THRESHOLD && avgAccuracy < MASTERY_THRESHOLD) {
    return {
      id: `improve-${island.id}`,
      type: 'ready-to-advance',
      priority: 'medium',
      islandId: island.id,
      island,
      title: `Keep Building`,
      description: `${island.name} is improving`,
      emoji: '📈',
      reason: `At ${avgAccuracy}% accuracy - aim for 85% to start earning your King Shard!`,
      actionText: 'Practice More',
    };
  }
  
  // Priority 5: New area to explore
  if (attemptCount < MIN_SESSIONS_FOR_ANALYSIS) {
    return {
      id: `new-${island.id}`,
      type: 'new-area',
      priority: 'low',
      islandId: island.id,
      island,
      title: `New Adventure`,
      description: `Explore ${island.name}`,
      emoji: '🗺️',
      reason: attemptCount === 0
        ? 'You haven\'t visited this island yet!'
        : 'Keep exploring to unlock more activities!',
      actionText: 'Explore',
    };
  }
  
  return null;
}

function calculateOverallHealth(performances: IslandPerformance[]): 'excellent' | 'good' | 'needs-attention' | 'struggling' {
  const unlocked = performances.filter(p => p.isUnlocked);
  if (unlocked.length === 0) return 'good';
  
  const struggling = unlocked.filter(p => p.avgAccuracy > 0 && p.avgAccuracy < STRUGGLING_THRESHOLD);
  const mastered = unlocked.filter(p => p.isMastered);
  
  const strugglingRatio = struggling.length / unlocked.length;
  const masteredRatio = mastered.length / unlocked.length;
  
  if (strugglingRatio >= 0.5) return 'struggling';
  if (strugglingRatio > 0) return 'needs-attention';
  if (masteredRatio >= 0.5) return 'excellent';
  return 'good';
}

// ============================================
// Main Export
// ============================================
export const recommendationService = {
  /**
   * Generate personalized recommendations based on learning progress
   */
  getRecommendations: (): RecommendationAnalysis => {
    const sessions = storageService.getSessionHistory();
    const state = storageService.loadState() as GameState | null;
    
    // Analyze each island
    const performances = ISLANDS.map(island => 
      analyzeIslandPerformance(island, sessions, state)
    );
    
    // Generate recommendations for each island
    const allRecommendations: Recommendation[] = [];
    
    for (const perf of performances) {
      const rec = generateRecommendation(perf);
      if (rec) {
        allRecommendations.push(rec);
      }
    }
    
    // Sort by priority and type
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const typeOrder = { struggling: 0, 'ready-to-advance': 1, 'needs-review': 2, 'maintain-streak': 3, 'new-area': 4 };
    
    allRecommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    // Calculate summary stats
    const areasStruggling = performances.filter(p => 
      p.isUnlocked && p.avgAccuracy > 0 && p.avgAccuracy < STRUGGLING_THRESHOLD
    ).length;
    
    const areasReadyToAdvance = performances.filter(p =>
      p.isUnlocked && !p.isMastered && p.avgAccuracy >= MASTERY_THRESHOLD
    ).length;
    
    const areasMastered = performances.filter(p => p.isMastered).length;
    
    return {
      recommendations: allRecommendations.slice(0, 5), // Top 5 recommendations
      topPick: allRecommendations[0] || null,
      summary: {
        areasStruggling,
        areasReadyToAdvance,
        areasMastered,
        overallHealth: calculateOverallHealth(performances),
      },
    };
  },

  /**
   * Get a focused recommendation for the Magic Map
   * Returns the single most important action
   */
  getQuickSuggestion: (): Recommendation | null => {
    const { topPick } = recommendationService.getRecommendations();
    return topPick;
  },

  /**
   * Get learning story text for Parent Hub
   * AI-style narrative summary of progress
   */
  getLearningStory: (): string => {
    const { summary, recommendations } = recommendationService.getRecommendations();
    const streak = telemetryService.calculateStreak();
    const analytics = storageService.getAnalytics();
    
    const parts: string[] = [];
    
    // Opening based on overall health
    switch (summary.overallHealth) {
      case 'excellent':
        parts.push('🌟 Amazing progress! Your child is doing exceptionally well.');
        break;
      case 'good':
        parts.push('📚 Great learning journey so far! Progress is on track.');
        break;
      case 'needs-attention':
        parts.push('💪 Some areas could use extra practice, but that\'s part of learning!');
        break;
      case 'struggling':
        parts.push('🤗 Extra support might help in a few areas. Short, focused sessions work best.');
        break;
    }
    
    // Streak mention
    if (streak >= 3) {
      parts.push(`🔥 ${streak}-day streak! Consistency is building strong foundations.`);
    }
    
    // Mastery celebration
    if (summary.areasMastered > 0) {
      parts.push(`👑 ${summary.areasMastered} King Shard${summary.areasMastered > 1 ? 's' : ''} earned through mastery!`);
    }
    
    // Top recommendation
    if (recommendations.length > 0) {
      const top = recommendations[0];
      parts.push(`\n📍 Next focus: ${top.island.name} - ${top.reason}`);
    }
    
    // Encouragement
    if (analytics.totalSessions >= 10) {
      parts.push('\n✨ Keep up the wonderful work! Every session builds reading confidence.');
    } else if (analytics.totalSessions >= 5) {
      parts.push('\n✨ Building momentum! Regular practice makes all the difference.');
    } else {
      parts.push('\n✨ Great start! The more you play, the more skills grow.');
    }
    
    return parts.join(' ');
  },

  /**
   * Get character-specific encouragement based on current performance
   */
  getCharacterEncouragement: (characterId: string): string => {
    const { summary } = recommendationService.getRecommendations();
    
    const encouragements = {
      brio: {
        excellent: "Sparkling success! You're a phonics superstar! ⭐",
        good: "You're doing great, brave reader! Keep exploring!",
        'needs-attention': "Every brave reader faces challenges. Let's conquer them together!",
        struggling: "I believe in you! Small steps lead to big adventures!",
      },
      vowelia: {
        excellent: "Wonderful work, wise one! Your vowels are singing! 🎵",
        good: "You're learning beautifully. Every sound matters!",
        'needs-attention': "Patience is wisdom. Let's practice together gently.",
        struggling: "Every great reader started with practice. You're doing amazing!",
      },
      diesel: {
        excellent: "Dig it! You've uncovered treasure after treasure! 💎",
        good: "Great digging! More treasures await!",
        'needs-attention': "Sometimes we hit tough rock, but we keep digging!",
        struggling: "The best treasures are buried deep. Keep digging!",
      },
      zippy: {
        excellent: "Zoom zoom! You're the fastest learner in Soundia! 🏎️",
        good: "Speed AND accuracy! That's how champions race!",
        'needs-attention': "Even racers take pit stops to get faster!",
        struggling: "Slow and steady wins the race... then we zoom!",
      },
    };
    
    const charEncouragements = encouragements[characterId as keyof typeof encouragements] || encouragements.brio;
    return charEncouragements[summary.overallHealth];
  },
};

export default recommendationService;
