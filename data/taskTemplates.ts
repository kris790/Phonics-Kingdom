
import { Task, ActivityType, SkillLevel } from '../types';
import { getRandomWords } from './wordBank';

export interface TaskTemplate {
  type: ActivityType;
  generate: (level: SkillLevel, target: string) => Task;
}

const getFallbackOptions = (correct: string, count: number): string[] => {
  // Always ensure we have options by pulling from a generic high-frequency bank if specific pattern fails
  let distractors = getRandomWords('_at', count, [correct]);
  if (distractors.length < count) {
    // Hard-coded safety bank for foundational literacy
    const backup = ['cat', 'dog', 'sun', 'pig', 'net', 'map', 'bat', 'cup', 'leg', 'box'];
    distractors = [...distractors, ...backup.filter(w => w !== correct)].slice(0, count);
  }
  return [correct, ...distractors].sort(() => Math.random() - 0.5);
};

export const TASK_TEMPLATES: Record<string, TaskTemplate> = {
  VOICE_LAB: {
    type: 'VOICE_LAB',
    generate: (level, target): Task => {
      const sound = target.length === 1 ? target : 'b';
      return {
        prompt: `Can you say the /${sound}/ sound for Brio?`,
        targetSound: sound,
        options: ['Correct'],
        correctIndex: 0,
        type: 'VOICE_LAB'
      };
    }
  },

  SKYFALL_SHOOTER: {
    type: 'SKYFALL_SHOOTER',
    generate: (level, target): Task => {
      const pattern = target.startsWith('_') ? target : '_at';
      const word = getRandomWords(pattern, 1)[0] || 'CAT';
      return {
        prompt: `Blast the falling sounds to restore the word ${word.toUpperCase()}!`,
        targetWord: word.toUpperCase(),
        options: [word.toUpperCase()],
        correctIndex: 0,
        type: 'SKYFALL_SHOOTER'
      };
    }
  },

  SOUND_SORTER: {
    type: 'SOUND_SORTER',
    generate: (level, target): Task => {
      const sound = target.startsWith('_') ? target.substring(1) : target;
      const cleanSound = sound.length > 1 ? sound : sound.toLowerCase();
      
      let wordsWithSound = getRandomWords(cleanSound, 1);
      const correctWord = wordsWithSound[0] || 'cat';
      
      const options = getFallbackOptions(correctWord, 2);
      
      return {
        prompt: `Which one starts with the /${cleanSound}/ sound?`,
        targetSound: cleanSound,
        options,
        correctIndex: options.indexOf(correctWord),
        type: 'SOUND_SORTER'
      };
    }
  },

  CVC_BUILDER: {
    type: 'CVC_BUILDER',
    generate: (level, target): Task => {
      const pattern = target.startsWith('_') ? target : '_at';
      const word = getRandomWords(pattern, 1)[0] || 'cat';
      return {
        prompt: `Build the word: ${word}`,
        targetWord: word,
        options: getFallbackOptions(word, 3), 
        correctIndex: 0,
        type: 'CVC_BUILDER'
      };
    }
  },

  MULTIPLE_CHOICE: {
    type: 'MULTIPLE_CHOICE',
    generate: (level, target): Task => {
      const pattern = target.startsWith('_') ? target : '_at';
      const words = getRandomWords(pattern, 1);
      const correctWord = words[0] || 'cat';
      
      const options = getFallbackOptions(correctWord, 2);
      
      return {
        prompt: `Which word says "${correctWord}"?`,
        options,
        correctIndex: options.indexOf(correctWord),
        type: 'MULTIPLE_CHOICE'
      };
    }
  }
};

export const generateTasksForSkill = (skillLevel: SkillLevel, targetRule: string, count: number = 5): Task[] => {
  const tasks: Task[] = [];
  const templates: string[] = [];

  switch (skillLevel) {
    case SkillLevel.PHONEMIC_AWARENESS:
      templates.push('VOICE_LAB', 'SOUND_SORTER', 'MULTIPLE_CHOICE');
      break;
    case SkillLevel.LETTER_SOUNDS:
      templates.push('SKYFALL_SHOOTER', 'SOUND_SORTER', 'MULTIPLE_CHOICE');
      break;
    case SkillLevel.BLENDING_CVC:
      templates.push('CVC_BUILDER', 'SKYFALL_SHOOTER', 'MULTIPLE_CHOICE', 'SOUND_SORTER');
      break;
    default:
      templates.push('MULTIPLE_CHOICE');
  }

  for (let i = 0; i < count; i++) {
    const templateType = templates[i % templates.length];
    const template = TASK_TEMPLATES[templateType];
    tasks.push(template.generate(skillLevel, targetRule));
  }
  
  return tasks;
};
