// Audio Engine Hook - Manages audio playback with adaptive speed
import { useCallback, useEffect, useRef, useState } from 'react';
import { audioService, COMMON_PHRASES } from '../services/audioService';
import { geminiService } from '../services/geminiService';

type InstructionSpeed = 'slow' | 'normal' | 'fast';

interface UseAudioEngineProps {
  characterId: string;
  speed?: InstructionSpeed;
  enabled?: boolean;
}

interface UseAudioEngineReturn {
  // Playback controls
  speak: (text: string) => Promise<void>;
  playPhrase: (phraseKey: keyof typeof COMMON_PHRASES.brio) => Promise<void>;
  stop: () => void;
  
  // State
  isSpeaking: boolean;
  isLoading: boolean;
  
  // Speed control
  setSpeed: (speed: InstructionSpeed) => void;
  currentSpeed: InstructionSpeed;
}

const SPEED_RATES: Record<InstructionSpeed, number> = {
  slow: 0.7,
  normal: 1.0,
  fast: 1.3,
};

export const useAudioEngine = ({
  characterId,
  speed = 'normal',
  enabled = true,
}: UseAudioEngineProps): UseAudioEngineReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<InstructionSpeed>(speed);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update audio service enabled state
  useEffect(() => {
    audioService.setEnabled(enabled);
  }, [enabled]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioService.stop();
      audioService.cancelSpeech();
    };
  }, []);

  // Speak text using TTS
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!enabled) return;

    // Cancel any ongoing speech
    audioService.stop();
    audioService.cancelSpeech();
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setIsSpeaking(true);

    try {
      // Try to get AI-generated TTS
      const audioData = await geminiService.generateTTS(text, characterId);

      if (audioData) {
        // Play AI-generated audio
        await audioService.play(audioData, {
          onComplete: () => setIsSpeaking(false),
        });
      } else {
        // Fallback to Web Speech API
        audioService.speak(text, {
          rate: SPEED_RATES[currentSpeed],
          onComplete: () => setIsSpeaking(false),
        });
      }
    } catch (error) {
      console.error('TTS failed:', error);
      // Fallback to Web Speech API
      audioService.speak(text, {
        rate: SPEED_RATES[currentSpeed],
        onComplete: () => setIsSpeaking(false),
      });
    } finally {
      setIsLoading(false);
    }
  }, [enabled, characterId, currentSpeed]);

  // Play a common phrase (cached)
  const playPhrase = useCallback(async (
    phraseKey: keyof typeof COMMON_PHRASES.brio
  ): Promise<void> => {
    if (!enabled) return;

    const phrases = COMMON_PHRASES[characterId as keyof typeof COMMON_PHRASES] || COMMON_PHRASES.brio;
    const phrase = phrases[phraseKey];

    if (!phrase) {
      console.warn(`Unknown phrase key: ${phraseKey}`);
      return;
    }

    setIsSpeaking(true);

    try {
      // Use cached TTS if available
      await audioService.playWithCache(
        `${characterId}-${phraseKey}`,
        async () => {
          const audio = await geminiService.generateTTS(phrase, characterId);
          return audio || '';
        },
        { onComplete: () => setIsSpeaking(false) }
      );
    } catch (error) {
      // Fallback to Web Speech
      audioService.speak(phrase, {
        rate: SPEED_RATES[currentSpeed],
        onComplete: () => setIsSpeaking(false),
      });
    }
  }, [enabled, characterId, currentSpeed]);

  // Stop all audio
  const stop = useCallback(() => {
    audioService.stop();
    audioService.cancelSpeech();
    abortControllerRef.current?.abort();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Set speed
  const setSpeed = useCallback((newSpeed: InstructionSpeed) => {
    setCurrentSpeed(newSpeed);
  }, []);

  return {
    speak,
    playPhrase,
    stop,
    isSpeaking,
    isLoading,
    setSpeed,
    currentSpeed,
  };
};
