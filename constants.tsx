
import { SkillLevel, SkillNode, CharacterType } from './types';

export const INITIAL_NODES: SkillNode[] = [
  {
    id: 's1',
    level: SkillLevel.PHONEMIC_AWARENESS,
    title: "Brio's Beat Lab",
    description: 'Discriminate and identify individual sounds in spoken words.',
    standard: 'CCSS.ELA-LITERACY.RF.K.2',
    isLocked: false,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 20, y: 75 },
    timeSpent: 0
  },
  {
    id: 's2',
    level: SkillLevel.LETTER_SOUNDS,
    title: "Diesel's Dig Site",
    description: 'Map letters to their primary consonant sounds.',
    standard: 'CCSS.ELA-LITERACY.RF.K.3.A',
    isLocked: true,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 45, y: 80 },
    timeSpent: 0
  },
  {
    id: 's3',
    level: SkillLevel.LETTER_SOUNDS,
    title: 'Vowel Valley',
    description: 'Master short vowel sounds and recognition.',
    standard: 'CCSS.ELA-LITERACY.RF.K.3.B',
    isLocked: true,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 75, y: 70 },
    timeSpent: 0
  },
  {
    id: 's4',
    level: SkillLevel.DIGRAPHS_BLENDS,
    title: 'Echo Canyon',
    description: 'Identify common digraphs like sh, ch, and th.',
    standard: 'CCSS.ELA-LITERACY.RF.1.3.A',
    isLocked: true,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 80, y: 40 },
    timeSpent: 0
  },
  {
    id: 's5',
    level: SkillLevel.BLENDING_CVC,
    title: 'Word Weaver Isle',
    description: 'Blend sounds to read complete CVC words.',
    standard: 'CCSS.ELA-LITERACY.RF.K.2.D',
    isLocked: true,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 50, y: 30 },
    timeSpent: 0
  },
  {
    id: 's6',
    level: SkillLevel.SIGHT_WORDS,
    title: "Zippy's Speedway",
    description: 'Recognize high-frequency sight words on sight.',
    standard: 'CCSS.ELA-LITERACY.RF.K.3.C',
    isLocked: true,
    isMastered: false,
    attempts: 0,
    successivePasses: 0,
    accuracy: 0,
    coordinates: { x: 25, y: 15 },
    timeSpent: 0
  }
];

export const COLORS = {
  primary: '#14B8A6', // Teal
  secondary: '#F59E0B', // Amber
  success: '#10B981', // Emerald
  danger: '#EF4444', // Red
  accent: '#6366F1', // Indigo
  magic: '#A855F7', // Purple
  dark: '#0F172A', // Slate 900
  seeds: '#78350f', // Amber Dark
};

export const CHARACTER_META: Record<CharacterType, { icon: string; color: string; voice: 'Kore' | 'Puck' | 'Zephyr' }> = {
  BRIO: { icon: '🎙️', color: COLORS.primary, voice: 'Kore' },
  VOWELIA: { icon: '✨', color: COLORS.magic, voice: 'Puck' },
  DIESEL: { icon: '🏗️', color: COLORS.secondary, voice: 'Kore' },
  ZIPPY: { icon: '🚀', color: COLORS.danger, voice: 'Zephyr' }
};
