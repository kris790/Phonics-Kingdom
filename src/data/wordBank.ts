// Word Bank Data - Offline data source for phonics tasks
import { Task, TaskType } from '../types';

// CVC Words organized by vowel sound
export const cvcWords = {
  shortA: ['cat', 'hat', 'bat', 'sat', 'mat', 'rat', 'pat', 'can', 'pan', 'man', 'fan', 'van', 'ran', 'tan', 'dad', 'had', 'bad', 'sad', 'mad', 'cap', 'map', 'tap', 'nap', 'gap', 'lap', 'bag', 'tag', 'rag', 'wag'],
  shortE: ['bed', 'red', 'fed', 'led', 'wed', 'pet', 'wet', 'set', 'get', 'let', 'net', 'bet', 'jet', 'met', 'vet', 'hen', 'ten', 'pen', 'men', 'den', 'leg', 'beg', 'peg'],
  shortI: ['pig', 'big', 'dig', 'wig', 'fig', 'jig', 'sit', 'hit', 'bit', 'fit', 'kit', 'lit', 'pit', 'wit', 'pin', 'tin', 'win', 'bin', 'fin', 'din', 'kid', 'hid', 'lid', 'did', 'rid', 'dip', 'hip', 'lip', 'rip', 'sip', 'tip', 'zip'],
  shortO: ['hot', 'pot', 'dot', 'cot', 'got', 'lot', 'not', 'rot', 'dog', 'log', 'fog', 'hog', 'jog', 'bog', 'top', 'hop', 'mop', 'pop', 'cop', 'box', 'fox', 'mom', 'job', 'rob', 'bob', 'sob', 'cob', 'mob'],
  shortU: ['cup', 'pup', 'sun', 'run', 'fun', 'bun', 'gun', 'bug', 'rug', 'hug', 'jug', 'mug', 'tug', 'dug', 'cut', 'but', 'hut', 'nut', 'gut', 'rut', 'bus', 'gum', 'sum', 'hum', 'mud', 'bud', 'cub', 'rub', 'tub', 'sub'],
};

