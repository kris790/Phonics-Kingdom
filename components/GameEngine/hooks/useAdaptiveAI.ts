import { useState, useCallback } from 'react';
import { SkillNode, CharacterType, UserSettings, DifficultyLevel } from '../../../types';
import { geminiService } from '../../../services/gemini';

const PHONICS_NAMES: Record<CharacterType, string> = {
  BRIO: 'Brio the Beatboxer',
  VOWELIA: 'Vowelia',
  DIESEL: 'Diesel the Digger',
  ZIPPY: 'Zippy the Zoomer'
};

const PHONICS_ROLES: Record<CharacterType, string> = {
  BRIO: 'master of rhythm and syllables',
  VOWELIA: 'magical weaver of vowel sounds',
  DIESEL: 'strong builder of beginning sounds',
  ZIPPY: 'fast finisher of rhyming words'
};

export const useAdaptiveAI = (skill: SkillNode, characterType: CharacterType, settings: UserSettings) => {
  const [loading, setLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);

  const fetchTasks = useCallback(async (errorStreak: number) => {
    setLoading(true);
    try {
      // Determine final difficulty by combining user baseline with error streak logic
      let finalDifficulty = settings.difficulty as string;
      
      // If user is on "Hard" but failing, drop to Normal/Easy temporarily
      if (errorStreak >= 2) {
        finalDifficulty = DifficultyLevel.EASY;
      } else if (skill.attempts > 3 && skill.accuracy < 50) {
        finalDifficulty = DifficultyLevel.EASY;
      }

      const result = await geminiService.generatePhonicsPlan(
        skill.level, 
        PHONICS_NAMES[characterType], 
        PHONICS_ROLES[characterType], 
        finalDifficulty
      );
      return result.map((t: any) => ({
        ...t,
        type: t.type || (t.letterToTrace ? 'TRACING' : 'MULTIPLE_CHOICE')
      }));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [skill, characterType, settings.difficulty]);

  const generateVisual = useCallback(async (prompt: string) => {
    setVisualLoading(true);
    try {
      return await geminiService.generateVisualForTask(prompt);
    } finally {
      setVisualLoading(false);
    }
  }, []);

  return { loading, visualLoading, fetchTasks, generateVisual };
};