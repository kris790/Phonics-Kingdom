// Audio Service - Global audio management with circuit breaker
import { storageService } from './storageService';

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

// Common character phrases for caching
export const COMMON_PHRASES = {
  brio: {
    greeting: "Hi there, brave adventurer! Let's learn together!",
    correct: "Sparkling Success! You did it!",
    tryAgain: "Almost! Give it another try, you can do it!",
    levelComplete: "Amazing work! You're becoming a phonics champion!",
  },
  vowelia: {
    greeting: "Welcome, wise learner! Are you ready to explore?",
    correct: "Wonderful work! I knew you could do it!",
    tryAgain: "That's okay, let's try again together.",
    levelComplete: "You've done brilliantly! I'm so proud of you!",
  },
  diesel: {
    greeting: "Hey buddy! Ready to dig into some phonics?",
    correct: "Dig it! That was awesome!",
    tryAgain: "Oops! Let's dig deeper and try again!",
    levelComplete: "Woohoo! You really dug deep on that one!",
  },
  zippy: {
    greeting: "Zoom zoom! Let's race through some learning!",
    correct: "Zoom zoom! Lightning fast and correct!",
    tryAgain: "Quick pit stop! Let's try that again!",
    levelComplete: "Finish line! You zoomed through that level!",
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

  // Speak text using Web Speech API (fallback when TTS unavailable)
  speak: (text: string, options: { rate?: number; pitch?: number; onComplete?: () => void } = {}): void => {
    if (!serviceState.isEnabled) {
      options.onComplete?.();
      return;
    }

    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.onend = () => options.onComplete?.();
      utterance.onerror = () => options.onComplete?.();

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
      options.onComplete?.();
    }
  },

  // Cancel speech
  cancelSpeech: (): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};
