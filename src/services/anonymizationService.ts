// Anonymization Service - PII Stripping for COPPA/GDPR-K Compliance
// Strips personally identifiable information from all prompts sent to external APIs

// ============================================
// Types
// ============================================
export interface AnonymizationResult {
  anonymizedText: string;
  piiDetected: PiiDetection[];
  wasModified: boolean;
}

export interface PiiDetection {
  type: PiiType;
  original: string;
  replacement: string;
  position: { start: number; end: number };
}

export type PiiType =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'age'
  | 'birthdate'
  | 'location'
  | 'school'
  | 'ssn'
  | 'ip-address'
  | 'url-with-pii'
  | 'custom-id';

export interface AnonymizationConfig {
  stripNames: boolean;
  stripEmails: boolean;
  stripPhones: boolean;
  stripAddresses: boolean;
  stripAges: boolean;
  stripBirthdates: boolean;
  stripLocations: boolean;
  stripSchoolNames: boolean;
  stripCustomIds: boolean;
  logDetections: boolean;
}

// ============================================
// Default Configuration (Maximum Privacy for Children)
// ============================================
const DEFAULT_CONFIG: AnonymizationConfig = {
  stripNames: true,
  stripEmails: true,
  stripPhones: true,
  stripAddresses: true,
  stripAges: true,
  stripBirthdates: true,
  stripLocations: true,
  stripSchoolNames: true,
  stripCustomIds: true,
  logDetections: false, // Don't log PII even in dev
};

