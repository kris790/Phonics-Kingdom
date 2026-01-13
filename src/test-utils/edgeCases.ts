/**
 * Edge Case Test Utilities for Phonics Kingdom
 * 
 * Provides helpers for testing boundary values, null inputs,
 * async failures, and other edge cases specific to this app.
 */

// ============================================
// NULL/UNDEFINED/EMPTY GENERATORS
// ============================================

/** All falsy values for comprehensive null testing */
export const FALSY_VALUES = [null, undefined, '', 0, false, NaN];

/** Empty collection variants */
export const EMPTY_COLLECTIONS = {
  array: [] as unknown[],
  object: {} as Record<string, unknown>,
  string: '',
  map: new Map(),
  set: new Set(),
};

/** Generate null/undefined test cases for a given type */
export function nullVariants<T>(validValue: T): (T | null | undefined)[] {
  return [validValue, null, undefined];
}

// ============================================
// BOUNDARY VALUE GENERATORS
// ============================================

/** Common string length boundaries */
export const STRING_BOUNDARIES = {
  empty: '',
  single: 'a',
  typical: 'Hello World',
  max255: 'a'.repeat(255),
  max256: 'a'.repeat(256),
  max1000: 'a'.repeat(1000),
  unicode: '🦁👑🏰✨', // 4 emoji
  mixedUnicode: 'Hello 🦁 World 👑',
};

/** Common numeric boundaries */
export const NUMBER_BOUNDARIES = {
  zero: 0,
  one: 1,
  negative: -1,
  maxSafe: Number.MAX_SAFE_INTEGER,
  minSafe: Number.MIN_SAFE_INTEGER,
  maxValue: Number.MAX_VALUE,
  minValue: Number.MIN_VALUE,
  infinity: Infinity,
  negInfinity: -Infinity,
  nan: NaN,
};

/** Array size boundaries */
export const ARRAY_BOUNDARIES = {
  empty: [],
  single: [1],
  typical: [1, 2, 3, 4, 5],
  large100: Array.from({ length: 100 }, (_, i) => i),
  large1000: Array.from({ length: 1000 }, (_, i) => i),
};

// ============================================
// PHONICS-SPECIFIC TEST DATA
// ============================================

/** All 44 phonemes for comprehensive coverage */
export const ALL_PHONEMES = [
  // Short vowels
  'a', 'e', 'i', 'o', 'u',
  // Long vowels
  'ai', 'ee', 'ie', 'oa', 'ue',
  // Consonants
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
  'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z',
  // Digraphs
  'ch', 'sh', 'th', 'ng', 'wh',
  // R-controlled
  'ar', 'er', 'ir', 'or', 'ur',
  // Diphthongs
  'oi', 'ow', 'ou', 'aw',
] as const;

/** Edge case phoneme inputs */
export const PHONEME_EDGE_CASES = {
  valid: 'ch',
  invalid: 'xyz123',
  empty: '',
  withSpaces: ' ch ',
  uppercase: 'CH',
  mixedCase: 'Ch',
  special: '@#$',
  numeric: '123',
};

/** Mock player progress for testing */
export const MOCK_PLAYER_PROGRESS = {
  newPlayer: {
    totalScore: 0,
    sessionsCompleted: 0,
    masteredPhonemes: [],
    strugglingPhonemes: [],
  },
  midProgress: {
    totalScore: 500,
    sessionsCompleted: 10,
    masteredPhonemes: ['a', 'e', 'i'],
    strugglingPhonemes: ['th', 'ch'],
  },
  advanced: {
    totalScore: 5000,
    sessionsCompleted: 100,
    masteredPhonemes: ALL_PHONEMES.slice(0, 30),
    strugglingPhonemes: [],
  },
  maxedOut: {
    totalScore: Number.MAX_SAFE_INTEGER,
    sessionsCompleted: 9999,
    masteredPhonemes: [...ALL_PHONEMES],
    strugglingPhonemes: [],
  },
};

// ============================================
// ASYNC/NETWORK TEST HELPERS
// ============================================