// Sight words by grade level
export const sightWords = {
  preK: ['a', 'I', 'the', 'to', 'and', 'is', 'it', 'you', 'my', 'we', 'see', 'go', 'can', 'like', 'me'],
  kindergarten: ['he', 'she', 'was', 'for', 'are', 'on', 'they', 'but', 'had', 'with', 'have', 'his', 'her', 'what', 'said', 'there', 'use', 'an', 'each', 'which', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many'],
  firstGrade: ['after', 'again', 'any', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'has', 'him', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'],
};

// Rhyme families
export const rhymeFamilies: Record<string, string[]> = {
  '-at': ['cat', 'hat', 'bat', 'sat', 'mat', 'rat', 'pat', 'fat', 'flat', 'that'],
  '-an': ['can', 'pan', 'man', 'fan', 'van', 'ran', 'tan', 'plan', 'than', 'scan'],
  '-ap': ['cap', 'map', 'tap', 'nap', 'gap', 'lap', 'rap', 'clap', 'snap', 'trap'],
  '-ag': ['bag', 'tag', 'rag', 'wag', 'flag', 'drag', 'brag'],
  '-ad': ['dad', 'had', 'bad', 'sad', 'mad', 'glad', 'brad'],
  '-et': ['pet', 'wet', 'set', 'get', 'let', 'net', 'bet', 'jet', 'met', 'vet'],
  '-en': ['hen', 'ten', 'pen', 'men', 'den', 'then', 'when'],
  '-ed': ['bed', 'red', 'fed', 'led', 'wed', 'sled', 'shed'],
  '-ig': ['pig', 'big', 'dig', 'wig', 'fig', 'jig', 'twig'],
  '-it': ['sit', 'hit', 'bit', 'fit', 'kit', 'lit', 'pit', 'wit', 'spit', 'quit'],
  '-in': ['pin', 'tin', 'win', 'bin', 'fin', 'din', 'thin', 'spin', 'grin', 'chin'],
  '-ip': ['dip', 'hip', 'lip', 'rip', 'sip', 'tip', 'zip', 'chip', 'drip', 'flip', 'ship', 'skip', 'slip', 'trip'],
  '-ot': ['hot', 'pot', 'dot', 'cot', 'got', 'lot', 'not', 'rot', 'shot', 'spot'],
  '-og': ['dog', 'log', 'fog', 'hog', 'jog', 'bog', 'frog'],
  '-op': ['top', 'hop', 'mop', 'pop', 'cop', 'drop', 'shop', 'stop', 'chop'],
  '-ug': ['bug', 'rug', 'hug', 'jug', 'mug', 'tug', 'dug', 'plug', 'slug', 'drug'],
  '-un': ['sun', 'run', 'fun', 'bun', 'gun', 'spun', 'stun'],
  '-ut': ['cut', 'but', 'hut', 'nut', 'gut', 'rut', 'shut'],
  '-ub': ['cub', 'rub', 'tub', 'sub', 'club', 'grub', 'scrub'],
};

// Map island IDs to categories
const islandCategoryMap: Record<string, string> = {
  'consonant-cove': 'consonants',
  'vowel-valley': 'short-vowels',
  'blend-beach': 'blends',
  'digraph-den': 'digraphs',
  'sight-word-summit': 'sight-words',
};

// Generate tasks for a specific island
export const generateTasksForIsland = (
  islandId: string,
  count: number = 5,
  characterId: string = 'brio'
): Task[] => {
  const category = islandCategoryMap[islandId] || 'consonants';
  return generateFallbackTasks(category, characterId, count);
};

// Generate offline fallback tasks
export const generateFallbackTasks = (
  category: string,
  characterId: string,
  count: number = 5
): Task[] => {
  const tasks: Task[] = [];
  
  // Get words AND task types based on category
  let wordPool: string[] = [];
  let taskTypes: TaskType[] = [];
  let categoryLabel: string = '';
  
  switch (category) {
    case 'consonants':
      wordPool = [...cvcWords.shortA, ...cvcWords.shortI].slice(0, 30);
      // Consonant Cove focuses on letter sounds, matching, and shooting game
      taskTypes = ['letter-sound', 'skyfall-shooter', 'sound-match', 'letter-trace', 'letter-sound'];
      categoryLabel = 'consonant sounds';
      break;
    case 'short-vowels':
      wordPool = [...cvcWords.shortA, ...cvcWords.shortE, ...cvcWords.shortI, ...cvcWords.shortO, ...cvcWords.shortU];
      // Vowel Valley focuses on vowel sounds and word building
      taskTypes = ['word-complete', 'word-builder', 'skyfall-shooter', 'word-builder', 'word-complete'];
      categoryLabel = 'vowel sounds';
      break;
    case 'blends':
      wordPool = ['blue', 'black', 'brown', 'clean', 'clock', 'crab', 'drum', 'flag', 'frog', 'glass', 'green', 'play', 'skip', 'slide', 'small', 'snake', 'spin', 'stop', 'swim', 'tree', 'train', 'brick', 'grass', 'price', 'proud', 'trust'];
      // Blend Beach focuses on word building and rhymes
      taskTypes = ['word-builder', 'rhyme-time', 'word-complete', 'word-builder', 'rhyme-time'];
      categoryLabel = 'consonant blends';
      break;
    case 'digraphs':
      wordPool = ['chip', 'chat', 'chop', 'chin', 'ship', 'shop', 'shut', 'fish', 'wish', 'dish', 'this', 'that', 'them', 'then', 'when', 'what', 'where', 'white', 'whip', 'duck', 'back', 'pick', 'sock', 'phone', 'graph'];
      // Digraph Den focuses on sound matching and word building
      taskTypes = ['sound-match', 'word-builder', 'skyfall-shooter', 'rhyme-time', 'word-complete'];
      categoryLabel = 'digraph sounds';
      break;
    case 'sight-words':
      wordPool = [...sightWords.preK, ...sightWords.kindergarten];
      // Sight Word Summit focuses on whole-word recognition and tracing
      taskTypes = ['word-builder', 'letter-trace', 'word-builder', 'word-complete', 'word-builder'];
      categoryLabel = 'sight words';
      break;
    default:
      wordPool = [...cvcWords.shortA, ...cvcWords.shortE];
      taskTypes = ['letter-sound', 'word-builder', 'rhyme-time', 'sound-match', 'skyfall-shooter'];
      categoryLabel = 'phonics';
  }
  
  // Shuffle and pick words
  const shuffled = wordPool.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count; i++) {
    const word = shuffled[i % shuffled.length];
    const taskType = taskTypes[i % taskTypes.length];
    
    const task = createTask(word, taskType, characterId, i, categoryLabel);
    tasks.push(task);
  }
  
  return tasks;
};

// Helper functions need to be defined before createTask
const generateLetterSoundOptions = (letter: string): Task['options'] => {
  const allLetters = 'bcdfghjklmnprstvwyz'.split('');
  const otherLetters = allLetters.filter(l => l !== letter.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 3);
  
  const options = [
    { id: '1', text: letter.toUpperCase(), isCorrect: true },
    ...otherLetters.map((l, i) => ({ id: String(i + 2), text: l.toUpperCase(), isCorrect: false })),
  ];
  
  return options.sort(() => Math.random() - 0.5);
};

const generateWordBuilderOptions = (word: string): Task['options'] => {
  const letters = word.toUpperCase().split('');
  const extraLetters = 'AEIOU'.split('').filter(l => !letters.includes(l)).slice(0, 2);
  const allLetters = [...letters, ...extraLetters].sort(() => Math.random() - 0.5);
  
  return allLetters.map((letter, i) => ({
    id: String(i + 1),
    text: letter,
    isCorrect: letters.includes(letter),
  }));
};

const findRhymeFamily = (word: string): string | null => {
  for (const [family, words] of Object.entries(rhymeFamilies)) {
    if (words.includes(word)) {
      return family;
    }
  }
  return null;
};

const generateRhymeOptions = (word: string, rhymes: string[]): Task['options'] => {
  const correctRhyme = rhymes[0] || word;
  const nonRhymes = Object.values(cvcWords).flat()
    .filter(w => !rhymes.includes(w) && w !== word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const options = [
    { id: '1', text: correctRhyme, isCorrect: true },
    ...nonRhymes.map((w, i) => ({ id: String(i + 2), text: w, isCorrect: false })),
  ];
  
  return options.sort(() => Math.random() - 0.5);
};

const generateSoundMatchOptions = (word: string): Task['options'] => {
  const startLetter = word[0].toLowerCase();
  const allWords = Object.values(cvcWords).flat();
  
  const matchingWord = allWords.find(w => w[0] === startLetter && w !== word) || word;
  const nonMatching = allWords.filter(w => w[0] !== startLetter).sort(() => Math.random() - 0.5).slice(0, 3);
  
  const options = [
    { id: '1', text: matchingWord, isCorrect: true },
    ...nonMatching.map((w, i) => ({ id: String(i + 2), text: w, isCorrect: false })),
  ];
  
  return options.sort(() => Math.random() - 0.5);
};

const findWordWithSameStart = (word: string): string => {
  const startLetter = word[0].toLowerCase();
  const allWords = Object.values(cvcWords).flat();
  return allWords.find(w => w[0] === startLetter && w !== word) || word;
};

const generateWordCompleteOptions = (correctLetter: string): Task['options'] => {
  const vowels = 'aeiou'.split('');
  const consonants = 'bcdfghjklmnprstvwxyz'.split('');
  
  // Determine if correct letter is vowel or consonant
  const isVowel = vowels.includes(correctLetter.toLowerCase());
  const pool = isVowel ? vowels : consonants;
  
  // Get 3 wrong options
  const wrongLetters = pool
    .filter(l => l !== correctLetter.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const options = [
    { id: '1', text: correctLetter.toUpperCase(), isCorrect: true },
    ...wrongLetters.map((l, i) => ({ id: String(i + 2), text: l.toUpperCase(), isCorrect: false })),
  ];
  
  return options.sort(() => Math.random() - 0.5);
};

const createTask = (
  word: string,
  taskType: TaskType,
  characterId: string,
  index: number,
  categoryLabel: string = 'phonics'
): Task => {
  const id = `task-${Date.now()}-${index}`;
  
  switch (taskType) {
    case 'letter-sound':
      return {
        id,
        type: 'letter-sound',
        targetPhoneme: word[0],
        instruction: `Let's learn the /${word[0].toLowerCase()}/ sound!`,
        prompt: '',  // LetterSoundTask handles its own display
        options: generateLetterSoundOptions(word[0]),
        correctAnswer: word[0],
        difficulty: 1,
        characterId,
      };
      
    case 'word-builder':
      const builderInstructions = [
        'Build the word!',
        'Spell it out!',
        'Put the letters together!',
      ];
      return {
        id,
        type: 'word-builder',
        targetPhoneme: word,
        instruction: builderInstructions[index % builderInstructions.length],
        prompt: `Can you spell "${word}"? Tap the letters in order!`,
        options: generateWordBuilderOptions(word),
        correctAnswer: word,
        difficulty: 2,
        characterId,
      };
      
    case 'rhyme-time':
      const rhymeFamily = findRhymeFamily(word);
      const rhymes = rhymeFamily ? rhymeFamilies[rhymeFamily].filter(w => w !== word) : [];
      const rhymeInstructions = [
        'Find the rhyme!',
        'Which word sounds the same at the end?',
        'Rhyme time! Pick the matching sound!',
      ];
      return {
        id,
        type: 'rhyme-time',
        targetPhoneme: rhymeFamily || word.slice(-2),
        instruction: rhymeInstructions[index % rhymeInstructions.length],
        prompt: `Which word rhymes with "${word}"?`,
        options: generateRhymeOptions(word, rhymes),
        correctAnswer: rhymes[0] || word,
        difficulty: 2,
        characterId,
      };
      
    case 'sound-match':
      const matchInstructions = [
        'Match the sound!',
        'Find a word with the same beginning!',
        'Which word starts the same way?',
      ];
      return {
        id,
        type: 'sound-match',
        targetPhoneme: word[0],
        instruction: matchInstructions[index % matchInstructions.length],
        prompt: `Find another word that starts like "${word}"`,
        options: generateSoundMatchOptions(word),
        correctAnswer: findWordWithSameStart(word),
        difficulty: 1,
        characterId,
      };

    case 'skyfall-shooter':
      return {
        id,
        type: 'skyfall-shooter',
        targetPhoneme: word[0],
        instruction: `Shoot the letter "${word[0].toUpperCase()}"!`,
        prompt: `Tap all the "${word[0].toUpperCase()}" letters falling from the sky!`,
        options: [{ id: '1', text: word[0].toUpperCase(), isCorrect: true }],
        correctAnswer: word[0],
        difficulty: 2,
        characterId,
      };

    case 'letter-trace':
      return {
        id,
        type: 'letter-trace',
        targetPhoneme: word[0],
        instruction: `Trace the letter "${word[0].toUpperCase()}"!`,
        prompt: `Practice writing the letter "${word[0].toUpperCase()}" - it starts the word "${word}"`,
        options: [{ id: '1', text: word[0].toUpperCase(), isCorrect: true }],
        correctAnswer: word[0],
        difficulty: 1,
        characterId,
      };

    case 'word-complete':
    case 'fill-blank':
      // Create a word with a missing letter (usually a vowel)
      const vowelIndex = word.split('').findIndex(c => 'aeiou'.includes(c.toLowerCase()));
      const blankPosition = vowelIndex >= 0 ? vowelIndex : 1;
      const missingLetter = word[blankPosition];
      const incompleteWord = word.slice(0, blankPosition) + '_' + word.slice(blankPosition + 1);
      
      return {
        id,
        type: 'word-complete',
        targetPhoneme: missingLetter,
        instruction: 'Complete the word!',
        prompt: `Fill in the missing letter: ${incompleteWord}`,
        options: generateWordCompleteOptions(missingLetter),
        correctAnswer: word,
        hint: `Think about what sound goes in the middle!`,
        difficulty: 2,
        characterId,
      };
      
    default:
      return {
        id,
        type: 'letter-sound',
        targetPhoneme: word[0],
        instruction: `What sound does "${word[0].toUpperCase()}" make?`,
        prompt: `What sound starts "${word}"?`,
        options: generateLetterSoundOptions(word[0]),
        correctAnswer: word[0],
        difficulty: 1,
        characterId,
      };
  }
};

export const wordBank = {
  cvcWords,
  sightWords,
  rhymeFamilies,
  generateFallbackTasks,
};
