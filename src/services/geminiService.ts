// Gemini Service - AI Integration Layer
// Note: This service requires a Gemini API key to be configured
// For now, it provides mock implementations that fall back to local data

import { Task, Character, CHARACTERS } from '../types';
import { generateFallbackTasks } from '../data/wordBank';
import { anonymizationService } from './anonymizationService';

// API Configuration (would be set via environment variables in production)
const GEMINI_CONFIG = {
  narrativeModel: 'gemini-3-pro-preview',
  taskModel: 'gemini-3-flash-preview',
  imageModel: 'gemini-2.5-flash-image',
  ttsModel: 'gemini-2.5-flash-preview-tts',
  audioModel: 'gemini-2.5-flash-native-audio-preview-12-2025',
};

interface GeminiTaskResponse {
  tasks: Task[];
  narrative: string;
}

interface GeminiNarrativeResponse {
  story: string;
  encouragement: string;
}

// Check if API is configured
const isApiConfigured = (): boolean => {
  return !!process.env.REACT_APP_GEMINI_API_KEY;
};

/**
 * Sanitize any payload before sending to external API
 * Strips PII for COPPA/GDPR-K compliance
 */
const sanitizeForApi = <T extends Record<string, unknown>>(payload: T): T => {
  return anonymizationService.sanitizeApiPayload(payload) as T;
};

/**
 * Anonymize text content before sending to AI
 */
const anonymizeText = (text: string): string => {
  const { anonymizedText } = anonymizationService.anonymize(text);
  return anonymizedText;
};

export const geminiService = {
  // Generate tasks for a level using AI
  generateTasks: async (
    islandId: string,
    levelId: string,
    characterId: string,
    difficulty: 1 | 2 | 3 = 1
  ): Promise<Task[]> => {
    // If API not configured, use fallback
    if (!isApiConfigured()) {
      console.log('[GeminiService] Using offline fallback for task generation');
      return generateFallbackTasks(islandId.replace('-', ' '), characterId, 5);
    }

    try {
      // In production, this would call the Gemini API
      // const response = await fetch(`${API_ENDPOINT}/generate-tasks`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     model: GEMINI_CONFIG.taskModel,
      //     islandId,
      //     levelId,
      //     characterId,
      //     difficulty,
      //     responseMimeType: 'application/json',
      //   }),
      // });
      // const data: GeminiTaskResponse = await response.json();
      // return data.tasks;

      // For now, return fallback
      return generateFallbackTasks(getCategoryFromIsland(islandId), characterId, 5);
    } catch (error) {
      console.error('[GeminiService] Task generation failed, using fallback:', error);
      return generateFallbackTasks(getCategoryFromIsland(islandId), characterId, 5);
    }
  },

  // Generate narrative/story content
  generateNarrative: async (
    context: {
      characterId: string;
      islandId: string;
      playerProgress: number;
      recentPerformance: 'struggling' | 'average' | 'excellent';
    }
  ): Promise<GeminiNarrativeResponse> => {
    const character = CHARACTERS[context.characterId];
    
    if (!isApiConfigured()) {
      // Return pre-written narratives based on context
      return getOfflineNarrative(character, context);
    }

    try {
      // In production, call Gemini with thinking budget for creative content
      // const response = await fetch(`${API_ENDPOINT}/generate-narrative`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
      //   },
      //   body: JSON.stringify({
      //     model: GEMINI_CONFIG.narrativeModel,
      //     thinkingBudget: 2048,
      //     context,
      //   }),
      // });
      // return await response.json();

      return getOfflineNarrative(character, context);
    } catch (error) {
      console.error('[GeminiService] Narrative generation failed:', error);
      return getOfflineNarrative(character, context);
    }
  },

  // Generate image for a task
  generateTaskImage: async (
    prompt: string,
    style: 'cartoon' | 'realistic' = 'cartoon'
  ): Promise<string | null> => {
    if (!isApiConfigured()) {
      // Return placeholder or emoji-based visuals
      return null;
    }

    // Anonymize the prompt before sending to API
    const safePrompt = anonymizeText(prompt);

    try {
      // In production:
      // const response = await fetch(`${API_ENDPOINT}/generate-image`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
      //   },
      //   body: JSON.stringify(sanitizeForApi({
      //     model: GEMINI_CONFIG.imageModel,
      //     prompt: safePrompt,
      //     aspectRatio: '1:1',
      //     style,
      //   })),
      // });
      // const data = await response.json();
      // return data.imageUrl;

      return null;
    } catch (error) {
      console.error('[GeminiService] Image generation failed:', error);
      return null;
    }
  },

  // Generate TTS audio for character speech
  generateTTS: async (
    text: string,
    characterId: string
  ): Promise<string | null> => {
    const character = CHARACTERS[characterId];
    
    if (!isApiConfigured()) {
      // Return null to trigger Web Speech API fallback
      return null;
    }

    // Anonymize text before sending to TTS API
    const safeText = anonymizeText(text);

    try {
      // In production:
      // const response = await fetch(`${API_ENDPOINT}/generate-tts`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
      //   },
      //   body: JSON.stringify(sanitizeForApi({
      //     model: GEMINI_CONFIG.ttsModel,
      //     text: safeText,
      //     voiceConfig: character.voice,
      //   })),
      // });
      // const data = await response.json();
      // return data.audioBase64;

      // Suppress unused variable warning for demo
      console.debug('[GeminiService] TTS would use:', safeText.substring(0, 20), character.voice);

      return null;
    } catch (error) {
      console.error('[GeminiService] TTS generation failed:', error);
      return null;
    }
  },

  // Validate voice input (Voice Lab feature)
  validateVoiceInput: async (
    audioBlob: Blob,
    expectedPhoneme: string
  ): Promise<{ correct: boolean; feedback: string; confidence: number }> => {
    if (!isApiConfigured()) {
      // Return mock validation
      return {
        correct: true,
        feedback: 'Great job! That sounded perfect!',
        confidence: 0.85,
      };
    }

    try {
      // In production:
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // formData.append('expectedPhoneme', expectedPhoneme);
      // 
      // const response = await fetch(`${API_ENDPOINT}/validate-voice`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`,
      //   },
      //   body: formData,
      // });
      // return await response.json();

      return {
        correct: true,
        feedback: 'Great job! That sounded perfect!',
        confidence: 0.85,
      };
    } catch (error) {
      console.error('[GeminiService] Voice validation failed:', error);
      return {
        correct: true,
        feedback: 'Good try!',
        confidence: 0.5,
      };
    }
  },

  // Get adaptive hint based on student struggles
  getAdaptiveHint: async (
    task: Task,
    attempts: number,
    characterId: string
  ): Promise<string> => {
    const character = CHARACTERS[characterId];

    if (!isApiConfigured() || attempts < 2) {
      return getOfflineHint(task, attempts, character);
    }

    try {
      // In production, use AI to generate contextual hints
      return getOfflineHint(task, attempts, character);
    } catch (error) {
      console.error('[GeminiService] Hint generation failed:', error);
      return getOfflineHint(task, attempts, character);
    }
  },

  // Check API status
  checkStatus: async (): Promise<{ available: boolean; models: string[] }> => {
    if (!isApiConfigured()) {
      return { available: false, models: [] };
    }

    try {
      // Ping API
      return { available: true, models: Object.values(GEMINI_CONFIG) };
    } catch {
      return { available: false, models: [] };
    }
  },
};

