// Native TTS Service - Fast text-to-speech with Capacitor plugin
// Provides 50-100ms latency vs 200-500ms Web Speech API

import { TextToSpeech, TTSOptions } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';

// Character voice configurations for native TTS
interface VoiceConfig {
  rate: number;      // Speed: 0.5 (slow) to 2.0 (fast)
  pitch: number;     // Pitch: 0.5 (low) to 2.0 (high)
  volume: number;    // Volume: 0.0 to 1.0
}

// Character-specific voice settings for expressive reading
const CHARACTER_VOICES: Record<string, VoiceConfig> = {
  brio: {
    rate: 1.1,      // Slightly upbeat, rhythmic
    pitch: 1.0,     // Natural pitch
    volume: 1.0,
  },
  vowelia: {
    rate: 0.85,     // Slower, more mystical
    pitch: 1.15,    // Slightly higher, ethereal
    volume: 0.95,
  },
  diesel: {
    rate: 0.95,     // Steady, grounded
    pitch: 0.85,    // Deeper voice
    volume: 1.0,
  },
  zippy: {
    rate: 1.3,      // Fast and energetic
    pitch: 1.2,     // Higher, excited
    volume: 1.0,
  },
};

// Default voice for phonics pronunciation (clear and educational)
const PHONICS_VOICE: VoiceConfig = {
  rate: 0.8,        // Slow for learning
  pitch: 1.0,       // Clear pitch
  volume: 1.0,
};

// State tracking
interface TTSState {
  isNative: boolean;
  isSpeaking: boolean;
  supportedLanguages: string[];
  preferredVoice: string | null;
}

const state: TTSState = {
  isNative: Capacitor.isNativePlatform(),
  isSpeaking: false,
  supportedLanguages: [],
  preferredVoice: null,
};

/**
 * Initialize native TTS - call once on app start
 */
export const initializeNativeTTS = async (): Promise<void> => {
  if (!state.isNative) {
    console.log('[NativeTTS] Running on web, using Web Speech API fallback');
    return;
  }

  try {
    // Get supported languages/voices
    const { languages } = await TextToSpeech.getSupportedLanguages();
    state.supportedLanguages = languages;
    
    // Prefer child-friendly English voice
    const englishVoices = languages.filter(l => l.startsWith('en'));
    state.preferredVoice = englishVoices.includes('en-US') ? 'en-US' : englishVoices[0] || 'en-US';
    
    console.log('[NativeTTS] Initialized with voice:', state.preferredVoice);
    console.log('[NativeTTS] Available languages:', languages.length);
  } catch (error) {
    console.error('[NativeTTS] Initialization failed:', error);
  }
};

/**
 * Speak text using native TTS (fast) or Web Speech (fallback)
 */
export const speak = async (
  text: string,
  options: {
    characterId?: string;    // Use character voice
    isPhonics?: boolean;     // Use phonics pronunciation settings
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onComplete?: () => void;
  } = {}
): Promise<void> => {
  // Check if audio is enabled (from saved state)
  const savedState = storageService.loadState();
  if (savedState && savedState.audioEnabled === false) {
    options.onComplete?.();
    return;
  }

  // Determine voice configuration
  let voiceConfig: VoiceConfig;
  if (options.isPhonics) {
    voiceConfig = PHONICS_VOICE;
  } else if (options.characterId && CHARACTER_VOICES[options.characterId]) {
    voiceConfig = CHARACTER_VOICES[options.characterId];
  } else {
    voiceConfig = { rate: 1.0, pitch: 1.0, volume: 1.0 };
  }

  // Apply overrides
  const finalRate = options.rate ?? voiceConfig.rate;
  const finalPitch = options.pitch ?? voiceConfig.pitch;
  const finalVolume = options.volume ?? voiceConfig.volume;

  if (state.isNative) {
    await speakNative(text, finalRate, finalPitch, finalVolume, options.onStart, options.onComplete);
  } else {
    await speakWeb(text, finalRate, finalPitch, finalVolume, options.onStart, options.onComplete);
  }
};

/**
 * Native TTS implementation (Capacitor plugin)
 */
const speakNative = async (
  text: string,
  rate: number,
  pitch: number,
  volume: number,
  onStart?: () => void,
  onComplete?: () => void
): Promise<void> => {
  try {
    state.isSpeaking = true;
    onStart?.();

    const ttsOptions: TTSOptions = {
      text,
      lang: state.preferredVoice || 'en-US',
      rate,
      pitch,
      volume,
      category: 'playback', // Important for audio mixing on iOS
    };

    await TextToSpeech.speak(ttsOptions);
    
    state.isSpeaking = false;
    onComplete?.();
  } catch (error) {
    console.error('[NativeTTS] Speak failed:', error);
    state.isSpeaking = false;
    
    // Fallback to web speech
    await speakWeb(text, rate, pitch, volume, onStart, onComplete);
  }
};

/**
 * Web Speech API fallback
 */
const speakWeb = async (
  text: string,
  rate: number,
  pitch: number,
  volume: number,
  onStart?: () => void,
  onComplete?: () => void
): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('[NativeTTS] Web Speech API not supported');
      onComplete?.();
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      state.isSpeaking = true;
      onStart?.();
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      onComplete?.();
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('[NativeTTS] Web Speech error:', event.error);
      state.isSpeaking = false;
      onComplete?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Speak a phonics sound with emphasis
 * Optimized for teaching letter sounds
 */
export const speakPhonics = async (
  sound: string,
  options: {
    repeat?: number;       // Number of times to repeat
    pauseBetween?: number; // Ms pause between repeats (native only)
    onComplete?: () => void;
  } = {}
): Promise<void> => {
  const repeat = options.repeat ?? 1;
  
  for (let i = 0; i < repeat; i++) {
    await speak(sound, { 
      isPhonics: true,
      onComplete: i === repeat - 1 ? options.onComplete : undefined,
    });
    
    // Pause between repeats (only if more repeats coming)
    if (i < repeat - 1 && options.pauseBetween) {
      await new Promise(resolve => setTimeout(resolve, options.pauseBetween));
    }
  }
};

/**
 * Speak a word with optional phoneme breakdown
 */
export const speakWord = async (
  word: string,
  options: {
    breakdown?: boolean;   // Speak each phoneme then full word
    characterId?: string;
    onComplete?: () => void;
  } = {}
): Promise<void> => {
  if (options.breakdown) {
    // First speak phonemes slowly
    const phonemes = word.split('');
    for (const phoneme of phonemes) {
      await speak(phoneme, { isPhonics: true });
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Then speak full word
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await speak(word, { 
    characterId: options.characterId,
    onComplete: options.onComplete,
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = async (): Promise<void> => {
  if (state.isNative) {
    try {
      await TextToSpeech.stop();
    } catch (error) {
      console.error('[NativeTTS] Stop failed:', error);
    }
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.isSpeaking = false;
};

/**
 * Check if currently speaking
 */
export const isSpeaking = (): boolean => state.isSpeaking;

/**
 * Check if using native TTS
 */
export const isNativeTTS = (): boolean => state.isNative;

/**
 * Get supported languages
 */
export const getSupportedLanguages = (): string[] => state.supportedLanguages;

// Export service object for convenience
export const nativeTTSService = {
  initialize: initializeNativeTTS,
  speak,
  speakPhonics,
  speakWord,
  stop: stopSpeaking,
  isSpeaking,
  isNative: isNativeTTS,
  getSupportedLanguages,
};

export default nativeTTSService;