// ============================================
// PII Detection Patterns
// ============================================
const PII_PATTERNS: Record<PiiType, RegExp[]> = {
  // Names - common first names and name-like patterns
  name: [
    // "My name is X" patterns
    /\b(?:my name is|i'm|i am|call me|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    // "X said" or "X's" patterns with capital first letter
    /\b([A-Z][a-z]{2,15})(?:'s|')\b/g,
    // Direct name references (excluding common words)
    /\b(?:dear|hi|hello|hey)\s+([A-Z][a-z]+)/gi,
  ],

  email: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  ],

  phone: [
    // US phone formats
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    // International formats
    /\b\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g,
  ],

  address: [
    // Street addresses
    /\b\d{1,5}\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Circle|Cir|Place|Pl)\b\.?/gi,
    // Zip codes
    /\b\d{5}(?:-\d{4})?\b/g,
    // PO Boxes
    /\bP\.?O\.?\s*Box\s*\d+/gi,
  ],

  age: [
    // "I am X years old" patterns
    /\b(?:i am|i'm|he is|she is|my child is|my kid is)\s+(\d{1,2})\s+(?:years?\s+old|yo|y\.o\.)/gi,
    // "X-year-old" patterns
    /\b(\d{1,2})[-\s]?year[-\s]?old\b/gi,
    // Age declarations
    /\bage[:\s]+(\d{1,2})\b/gi,
  ],

  birthdate: [
    // MM/DD/YYYY or DD/MM/YYYY
    /\b(?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])[\/\-.](?:19|20)\d{2}\b/g,
    // YYYY-MM-DD (ISO format)
    /\b(?:19|20)\d{2}[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:0?[1-9]|[12]\d|3[01])\b/g,
    // Month DD, YYYY
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    // "born on" patterns
    /\bborn\s+(?:on\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}[\/\-.]\d{1,2})[,\s\d\/\-.]+/gi,
  ],

  location: [
    // City, State patterns
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g,
    // "I live in X" patterns
    /\b(?:i live in|from|located in|living in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  ],

  school: [
    // School name patterns
    /\b(?:[A-Z][a-z]+\s+)*(?:Elementary|Middle|High|Primary|Secondary|Academy|School|Preschool|Kindergarten|Daycare)\b/gi,
    // "I go to X school" patterns
    /\b(?:i go to|attend|enrolled at|student at)\s+([A-Za-z\s]+?)(?:\s+school|\s+academy)?(?:\.|,|\s|$)/gi,
  ],

  ssn: [
    // Social Security Numbers
    /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ],

  'ip-address': [
    // IPv4
    /\b(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  ],

  'url-with-pii': [
    // URLs with potential user info
    /https?:\/\/[^\s]+(?:user|profile|account|id)[^\s]*/gi,
  ],

  'custom-id': [
    // User IDs, student IDs, etc.
    /\b(?:user|student|player|account|id)[-_]?(?:id|number)?[:\s]+[A-Za-z0-9_-]+/gi,
  ],
};

// ============================================
// Replacement Tokens (Child-Friendly)
// ============================================
const REPLACEMENTS: Record<PiiType, string> = {
  name: '[FRIEND]',
  email: '[EMAIL]',
  phone: '[PHONE]',
  address: '[ADDRESS]',
  age: '[AGE]',
  birthdate: '[DATE]',
  location: '[PLACE]',
  school: '[SCHOOL]',
  ssn: '[ID]',
  'ip-address': '[NETWORK]',
  'url-with-pii': '[LINK]',
  'custom-id': '[ID]',
};

// ============================================
// Common Words to Exclude (False Positive Prevention)
// ============================================
const EXCLUDED_WORDS = new Set([
  // Character names in our app (these are okay)
  'brio', 'vowelia', 'diesel', 'zippy', 'scrambler',
  // Common words that might match name patterns
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out',
  // Game-related words
  'level', 'island', 'game', 'sound', 'letter', 'word', 'star', 'shard', 'kingdom',
  // Common nouns that could be mistaken for names
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
]);

// ============================================
// Core Anonymization Functions
// ============================================
function shouldAnonymize(type: PiiType, config: AnonymizationConfig): boolean {
  const mapping: Record<PiiType, keyof AnonymizationConfig> = {
    name: 'stripNames',
    email: 'stripEmails',
    phone: 'stripPhones',
    address: 'stripAddresses',
    age: 'stripAges',
    birthdate: 'stripBirthdates',
    location: 'stripLocations',
    school: 'stripSchoolNames',
    ssn: 'stripCustomIds', // Always strip SSN
    'ip-address': 'stripCustomIds',
    'url-with-pii': 'stripCustomIds',
    'custom-id': 'stripCustomIds',
  };

  return config[mapping[type]] as boolean;
}

function isExcludedWord(word: string): boolean {
  return EXCLUDED_WORDS.has(word.toLowerCase());
}

function detectAndReplace(
  text: string,
  type: PiiType,
  patterns: RegExp[],
  config: AnonymizationConfig
): { text: string; detections: PiiDetection[] } {
  if (!shouldAnonymize(type, config)) {
    return { text, detections: [] };
  }

  let result = text;
  const detections: PiiDetection[] = [];

  for (const pattern of patterns) {
    // Reset regex state
    pattern.lastIndex = 0;

    // Use Array.from for compatibility with ES5 target
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = Array.from(text.matchAll(regex));

    for (const match of matches) {
      const original = match[1] || match[0]; // Use capture group if available
      
      // Skip excluded words
      if (isExcludedWord(original)) continue;
      
      // Skip very short matches for names (likely false positives)
      if (type === 'name' && original.length < 3) continue;

      const replacement = REPLACEMENTS[type];
      const position = {
        start: match.index || 0,
        end: (match.index || 0) + match[0].length,
      };

      detections.push({
        type,
        original,
        replacement,
        position,
      });

      // Replace in result (be careful with multiple matches)
      result = result.replace(match[0], match[0].replace(original, replacement));
    }
  }

  return { text: result, detections };
}

// ============================================
// Main Service Export
// ============================================
export const anonymizationService = {
  /**
   * Anonymize text by stripping all PII
   * This is the main function to call before sending data to external APIs
   */
  anonymize: (text: string, customConfig?: Partial<AnonymizationConfig>): AnonymizationResult => {
    const config = { ...DEFAULT_CONFIG, ...customConfig };
    
    let result = text;
    const allDetections: PiiDetection[] = [];

    // Process each PII type in order of specificity (most specific first)
    const processingOrder: PiiType[] = [
      'email',
      'phone',
      'ssn',
      'ip-address',
      'url-with-pii',
      'birthdate',
      'address',
      'age',
      'school',
      'location',
      'custom-id',
      'name', // Names last (most likely false positives)
    ];

    for (const type of processingOrder) {
      const patterns = PII_PATTERNS[type];
      const { text: newText, detections } = detectAndReplace(result, type, patterns, config);
      result = newText;
      allDetections.push(...detections);
    }

    // Log detections if configured (for debugging, but never log actual PII)
    if (config.logDetections && allDetections.length > 0) {
      console.log('[AnonymizationService] PII detected and stripped:', 
        allDetections.map(d => ({ type: d.type, replacement: d.replacement }))
      );
    }

    return {
      anonymizedText: result,
      piiDetected: allDetections,
      wasModified: allDetections.length > 0,
    };
  },

  /**
   * Quick check if text contains any PII
   */
  containsPii: (text: string): boolean => {
    const { piiDetected } = anonymizationService.anonymize(text);
    return piiDetected.length > 0;
  },

  /**
   * Anonymize a structured object (for JSON payloads)
   */
  anonymizeObject: <T extends Record<string, unknown>>(
    obj: T,
    fieldsToAnonymize: (keyof T)[]
  ): T => {
    const result = { ...obj };

    for (const field of fieldsToAnonymize) {
      const value = result[field];
      if (typeof value === 'string') {
        const { anonymizedText } = anonymizationService.anonymize(value);
        (result as Record<string, unknown>)[field as string] = anonymizedText;
      }
    }

    return result;
  },

  /**
   * Anonymize API request payload before sending
   * Returns a clean copy safe for external transmission
   */
  sanitizeApiPayload: (payload: Record<string, unknown>): Record<string, unknown> => {
    const sensitiveFields = [
      'prompt', 'text', 'message', 'content', 'query',
      'input', 'userInput', 'feedback', 'comment', 'note',
      'context', 'description', 'narrative',
    ];

    const result = { ...payload };

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string' && sensitiveFields.includes(key.toLowerCase())) {
        const { anonymizedText } = anonymizationService.anonymize(value);
        result[key] = anonymizedText;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = anonymizationService.sanitizeApiPayload(value as Record<string, unknown>);
      }
    }

    return result;
  },

  /**
   * Get anonymization statistics for compliance reporting
   */
  getDetectionStats: (detections: PiiDetection[]): Record<PiiType, number> => {
    const stats: Record<PiiType, number> = {
      name: 0,
      email: 0,
      phone: 0,
      address: 0,
      age: 0,
      birthdate: 0,
      location: 0,
      school: 0,
      ssn: 0,
      'ip-address': 0,
      'url-with-pii': 0,
      'custom-id': 0,
    };

    for (const detection of detections) {
      stats[detection.type]++;
    }

    return stats;
  },
};

export default anonymizationService;
