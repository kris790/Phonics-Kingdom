
import { UserSettings } from '../types';

/**
 * Adjusts settings dynamically based on the current error streak.
 * If a child misses multiple sounds, the "Static Scrambler" is winning,
 * so we slow down the game and simplify the interface to help them refocus.
 */
export const getAdaptiveSettings = (settings: UserSettings, errorStreak: number): UserSettings & { simplifiedUI: boolean } => {
  const isStruggling = errorStreak >= 3;
  
  return {
    ...settings,
    // Slow down speech significantly if struggling (0.6x), or slightly if 1-2 errors (0.8x)
    speechRate: isStruggling ? 0.6 : errorStreak >= 1 ? 0.8 : settings.speechRate,
    simplifiedUI: isStruggling
  };
};

/**
 * Wraps prompts in encouraging character dialogue based on the error state.
 */
export const getPromptScaffolding = (prompt: string, errorStreak: number): string => {
  if (errorStreak === 1) {
    return `Nice try! Let's listen again. ${prompt}`;
  }
  if (errorStreak === 2) {
    return `You're close, Sound Scout! Listen very closely, I'll say it slow. ${prompt}`;
  }
  if (errorStreak >= 3) {
    return `The Static Scrambler is tricky! Don't worry, I've cleared the fog to make it easier. Focus on this sound: ${prompt}`;
  }
  return prompt;
};
