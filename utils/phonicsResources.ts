
import { geminiService } from '../services/gemini';

/**
 * Normalizes a letter for phoneme lookups.
 */
export const getPhonemeSound = (letter: string): string => {
  return letter.toLowerCase().trim();
};

/**
 * Fetches an AI-generated visual for a specific word.
 * Automatically falls back to null if offline or if the generation fails.
 */
export const getWordImage = async (word: string): Promise<string | null> => {
  // Check online status immediately to avoid unnecessary API timeouts
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  try {
    // We add specific descriptors to ensure the AI generates high-quality,
    // educational assets with minimal background noise.
    const prompt = `A clear, friendly, storybook illustration of a ${word}. High contrast, white background, no text.`;
    return await geminiService.generateVisualForTask(prompt);
  } catch (e) {
    console.warn(`Failed to generate visual for: ${word}. Falling back to text-only mode.`, e);
    return null;
  }
};