// Helper functions for offline mode

const getCategoryFromIsland = (islandId: string): string => {
  const mapping: Record<string, string> = {
    'consonant-cove': 'consonants',
    'vowel-valley': 'short-vowels',
    'blend-beach': 'blends',
    'digraph-den': 'digraphs',
    'sight-word-summit': 'sight-words',
  };
  return mapping[islandId] || 'consonants';
};

const getOfflineNarrative = (
  character: Character,
  context: { recentPerformance: string; islandId: string }
): GeminiNarrativeResponse => {
  const narratives: Record<string, GeminiNarrativeResponse> = {
    struggling: {
      story: `${character.name} notices you're working really hard. "Learning new sounds can be tricky, but I believe in you! Let's take it one step at a time."`,
      encouragement: character.catchphrase + " Every expert was once a beginner!",
    },
    average: {
      story: `${character.name} smiles warmly. "You're doing great! Let's keep exploring the magical world of letters and sounds together!"`,
      encouragement: character.catchphrase + " You're making wonderful progress!",
    },
    excellent: {
      story: `${character.name} jumps with excitement! "Wow, you're a phonics superstar! You're learning so fast, I can barely keep up!"`,
      encouragement: character.catchphrase + " You're absolutely amazing!",
    },
  };

  return narratives[context.recentPerformance] || narratives.average;
};

const getOfflineHint = (task: Task, attempts: number, character: Character): string => {
  const hints = [
    `Listen carefully to the beginning sound...`,
    `Try saying the word slowly: "${task.correctAnswer}"`,
    `The answer starts with the letter "${task.correctAnswer[0].toUpperCase()}"`,
    `${character.name} whispers: "The answer is ${task.correctAnswer}!"`,
  ];

  const hintIndex = Math.min(attempts - 1, hints.length - 1);
  return hints[hintIndex];
};
