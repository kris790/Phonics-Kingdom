// Word to Picture Mapping - Emoji representations for phonics words
// Used across all task components for visual learning

// Letter to picture mapping - for letter sounds
export const LETTER_PICTURES: Record<string, { emoji: string; word: string }> = {
  a: { emoji: '🐜', word: 'ant' },
  b: { emoji: '🦋', word: 'butterfly' },
  c: { emoji: '🚗', word: 'car' },
  d: { emoji: '🦆', word: 'duck' },
  e: { emoji: '🐘', word: 'elephant' },
  f: { emoji: '🦊', word: 'fox' },
  g: { emoji: '🦒', word: 'giraffe' },
  h: { emoji: '🦔', word: 'hedgehog' },
  i: { emoji: '🦎', word: 'iguana' },
  j: { emoji: '🃏', word: 'joker' },
  k: { emoji: '🦘', word: 'kangaroo' },
  l: { emoji: '🍋', word: 'lemon' },
  m: { emoji: '🌙', word: 'moon' },
  n: { emoji: '🥜', word: 'nut' },
  o: { emoji: '🦉', word: 'owl' },
  p: { emoji: '🐧', word: 'penguin' },
  q: { emoji: '❓', word: 'question' },
  r: { emoji: '🤖', word: 'robot' },
  s: { emoji: '⭐', word: 'star' },
  t: { emoji: '🚂', word: 'train' },
  u: { emoji: '🦄', word: 'unicorn' },
  v: { emoji: '🌋', word: 'volcano' },
  w: { emoji: '🐺', word: 'wolf' },
  x: { emoji: '🎄', word: 'xmas tree' },
  y: { emoji: '🛥️', word: 'yacht' },
  z: { emoji: '⚡', word: 'zap' },
};

// Digraph to picture mapping
export const DIGRAPH_PICTURES: Record<string, { emoji: string; word: string }> = {
  ch: { emoji: '🧀', word: 'cheese' },
  sh: { emoji: '🚢', word: 'ship' },
  th: { emoji: '👍', word: 'thumb' },
  wh: { emoji: '🐳', word: 'whale' },
  ph: { emoji: '📱', word: 'phone' },
  ck: { emoji: '🦆', word: 'duck' },
  ng: { emoji: '💍', word: 'ring' },
  qu: { emoji: '👸', word: 'queen' },
};

