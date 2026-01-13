
import { useCallback } from 'react';
import { CharacterType, UserSettings } from '../../../types';
import { audioService } from '../../../services/audioService';

const FEEDBACK_PHRASES = {
  excited: ['Awesome!', 'You got it!', '6 7', 'Perfect!', 'Legendary!'],
  encouraging: ['Almost there!', 'Try again, Sound Scout!', 'Listen closely once more...', 'You can do it!'],
  normal: []
};

export const useAudioEngine = (characterType: CharacterType, settings: UserSettings) => {
  const speak = useCallback(async (text: string, emotion: 'normal' | 'excited' | 'encouraging' = 'normal') => {
    // 1. Prefix with randomized character feedback
    const phrases = FEEDBACK_PHRASES[emotion];
    const prefix = phrases.length > 0 ? phrases[Math.floor(Math.random() * phrases.length)] + " " : "";
    const fullText = `${prefix}${text}`;

    // 2. Calculate adjusted rate based on character and settings
    const baseMultiplier = characterType === 'ZIPPY' ? 1.25 : 1.0;
    const rate = settings.speechRate * baseMultiplier;

    // 3. Delegate to unified service
    await audioService.speak(fullText, characterType, rate);
    
  }, [characterType, settings.speechRate]);

  return { speak };
};
