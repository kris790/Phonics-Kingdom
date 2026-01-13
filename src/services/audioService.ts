// Audio Service - Global audio management with circuit breaker
import { storageService } from './storageService';
import { CHARACTERS } from '../types';
import { speak as nativeSpeak, speakPhonics, speakWord, stopSpeaking, isNativeTTS } from './nativeTTSService';

type AudioState = 'idle' | 'playing' | 'paused';

interface AudioServiceState {
  currentAudio: HTMLAudioElement | null;
  state: AudioState;
  queue: Array<{ src: string; onComplete?: () => void }>;
  isEnabled: boolean;
}

const serviceState: AudioServiceState = {
  currentAudio: null,
  state: 'idle',
  queue: [],
  isEnabled: true,
};

// Get random voice line for character
const getRandomLine = (lines: string[]): string => {
  return lines[Math.floor(Math.random() * lines.length)];
};

// Map external types to COMMON_PHRASES keys
type CommonPhraseKey = 'greeting' | 'correct' | 'tryAgain' | 'levelComplete';
const mapToCommonPhraseKey = (
  type: 'greeting' | 'correct' | 'incorrect' | 'encouragement' | 'levelComplete'
): CommonPhraseKey => {
  if (type === 'incorrect' || type === 'encouragement') return 'tryAgain';
  return type;
};

// Get character phrase based on type
export const getCharacterPhrase = (
  characterId: string,
  type: 'greeting' | 'correct' | 'incorrect' | 'encouragement' | 'levelComplete'
): string => {
  const character = CHARACTERS[characterId];
  const fallbackKey = mapToCommonPhraseKey(type);
  
  if (!character) return COMMON_PHRASES.brio[fallbackKey];
  
  const lines = character.voiceLines[type];
  return lines ? getRandomLine(lines) : COMMON_PHRASES.brio[fallbackKey];
};

// Common character phrases for caching (fallback)
export const COMMON_PHRASES = {
  brio: {
    greeting: "*tsk-ka-tsk* You're back! Let's bounce!",
    correct: "*tsk-ka-tsk* YES! That rhythm's in your bones now!",
    tryAgain: "Almost... listen to the space between the sounds...",
    levelComplete: "*full beatbox celebration* You ROCKED that level!",
  },
  vowelia: {
    greeting: "*whispers* Welcome back, brave learner...",
    correct: "*hair glows brightly* Beautiful! You felt the sound!",
    tryAgain: "*gentle whisper* Not quite... feel the sound in your heart...",
    levelComplete: "*full radiant glow* You've woven something beautiful!",
  },
  diesel: {
    greeting: "*dusts off helmet* Ready to dig for treasure?",
    correct: "TREASURE! You dug up the right sound!",
    tryAgain: "Hmm, we're close to the treasure... try digging here...",
    levelComplete: "*shows off treasure* Look what we found together!",
  },
  zippy: {
    greeting: "*zooooom* Ready to race? I promise to slow down!",
    correct: "ZOOM ZOOM! Lightning fast AND correct!",
    tryAgain: "*gentle brake sounds* Pit stop! Let's check the map...",
    levelComplete: "*victory lap* CHAMPION! You zoomed through!",
  },
};

