// Phonics Rules Data
import { PhonicsRule } from '../types';

export const phonicsRules: PhonicsRule[] = [
  // Level 1: Basic Consonants
  { id: 'b-sound', category: 'consonants', pattern: 'b', description: 'B says /b/ as in ball', examples: ['ball', 'bat', 'bed', 'bug'], level: 1 },
  { id: 'c-sound', category: 'consonants', pattern: 'c', description: 'C says /k/ as in cat', examples: ['cat', 'cup', 'car', 'can'], level: 1 },
  { id: 'd-sound', category: 'consonants', pattern: 'd', description: 'D says /d/ as in dog', examples: ['dog', 'dad', 'dig', 'dot'], level: 1 },
  { id: 'f-sound', category: 'consonants', pattern: 'f', description: 'F says /f/ as in fish', examples: ['fish', 'fun', 'fan', 'fog'], level: 1 },
  { id: 'g-sound', category: 'consonants', pattern: 'g', description: 'G says /g/ as in goat', examples: ['goat', 'get', 'gas', 'gum'], level: 1 },
  { id: 'h-sound', category: 'consonants', pattern: 'h', description: 'H says /h/ as in hat', examples: ['hat', 'hot', 'hen', 'hug'], level: 1 },
  { id: 'j-sound', category: 'consonants', pattern: 'j', description: 'J says /j/ as in jam', examples: ['jam', 'jet', 'jog', 'jug'], level: 1 },
  { id: 'k-sound', category: 'consonants', pattern: 'k', description: 'K says /k/ as in kite', examples: ['kite', 'kid', 'kit', 'key'], level: 1 },
  { id: 'l-sound', category: 'consonants', pattern: 'l', description: 'L says /l/ as in lion', examples: ['lion', 'lip', 'log', 'leg'], level: 1 },
  { id: 'm-sound', category: 'consonants', pattern: 'm', description: 'M says /m/ as in moon', examples: ['moon', 'mom', 'map', 'mud'], level: 1 },
  { id: 'n-sound', category: 'consonants', pattern: 'n', description: 'N says /n/ as in nest', examples: ['nest', 'net', 'nap', 'nut'], level: 1 },
  { id: 'p-sound', category: 'consonants', pattern: 'p', description: 'P says /p/ as in pig', examples: ['pig', 'pan', 'pet', 'pot'], level: 1 },
  { id: 'r-sound', category: 'consonants', pattern: 'r', description: 'R says /r/ as in red', examples: ['red', 'run', 'rat', 'rug'], level: 1 },
  { id: 's-sound', category: 'consonants', pattern: 's', description: 'S says /s/ as in sun', examples: ['sun', 'sit', 'sad', 'sip'], level: 1 },
  { id: 't-sound', category: 'consonants', pattern: 't', description: 'T says /t/ as in top', examples: ['top', 'ten', 'tap', 'tub'], level: 1 },
  { id: 'v-sound', category: 'consonants', pattern: 'v', description: 'V says /v/ as in van', examples: ['van', 'vet', 'vat', 'vest'], level: 1 },
  { id: 'w-sound', category: 'consonants', pattern: 'w', description: 'W says /w/ as in web', examples: ['web', 'win', 'wet', 'wag'], level: 1 },
  { id: 'y-sound', category: 'consonants', pattern: 'y', description: 'Y says /y/ as in yes', examples: ['yes', 'yak', 'yam', 'yet'], level: 1 },
  { id: 'z-sound', category: 'consonants', pattern: 'z', description: 'Z says /z/ as in zip', examples: ['zip', 'zoo', 'zap', 'zig'], level: 1 },

  // Level 2: Short Vowels
  { id: 'short-a', category: 'short-vowels', pattern: 'a', description: 'Short A says /ă/ as in cat', examples: ['cat', 'hat', 'bat', 'sat', 'mat', 'rat'], level: 2 },
  { id: 'short-e', category: 'short-vowels', pattern: 'e', description: 'Short E says /ĕ/ as in bed', examples: ['bed', 'red', 'pet', 'wet', 'hen', 'ten'], level: 2 },
  { id: 'short-i', category: 'short-vowels', pattern: 'i', description: 'Short I says /ĭ/ as in pig', examples: ['pig', 'big', 'dig', 'wig', 'sit', 'hit'], level: 2 },
  { id: 'short-o', category: 'short-vowels', pattern: 'o', description: 'Short O says /ŏ/ as in hot', examples: ['hot', 'pot', 'dot', 'cot', 'log', 'dog'], level: 2 },
  { id: 'short-u', category: 'short-vowels', pattern: 'u', description: 'Short U says /ŭ/ as in cup', examples: ['cup', 'pup', 'sun', 'run', 'bug', 'rug'], level: 2 },

  // Level 3: Blends
  { id: 'bl-blend', category: 'blends', pattern: 'bl', description: 'BL blend as in blue', examples: ['blue', 'black', 'block', 'blend'], level: 3 },
  { id: 'br-blend', category: 'blends', pattern: 'br', description: 'BR blend as in brown', examples: ['brown', 'bread', 'bridge', 'brick'], level: 3 },
  { id: 'cl-blend', category: 'blends', pattern: 'cl', description: 'CL blend as in clap', examples: ['clap', 'class', 'clean', 'clock'], level: 3 },
  { id: 'cr-blend', category: 'blends', pattern: 'cr', description: 'CR blend as in crab', examples: ['crab', 'cry', 'cross', 'crib'], level: 3 },
  { id: 'dr-blend', category: 'blends', pattern: 'dr', description: 'DR blend as in drum', examples: ['drum', 'dress', 'drop', 'draw'], level: 3 },
  { id: 'fl-blend', category: 'blends', pattern: 'fl', description: 'FL blend as in flag', examples: ['flag', 'fly', 'flip', 'flat'], level: 3 },
  { id: 'fr-blend', category: 'blends', pattern: 'fr', description: 'FR blend as in frog', examples: ['frog', 'from', 'free', 'fry'], level: 3 },
  { id: 'gl-blend', category: 'blends', pattern: 'gl', description: 'GL blend as in glad', examples: ['glad', 'glass', 'glow', 'glue'], level: 3 },
  { id: 'gr-blend', category: 'blends', pattern: 'gr', description: 'GR blend as in green', examples: ['green', 'grass', 'grow', 'grab'], level: 3 },
  { id: 'pl-blend', category: 'blends', pattern: 'pl', description: 'PL blend as in play', examples: ['play', 'plan', 'plant', 'plus'], level: 3 },
  { id: 'pr-blend', category: 'blends', pattern: 'pr', description: 'PR blend as in print', examples: ['print', 'prize', 'press', 'pray'], level: 3 },
  { id: 'sk-blend', category: 'blends', pattern: 'sk', description: 'SK blend as in skip', examples: ['skip', 'sky', 'skin', 'skill'], level: 3 },
  { id: 'sl-blend', category: 'blends', pattern: 'sl', description: 'SL blend as in slide', examples: ['slide', 'sleep', 'slow', 'slip'], level: 3 },
  { id: 'sm-blend', category: 'blends', pattern: 'sm', description: 'SM blend as in small', examples: ['small', 'smell', 'smile', 'smart'], level: 3 },
  { id: 'sn-blend', category: 'blends', pattern: 'sn', description: 'SN blend as in snake', examples: ['snake', 'snow', 'snap', 'snack'], level: 3 },
  { id: 'sp-blend', category: 'blends', pattern: 'sp', description: 'SP blend as in spin', examples: ['spin', 'spot', 'spell', 'spoon'], level: 3 },
  { id: 'st-blend', category: 'blends', pattern: 'st', description: 'ST blend as in stop', examples: ['stop', 'star', 'step', 'stick'], level: 3 },
  { id: 'sw-blend', category: 'blends', pattern: 'sw', description: 'SW blend as in swim', examples: ['swim', 'sweet', 'swing', 'switch'], level: 3 },
  { id: 'tr-blend', category: 'blends', pattern: 'tr', description: 'TR blend as in tree', examples: ['tree', 'train', 'trip', 'truck'], level: 3 },
  { id: 'tw-blend', category: 'blends', pattern: 'tw', description: 'TW blend as in twin', examples: ['twin', 'twist', 'twelve', 'twice'], level: 3 },

  // Level 4: Digraphs
  { id: 'ch-digraph', category: 'digraphs', pattern: 'ch', description: 'CH says /ch/ as in chip', examples: ['chip', 'chat', 'chest', 'cheese', 'much', 'lunch'], level: 4 },
  { id: 'sh-digraph', category: 'digraphs', pattern: 'sh', description: 'SH says /sh/ as in ship', examples: ['ship', 'shop', 'shell', 'fish', 'wish', 'brush'], level: 4 },
  { id: 'th-digraph', category: 'digraphs', pattern: 'th', description: 'TH says /th/ as in this', examples: ['this', 'that', 'them', 'with', 'math', 'bath'], level: 4 },
  { id: 'wh-digraph', category: 'digraphs', pattern: 'wh', description: 'WH says /w/ as in when', examples: ['when', 'what', 'where', 'which', 'white', 'whale'], level: 4 },
  { id: 'ph-digraph', category: 'digraphs', pattern: 'ph', description: 'PH says /f/ as in phone', examples: ['phone', 'photo', 'graph', 'elephant'], level: 4 },
  { id: 'ck-digraph', category: 'digraphs', pattern: 'ck', description: 'CK says /k/ as in duck', examples: ['duck', 'back', 'kick', 'rock', 'lock', 'pick'], level: 4 },

  // Level 5: Long Vowels (Silent E)
  { id: 'long-a-silent-e', category: 'silent-e', pattern: 'a_e', description: 'A-E makes A say its name', examples: ['cake', 'make', 'lake', 'bake', 'name', 'game'], level: 5 },
  { id: 'long-i-silent-e', category: 'silent-e', pattern: 'i_e', description: 'I-E makes I say its name', examples: ['bike', 'like', 'time', 'nine', 'five', 'hide'], level: 5 },
  { id: 'long-o-silent-e', category: 'silent-e', pattern: 'o_e', description: 'O-E makes O say its name', examples: ['home', 'bone', 'rope', 'nose', 'rose', 'note'], level: 5 },
  { id: 'long-u-silent-e', category: 'silent-e', pattern: 'u_e', description: 'U-E makes U say its name', examples: ['cute', 'huge', 'tube', 'mule', 'cube', 'use'], level: 5 },

  // Level 6: R-Controlled Vowels
  { id: 'ar-sound', category: 'r-controlled', pattern: 'ar', description: 'AR says /ar/ as in car', examples: ['car', 'star', 'farm', 'park', 'hard', 'start'], level: 6 },
  { id: 'er-sound', category: 'r-controlled', pattern: 'er', description: 'ER says /er/ as in her', examples: ['her', 'fern', 'water', 'sister', 'butter'], level: 6 },
  { id: 'ir-sound', category: 'r-controlled', pattern: 'ir', description: 'IR says /er/ as in bird', examples: ['bird', 'girl', 'first', 'dirt', 'shirt'], level: 6 },
  { id: 'or-sound', category: 'r-controlled', pattern: 'or', description: 'OR says /or/ as in for', examples: ['for', 'corn', 'horn', 'storm', 'short'], level: 6 },
  { id: 'ur-sound', category: 'r-controlled', pattern: 'ur', description: 'UR says /er/ as in turn', examples: ['turn', 'burn', 'hurt', 'nurse', 'purse'], level: 6 },
];

export const getRulesByLevel = (level: number): PhonicsRule[] => {
  return phonicsRules.filter(rule => rule.level === level);
};

export const getRulesByCategory = (category: string): PhonicsRule[] => {
  return phonicsRules.filter(rule => rule.category === category);
};

export const getRuleById = (id: string): PhonicsRule | undefined => {
  return phonicsRules.find(rule => rule.id === id);
};