/** Create a promise that rejects after delay */
export function createFailingPromise<T = never>(
  error: Error | string = 'Network error',
  delayMs = 0
): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(typeof error === 'string' ? new Error(error) : error);
    }, delayMs);
  });
}

/** Create a promise that times out */
export function createTimeoutPromise<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

/** Mock network conditions */
export const NETWORK_CONDITIONS = {
  offline: { online: false, effectiveType: 'none' },
  slow2g: { online: true, effectiveType: '2g', downlink: 0.25 },
  slow3g: { online: true, effectiveType: '3g', downlink: 0.75 },
  fast4g: { online: true, effectiveType: '4g', downlink: 10 },
};

/** Simulate network delay */
export function withNetworkDelay<T>(
  value: T,
  delayMs: number
): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delayMs));
}

// ============================================
// STORAGE TEST HELPERS
// ============================================

/** Mock localStorage that can simulate full storage */
export function createMockStorage(quotaExceeded = false): Storage {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      if (quotaExceeded) {
        throw new DOMException('QuotaExceededError');
      }
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

/** Mock localStorage that throws on access (private browsing) */
export function createBlockedStorage(): Storage {
  const error = new DOMException('Access denied');
  return {
    getItem: () => { throw error; },
    setItem: () => { throw error; },
    removeItem: () => { throw error; },
    clear: () => { throw error; },
    key: () => { throw error; },
    length: 0,
  };
}

// ============================================
// REACT COMPONENT TEST HELPERS
// ============================================

/** Props with all optional fields as undefined */
export function withMissingOptionalProps<T extends object>(
  requiredProps: Partial<T>
): T {
  return requiredProps as T;
}

/** Generate rapid click events for testing debounce */
export function simulateRapidClicks(
  callback: () => void,
  count: number,
  intervalMs = 10
): Promise<void> {
  return new Promise((resolve) => {
    let clicks = 0;
    const interval = setInterval(() => {
      callback();
      clicks++;
      if (clicks >= count) {
        clearInterval(interval);
        resolve();
      }
    }, intervalMs);
  });
}

// ============================================
// VALIDATION TEST HELPERS
// ============================================

/** Invalid format test data */
export const INVALID_FORMATS = {
  emails: ['not-an-email', '@missing.com', 'no@tld', 'spaces in@email.com'],
  dates: ['not-a-date', '13/13/2025', '2025-13-01', 'yesterday'],
  urls: ['not-a-url', 'ftp://wrong-protocol.com', '://missing-protocol.com'],
  json: ['{invalid}', '{"unclosed": ', 'null', 'undefined'],
};

/** Malformed data generators */
export function malformedJSON(): string[] {
  return [
    '{',
    '}',
    '{"key":}',
    '{"key": undefined}',
    "{'single': 'quotes'}",
    '{"trailing": "comma",}',
  ];
}

// ============================================
// ACCESSIBILITY TEST HELPERS
// ============================================

/** Keyboard event simulators */
export const KEYBOARD_EVENTS = {
  tab: { key: 'Tab', code: 'Tab', keyCode: 9 },
  enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
  escape: { key: 'Escape', code: 'Escape', keyCode: 27 },
  space: { key: ' ', code: 'Space', keyCode: 32 },
  arrowUp: { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
  arrowDown: { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
  arrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
  arrowRight: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
};

// ============================================
// TEST ASSERTION HELPERS
// ============================================

/** Assert a function doesn't throw for any input */
export async function assertNeverThrows(
  fn: (...args: unknown[]) => unknown,
  inputs: unknown[][]
): Promise<void> {
  for (const args of inputs) {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      throw new Error(
        `Function threw for inputs: ${JSON.stringify(args)}\nError: ${error}`
      );
    }
  }
}

/** Assert function gracefully handles all edge cases */
export function assertGracefulDegradation<T>(
  fn: (input: unknown) => T,
  fallback: T,
  edgeCases: unknown[] = FALSY_VALUES
): void {
  for (const input of edgeCases) {
    const result = fn(input);
    if (result === undefined || result === null) {
      throw new Error(
        `Function returned ${result} for input: ${JSON.stringify(input)}. Expected graceful fallback.`
      );
    }
  }
}