export const audioService = {
  // Enable/disable audio globally
  setEnabled: (enabled: boolean): void => {
    serviceState.isEnabled = enabled;
    if (!enabled) {
      audioService.stop();
    }
  },

  isEnabled: (): boolean => serviceState.isEnabled,

  // Play audio from URL or base64
  play: async (
    src: string,
    options: { onComplete?: () => void; volume?: number } = {}
  ): Promise<void> => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    // Stop any current audio
    audioService.stop();

    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(src);
        audio.volume = options.volume ?? 1.0;
        
        serviceState.currentAudio = audio;
        serviceState.state = 'playing';

        audio.onended = () => {
          serviceState.state = 'idle';
          serviceState.currentAudio = null;
          options.onComplete?.();
          resolve();
        };

        audio.onerror = (error) => {
          serviceState.state = 'idle';
          serviceState.currentAudio = null;
          console.error('Audio playback error:', error);
          options.onComplete?.();
          reject(error);
        };

        audio.play().catch((error) => {
          serviceState.state = 'idle';
          serviceState.currentAudio = null;
          console.error('Audio play failed:', error);
          options.onComplete?.();
          reject(error);
        });
      } catch (error) {
        console.error('Audio creation failed:', error);
        options.onComplete?.();
        reject(error);
      }
    });
  },

  // Play with caching for TTS
  playWithCache: async (
    phrase: string,
    audioGenerator: () => Promise<string>,
    options: { onComplete?: () => void } = {}
  ): Promise<void> => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    // Check cache first
    let audioData = storageService.getCachedTTS(phrase);
    
    if (!audioData) {
      try {
        audioData = await audioGenerator();
        storageService.cacheTTS(phrase, audioData);
      } catch (error) {
        console.error('TTS generation failed:', error);
        options.onComplete?.();
        return;
      }
    }

    return audioService.play(audioData, options);
  },

  // Queue audio for sequential playback
  queue: (src: string, onComplete?: () => void): void => {
    serviceState.queue.push({ src, onComplete });
    
    if (serviceState.state === 'idle') {
      audioService.processQueue();
    }
  },

  // Process queued audio
  processQueue: async (): Promise<void> => {
    if (serviceState.queue.length === 0) {
      return;
    }

    const next = serviceState.queue.shift();
    if (next) {
      await audioService.play(next.src, { onComplete: next.onComplete });
      audioService.processQueue();
    }
  },

  // Pause current audio
  pause: (): void => {
    if (serviceState.currentAudio && serviceState.state === 'playing') {
      serviceState.currentAudio.pause();
      serviceState.state = 'paused';
    }
  },

  // Resume paused audio
  resume: (): void => {
    if (serviceState.currentAudio && serviceState.state === 'paused') {
      serviceState.currentAudio.play();
      serviceState.state = 'playing';
    }
  },

  // Stop all audio - Circuit Breaker
  stop: (): void => {
    if (serviceState.currentAudio) {
      serviceState.currentAudio.pause();
      serviceState.currentAudio.currentTime = 0;
      serviceState.currentAudio = null;
    }
    serviceState.state = 'idle';
    serviceState.queue = [];
  },

  // Get current state
  getState: (): AudioState => serviceState.state,

  // Play a simple beep/notification sound
  playNotification: (type: 'success' | 'error' | 'click'): void => {
    if (!serviceState.isEnabled) return;

    // Use Web Audio API for simple sounds
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
          break;
      }
    } catch (error) {
      console.error('Notification sound failed:', error);
    }
  },

  // Speak text using Native TTS (preferred) or Web Speech API (fallback)
  speak: (text: string, options: { rate?: number; pitch?: number; characterId?: string; onComplete?: () => void } = {}): void => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    // Use native TTS service (handles fallback automatically)
    nativeSpeak(text, {
      rate: options.rate,
      pitch: options.pitch,
      characterId: options.characterId,
      onComplete: options.onComplete,
    }).catch(error => {
      console.error('TTS failed:', error);
      options.onComplete?.();
    });
  },

  // Speak phonics sound with native TTS optimization
  speakPhonics: (sound: string, options: { repeat?: number; onComplete?: () => void } = {}): void => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    speakPhonics(sound, {
      repeat: options.repeat,
      pauseBetween: 400,
      onComplete: options.onComplete,
    }).catch(error => {
      console.error('Phonics TTS failed:', error);
      options.onComplete?.();
    });
  },

  // Speak word with optional breakdown
  speakWord: (word: string, options: { breakdown?: boolean; characterId?: string; onComplete?: () => void } = {}): void => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    speakWord(word, {
      breakdown: options.breakdown,
      characterId: options.characterId,
      onComplete: options.onComplete,
    }).catch(error => {
      console.error('Word TTS failed:', error);
      options.onComplete?.();
    });
  },

  // Cancel speech
  cancelSpeech: (): void => {
    stopSpeaking();
  },

  // Check if using native TTS
  isNativeTTS: (): boolean => isNativeTTS(),
};