// Comprehensive word to picture mapping
export const WORD_PICTURES: Record<string, string> = {
  // Short A words
  cat: '🐱', hat: '🎩', bat: '🦇', sat: '🪑', mat: '🧹', rat: '🐀',
  pat: '👋', can: '🥫', pan: '🍳', man: '👨', fan: '🌀', van: '🚐',
  ran: '🏃', tan: '☀️', dad: '👨', had: '✋', bad: '👎', sad: '😢',
  mad: '😠', cap: '🧢', map: '🗺️', tap: '🚰', nap: '😴', gap: '🕳️',
  lap: '🦵', bag: '👜', tag: '🏷️', rag: '🧽', wag: '🐕',
  
  // Short E words
  bed: '🛏️', red: '🔴', fed: '🍼', led: '💡', wed: '💒',
  pet: '🐕', wet: '💧', set: '🎯', get: '🎁', let: '✅',
  net: '🥅', bet: '🎰', jet: '✈️', met: '🤝', vet: '👨‍⚕️',
  hen: '🐔', ten: '🔟', pen: '🖊️', men: '👥', den: '🏠',
  leg: '🦵', beg: '🙏', peg: '📌',
  
  // Short I words
  pig: '🐷', big: '🐘', dig: '⛏️', wig: '💇', fig: '🍇',
  jig: '💃', sit: '🪑', hit: '👊', bit: '🦷', fit: '💪',
  kit: '🧰', lit: '🔥', pit: '🕳️', wit: '🧠',
  pin: '📌', tin: '🥫', win: '🏆', bin: '🗑️', fin: '🦈',
  din: '🔔', kid: '👦', hid: '🙈', lid: '🫕', did: '✅',
  rid: '🗑️', dip: '🫕', hip: '💃', lip: '👄', rip: '📄',
  sip: '🥤', tip: '💡', zip: '🤐',
  
  // Short O words
  hot: '🔥', pot: '🍲', dot: '⚫', cot: '🛏️', got: '🎁',
  lot: '📦', not: '❌', rot: '🍂', dog: '🐕', log: '🪵',
  fog: '🌫️', hog: '🐗', jog: '🏃', bog: '🌿',
  top: '🔝', hop: '🐰', mop: '🧹', pop: '🎈', cop: '👮',
  box: '📦', fox: '🦊', mom: '👩', job: '💼', rob: '💰',
  bob: '🎈', sob: '😢', cob: '🌽', mob: '👥',
  
  // Short U words
  cup: '☕', pup: '🐕', sun: '☀️', run: '🏃', fun: '🎉',
  bun: '🍞', gun: '🔫', bug: '🐛', rug: '🧶', hug: '🤗',
  jug: '🫗', mug: '☕', tug: '🚢', dug: '⛏️',
  cut: '✂️', but: '👆', hut: '🛖', nut: '🥜', gut: '💪',
  rut: '🛤️', bus: '🚌', gum: '🍬', sum: '➕', hum: '🎵',
  mud: '💩', bud: '🌱', cub: '🐻', rub: '✋', tub: '🛁', sub: '🥪',
  
  // Blends
  blue: '🔵', black: '⚫', brown: '🟤', clean: '✨', clock: '⏰',
  crab: '🦀', drum: '🥁', flag: '🚩', frog: '🐸', glass: '🥛',
  green: '🟢', play: '🎮', skip: '⏭️', slide: '🛝', small: '🐜',
  snake: '🐍', spin: '🌀', stop: '🛑', swim: '🏊', tree: '🌳',
  train: '🚂', brick: '🧱', grass: '🌿', price: '💲', proud: '💪',
  trust: '🤝',
  
  // Digraphs
  chip: '🍟', chat: '💬', chop: '🪓', chin: '🧔', cheese: '🧀',
  ship: '🚢', shop: '🏪', shut: '🚪', fish: '🐟', wish: '⭐',
  dish: '🍽️', shell: '🐚', brush: '🖌️',
  this: '👆', that: '👉', them: '👥', then: '➡️',
  when: '⏰', what: '❓', where: '📍', white: '⚪', whip: '🪢', whale: '🐳',
  duck: '🦆', back: '⬅️', kick: '🦵', sock: '🧦', rock: '🪨', pick: '⛏️',
  phone: '📱', graph: '📊', photo: '📷', elephant: '🐘',
  
  // Sight words
  a: '1️⃣', I: '👆', the: '📰', to: '➡️', and: '➕',
  is: '✅', it: '👆', you: '👉', my: '👈', we: '👥',
  see: '👀', go: '🏃', like: '❤️', me: '👆',
  he: '👦', she: '👧', was: '⏮️', for: '🎁', are: '✅',
  on: '💡', they: '👥', with: '🤝', have: '✋', his: '👨',
  her: '👩', said: '💬', there: '👉', use: '🛠️', an: '1️⃣',
  each: '📊', which: '❓', do: '✅', how: '❓', their: '👥',
  if: '❓', will: '📜', up: '⬆️', other: '👥', about: '💭',
  out: '👉', many: '📊',
  after: '⏭️', again: '🔄', any: '❓', ask: '❓', by: '📍',
  could: '💭', every: '📊', fly: '🦅', from: '⬅️', give: '🎁',
  going: '🏃', has: '✋', him: '👨', just: '👌', know: '🧠',
  live: '🏠', may: '📅', of: '📦', old: '👴', once: '1️⃣',
  open: '🚪', over: '⬆️', put: '📦', round: '⭕', some: '📊',
  take: '✋', thank: '🙏', think: '🤔', walk: '🚶', were: '⏮️',
};

// Get picture for a word
export const getWordPicture = (word: string): string => {
  const lowerWord = word.toLowerCase();
  return WORD_PICTURES[lowerWord] || '📝';
};

// Get picture for a letter
export const getLetterPicture = (letter: string): { emoji: string; word: string } => {
  const lowerLetter = letter.toLowerCase();
  return LETTER_PICTURES[lowerLetter] || { emoji: '❓', word: letter };
};

// Get picture for a digraph
export const getDigraphPicture = (digraph: string): { emoji: string; word: string } => {
  const lowerDigraph = digraph.toLowerCase();
  return DIGRAPH_PICTURES[lowerDigraph] || { emoji: '📝', word: digraph };
};
