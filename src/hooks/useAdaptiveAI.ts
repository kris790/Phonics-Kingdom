// Adaptive AI Hook - Adjusts difficulty and provides scaffolding
import { useCallback, useEffect, useRef, useState } from 'react';
import { TaskResult } from '../types';

interface AdaptiveState {
  // Performance tracking
  recentResults: boolean[]; // Last 10 results (true = correct)
  struggleCount: number;
  streakCount: number;
  
  // Adaptive settings
  recommendedSpeed: 'slow' | 'normal' | 'fast';
  shouldShowHints: boolean;
  shouldSimplifyPrompts: boolean;
  difficultyLevel: 1 | 2 | 3;
  
  // Engagement
  encouragementNeeded: boolean;
  celebrationNeeded: boolean;
}

interface UseAdaptiveAIReturn {
  // State
  adaptiveState: AdaptiveState;
  
  // Actions
  recordResult: (result: TaskResult) => void;
  resetTracking: () => void;
  
  // Recommendations
  getPerformanceLevel: () => 'struggling' | 'average' | 'excellent';
  shouldProvideHint: (attempts: number) => boolean;
  getEncouragement: () => string;
}

const INITIAL_STATE: AdaptiveState = {
  recentResults: [],
  struggleCount: 0,
  streakCount: 0,
  recommendedSpeed: 'normal',
  shouldShowHints: false,
  shouldSimplifyPrompts: false,
  difficultyLevel: 1,
  encouragementNeeded: false,
  celebrationNeeded: false,
};

const ENCOURAGEMENTS = {
  struggling: [
    "You're doing great! Learning takes practice.",
    "Keep trying! Every mistake helps you learn.",
    "I believe in you! Let's try again together.",
    "You're so brave for trying! That's what matters.",
    "Almost there! You're getting closer.",
  ],
  average: [
    "Nice work! Keep it up!",
    "You're making progress!",
    "Good thinking!",
    "Way to go!",
    "You're learning fast!",
  ],
  excellent: [
    "Wow! You're a superstar!",
    "Incredible! You're on fire!",
    "Amazing work! You're a natural!",
    "Brilliant! You make it look easy!",
    "Outstanding! Nothing can stop you!",
  ],
};

export const useAdaptiveAI = (): UseAdaptiveAIReturn => {
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(INITIAL_STATE);
  const lastResultTimeRef = useRef<Date | null>(null);

  // Calculate derived state when results change
  useEffect(() => {
    const { recentResults } = adaptiveState;
    
    if (recentResults.length < 3) return;

    const recentCorrect = recentResults.slice(-5).filter(Boolean).length;
    const recentTotal = Math.min(recentResults.length, 5);
    const recentAccuracy = recentCorrect / recentTotal;

    // Determine recommended speed
    let recommendedSpeed: 'slow' | 'normal' | 'fast' = 'normal';
    if (recentAccuracy < 0.5) {
      recommendedSpeed = 'slow';
    } else if (recentAccuracy > 0.8) {
      recommendedSpeed = 'fast';
    }

    // Determine if hints should be shown
    const shouldShowHints = recentAccuracy < 0.6;

    // Determine if prompts should be simplified
    const shouldSimplifyPrompts = recentAccuracy < 0.4;

    // Determine difficulty adjustment
    let difficultyLevel: 1 | 2 | 3 = adaptiveState.difficultyLevel;
    if (recentAccuracy < 0.5 && difficultyLevel > 1) {
      difficultyLevel = (difficultyLevel - 1) as 1 | 2 | 3;
    } else if (recentAccuracy > 0.85 && difficultyLevel < 3) {
      difficultyLevel = (difficultyLevel + 1) as 1 | 2 | 3;
    }

    setAdaptiveState(prev => ({
      ...prev,
      recommendedSpeed,
      shouldShowHints,
      shouldSimplifyPrompts,
      difficultyLevel,
    }));
  }, [adaptiveState.recentResults]);

  // Record a task result
  const recordResult = useCallback((result: TaskResult) => {
    const now = new Date();
    
    setAdaptiveState(prev => {
      const newResults = [...prev.recentResults, result.correct].slice(-10);
      
      // Calculate streaks
      let newStreak = result.correct ? prev.streakCount + 1 : 0;
      let newStruggle = !result.correct ? prev.struggleCount + 1 : 0;
      
      // Reset counters on change
      if (result.correct) newStruggle = 0;
      if (!result.correct) newStreak = 0;

      // Determine if celebration/encouragement needed
      const celebrationNeeded = newStreak === 3 || newStreak === 5 || newStreak === 10;
      const encouragementNeeded = newStruggle >= 2;

      return {
        ...prev,
        recentResults: newResults,
        streakCount: newStreak,
        struggleCount: newStruggle,
        celebrationNeeded,
        encouragementNeeded,
      };
    });

    lastResultTimeRef.current = now;
  }, []);

  // Reset tracking
  const resetTracking = useCallback(() => {
    setAdaptiveState(INITIAL_STATE);
    lastResultTimeRef.current = null;
  }, []);

  // Get overall performance level
  const getPerformanceLevel = useCallback((): 'struggling' | 'average' | 'excellent' => {
    const { recentResults } = adaptiveState;
    
    if (recentResults.length < 3) return 'average';
    
    const recentCorrect = recentResults.slice(-5).filter(Boolean).length;
    const accuracy = recentCorrect / Math.min(recentResults.length, 5);
    
    if (accuracy < 0.5) return 'struggling';
    if (accuracy >= 0.85) return 'excellent';
    return 'average';
  }, [adaptiveState.recentResults]);

  // Determine if hint should be provided
  const shouldProvideHint = useCallback((attempts: number): boolean => {
    if (adaptiveState.shouldShowHints && attempts >= 1) return true;
    if (attempts >= 2) return true;
    return false;
  }, [adaptiveState.shouldShowHints]);

  // Get contextual encouragement
  const getEncouragement = useCallback((): string => {
    const level = getPerformanceLevel();
    const phrases = ENCOURAGEMENTS[level];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, [getPerformanceLevel]);

  return {
    adaptiveState,
    recordResult,
    resetTracking,
    getPerformanceLevel,
    shouldProvideHint,
    getEncouragement,
  };
};
