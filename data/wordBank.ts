
export const WORD_BANK = {
  // Categorized by phonics pattern (Medial Vowel + Rime)
  CVC: {
    '_at': ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat'],
    '_an': ['can', 'fan', 'man', 'pan', 'van', 'ran', 'tan', 'ban'],
    '_am': ['ham', 'jam', 'ram', 'yam', 'dam', 'pam', 'sam'],
    '_ap': ['cap', 'map', 'nap', 'tap', 'lap', 'gap', 'zap'],
    '_en': ['hen', 'pen', 'ten', 'men', 'den', 'ken', 'ben'],
    '_et': ['pet', 'wet', 'jet', 'net', 'bet', 'get', 'let', 'set'],
    '_ig': ['pig', 'wig', 'dig', 'big', 'fig', 'jig', 'rig'],
    '_in': ['bin', 'fin', 'pin', 'tin', 'win', 'sin', 'kin'],
    '_ip': ['zip', 'sip', 'tip', 'dip', 'hip', 'lip', 'rip'],
    '_ot': ['dot', 'hot', 'pot', 'cot', 'lot', 'not', 'got', 'rot'],
    '_op': ['top', 'hop', 'pop', 'mop', 'cop', 'sop'],
    '_ug': ['bug', 'rug', 'mug', 'hug', 'tug', 'jug', 'pug', 'dug'],
    '_un': ['sun', 'run', 'bun', 'fun', 'gun', 'nun', 'pun']
  },
  
  // Beginning sounds for phonemic awareness (Diesel & Brio's Modules)
  BEGINNING_SOUNDS: {
    'b': ['ball', 'bat', 'bed', 'bell', 'bird', 'book', 'boy', 'bus', 'box', 'bear'],
    'c': ['cat', 'can', 'cap', 'car', 'cup', 'cake', 'cow', 'corn', 'coat'],
    'd': ['dog', 'dad', 'duck', 'door', 'doll', 'desk', 'drum', 'deer', 'dot', 'dig'],
    'f': ['fan', 'fish', 'fox', 'fork', 'farm', 'feet', 'fire', 'fig', 'fat', 'fun'],
    'g': ['goat', 'girl', 'gate', 'gum', 'gift', 'gold', 'goose', 'game'],
    'h': ['hat', 'hen', 'hop', 'hug', 'ham', 'hippo', 'house', 'hand'],
    'j': ['jet', 'jam', 'jug', 'jump', 'jelly', 'jar', 'job'],
    'k': ['kite', 'kid', 'kit', 'key', 'king', 'kick', 'kangaroo'],
    'l': ['lip', 'log', 'leg', 'lid', 'lion', 'lamp', 'leaf', 'lock'],
    'm': ['moon', 'map', 'mouse', 'milk', 'mask', 'mug', 'mat', 'man'],
    'n': ['net', 'nap', 'nut', 'nine', 'nose', 'nest', 'neck'],
    'p': ['pig', 'pen', 'pot', 'pan', 'pin', 'pet', 'pie', 'pear'],
    'r': ['rat', 'run', 'rug', 'red', 'ring', 'rain', 'road', 'rock'],
    's': ['sun', 'snake', 'sock', 'star', 'seal', 'seed', 'sit', 'six'],
    't': ['top', 'ten', 'tap', 'tiger', 'tent', 'table', 'toe'],
    'v': ['van', 'vest', 'vase', 'vine', 'vote'],
    'w': ['wig', 'wet', 'web', 'win', 'wolf', 'wall', 'wind'],
    'y': ['yak', 'yam', 'yes', 'yellow', 'yo-yo'],
    'z': ['zip', 'zoo', 'zero', 'zebra', 'zigzag']
  },
  
  // Rhyming families (for Zippy's Speed Speedway)
  RHYME_FAMILIES: [
    { family: '-at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat'] },
    { family: '-an', words: ['can', 'fan', 'man', 'pan', 'van', 'ran', 'tan'] },
    { family: '-ap', words: ['cap', 'map', 'nap', 'tap', 'lap', 'gap', 'zap'] },
    { family: '-en', words: ['hen', 'pen', 'ten', 'men', 'den', 'ken'] },
    { family: '-et', words: ['pet', 'wet', 'jet', 'net', 'bet', 'get', 'let'] },
    { family: '-ig', words: ['pig', 'wig', 'dig', 'big', 'fig', 'jig'] },
    { family: '-op', words: ['top', 'hop', 'pop', 'mop', 'cop', 'sop'] },
    { family: '-ug', words: ['bug', 'rug', 'mug', 'hug', 'tug', 'jug', 'pug'] },
    { family: '-in', words: ['bin', 'fin', 'pin', 'tin', 'win', 'sin'] },
    { family: '-ot', words: ['dot', 'hot', 'pot', 'cot', 'lot', 'not'] }
  ],
  
  // Digraphs (Vowelia's Advanced Missions)
  DIGRAPHS: {
    'sh': ['ship', 'shell', 'shop', 'shut', 'fish', 'dish', 'cash'],
    'ch': ['chip', 'chop', 'chin', 'chat', 'rich', 'much', 'such'],
    'th': ['this', 'that', 'then', 'with', 'path', 'math', 'bath'],
    'wh': ['when', 'whip', 'whiz', 'whale', 'white', 'wheel']
  },

  // High-frequency Sight Words
  SIGHT_WORDS: ['the', 'and', 'is', 'it', 'to', 'in', 'was', 'said', 'for', 'on', 'she', 'he', 'we', 'go', 'up', 'am', 'at', 'be', 'by', 'do', 'if', 'me', 'my', 'no', 'of', 'or'],

  TRACING_LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
};

/**
 * Utility: Get random words from a specific pattern bank.
 */
export const getRandomWords = (pattern: string, count: number, exclude: string[] = []): string[] => {
  const bank = (WORD_BANK.CVC as any)[pattern] || (WORD_BANK.DIGRAPHS as any)[pattern] || (WORD_BANK.BEGINNING_SOUNDS as any)[pattern] || [];
  const available = bank.filter((word: string) => !exclude.includes(word));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Utility: Pick a single random item from an array.
 */
export const getRandomFrom = <T>(arr: T[]): T => {
  if (!arr || arr.length === 0) throw new Error("Cannot pick from empty array");
  return arr[Math.floor(Math.random() * arr.length)];
};
