
import { SkillLevel } from '../types';

export interface PhonicsRule {
  id: string;
  level: SkillLevel;
  type: 'LETTER_SOUND' | 'CVC' | 'BLEND' | 'DIGRAPH' | 'RHYME' | 'SIGHT_WORD';
  target: string;
  description: string;
  examples: string[];
  difficulty: 1 | 2 | 3;
}

// Expanded for MVP Phase 1 (26 Sounds, 10 CVC Families, Sight Words)
export const PHONICS_RULES: PhonicsRule[] = [
  // Stage 1: Phonemic Awareness (Focus on Isolation & Rhyme)
  { id: 'S1_B', level: SkillLevel.PHONEMIC_AWARENESS, type: 'LETTER_SOUND', target: 'b', description: 'Beginning /b/', examples: ['ball', 'bat'], difficulty: 1 },
  { id: 'S1_M', level: SkillLevel.PHONEMIC_AWARENESS, type: 'LETTER_SOUND', target: 'm', description: 'Beginning /m/', examples: ['moon', 'map'], difficulty: 1 },
  { id: 'S1_S', level: SkillLevel.PHONEMIC_AWARENESS, type: 'LETTER_SOUND', target: 's', description: 'Beginning /s/', examples: ['sun', 'snake'], difficulty: 1 },
  { id: 'S1_RHYME_AT', level: SkillLevel.PHONEMIC_AWARENESS, type: 'RHYME', target: '-at', description: 'Rhyming with -at', examples: ['cat', 'bat'], difficulty: 1 },
  { id: 'S1_RHYME_AN', level: SkillLevel.PHONEMIC_AWARENESS, type: 'RHYME', target: '-an', description: 'Rhyming with -an', examples: ['fan', 'can'], difficulty: 1 },

  // Stage 2: Letter Sounds (The Alphabet)
  ...('abcdefghijklmnopqrstuvwxyz'.split('').map(char => ({
    id: `S2_${char.toUpperCase()}`,
    level: SkillLevel.LETTER_SOUNDS,
    type: 'LETTER_SOUND' as const,
    target: char,
    description: `Sound of /${char}/`,
    examples: [], // Will be pulled from wordBank
    difficulty: 1 as const
  }))),

  // Stage 5: Blending CVC (10 Core Families)
  { id: 'S5_AT', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_at', description: 'CVC -at', examples: ['cat', 'bat'], difficulty: 2 },
  { id: 'S5_AN', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_an', description: 'CVC -an', examples: ['fan', 'pan'], difficulty: 2 },
  { id: 'S5_AP', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_ap', description: 'CVC -ap', examples: ['cap', 'map'], difficulty: 2 },
  { id: 'S5_EN', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_en', description: 'CVC -en', examples: ['hen', 'pen'], difficulty: 2 },
  { id: 'S5_ET', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_et', description: 'CVC -et', examples: ['net', 'jet'], difficulty: 2 },
  { id: 'S5_IG', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_ig', description: 'CVC -ig', examples: ['pig', 'dig'], difficulty: 2 },
  { id: 'S5_IN', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_in', description: 'CVC -in', examples: ['bin', 'fin'], difficulty: 2 },
  { id: 'S5_OT', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_ot', description: 'CVC -ot', examples: ['pot', 'hot'], difficulty: 2 },
  { id: 'S5_UG', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_ug', description: 'CVC -ug', examples: ['bug', 'rug'], difficulty: 2 },
  { id: 'S5_UN', level: SkillLevel.BLENDING_CVC, type: 'CVC', target: '_un', description: 'CVC -un', examples: ['sun', 'run'], difficulty: 2 },

  // Stage 6: Sight Words
  { id: 'S6_HIGH_FREQ', level: SkillLevel.SIGHT_WORDS, type: 'SIGHT_WORD', target: 'high_freq', description: 'Common Sight Words', examples: ['the', 'and'], difficulty: 1 },
];
