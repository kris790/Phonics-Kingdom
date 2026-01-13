# Edge Case Testing Guide for Phonics Kingdom

This document outlines project-specific edge cases and testing strategies for the Phonics Kingdom app.

## Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- --testPathPattern="storageService"
```

## Test Utilities

Import edge case helpers from `src/test-utils/edgeCases.ts`:

```typescript
import {
  FALSY_VALUES,
  STRING_BOUNDARIES,
  ALL_PHONEMES,
  createFailingPromise,
  createMockStorage,
} from '../test-utils/edgeCases';
```

---

## Project-Specific Edge Cases

### 1. Phonics Data

| Category | Edge Cases |
|----------|------------|
| Phonemes | All 44 phonemes, invalid phonemes, empty strings |
| Graphemes | Multi-char ('ough'), single char, silent letters |
| Words | CVC words, blends, digraphs, sight words |

**Test Examples:**
```typescript
// Edge cases: null input, max size
test('handles all 44 phonemes', () => {
  ALL_PHONEMES.forEach(phoneme => {
    expect(() => processPhoneme(phoneme)).not.toThrow();
  });
});

test('handles invalid phoneme gracefully', () => {
  expect(processPhoneme('xyz')).toEqual({ valid: false });
  expect(processPhoneme('')).toEqual({ valid: false });
  expect(processPhoneme(null)).toEqual({ valid: false });
});
```

### 2. Player Progress & Storage

| Category | Edge Cases |
|----------|------------|
| New Player | Zero progress, no sessions, empty arrays |
| Max Player | MAX_SAFE_INTEGER score, all phonemes mastered |
| Storage | Full localStorage, private browsing, corrupted data |

**Test Examples:**
```typescript
import { createMockStorage, createBlockedStorage } from '../test-utils/edgeCases';

test('handles localStorage quota exceeded', () => {
  const fullStorage = createMockStorage(true);
  expect(() => saveProgress(fullStorage, data)).not.toThrow();
});

test('handles private browsing mode', () => {
  const blockedStorage = createBlockedStorage();
  expect(() => loadProgress(blockedStorage)).not.toThrow();
});
```

### 3. Audio Service

| Category | Edge Cases |
|----------|------------|
| Missing Files | Audio file 404, network timeout |
| Playback | Rapid play/stop, multiple sounds, interrupted |
| TTS | Unsupported phoneme, long text, special chars |

**Test Examples:**
```typescript
test('handles missing audio file', async () => {
  const result = await audioService.playSound('nonexistent.mp3');
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});

test('handles rapid play/stop', async () => {
  await simulateRapidClicks(() => audioService.playSound('a.mp3'), 10);
  // Should not crash or throw
});
```

### 4. AI/Gemini Service

| Category | Edge Cases |
|----------|------------|
| Network | Offline, timeout, rate limit |
| Prompts | Empty, too long, PII in content |
| Responses | Invalid JSON, empty, unexpected format |

**Test Examples:**
```typescript
test('handles AI timeout', async () => {
  jest.spyOn(global, 'fetch').mockImplementation(() => 
    createTimeoutPromise(fetch('...'), 5000)
  );
  
  const result = await geminiService.generateResponse('test');
  expect(result).toContain('offline'); // Fallback message
});

test('anonymizes PII before sending', async () => {
  const prompt = 'My name is John and I live at 123 Main St';
  await geminiService.generateResponse(prompt);
  
  expect(sentPrompt).not.toContain('John');
  expect(sentPrompt).not.toContain('123 Main St');
});
```

### 5. Game Engine

| Category | Edge Cases |
|----------|------------|
| Scoring | Zero, negative (shouldn't happen), overflow |
| Navigation | Deep links, back button, interrupted session |
| State | Race conditions, rapid mode switching |

**Test Examples:**
```typescript
test('handles max score overflow', () => {
  const score = calculateScore(Number.MAX_SAFE_INTEGER, 100);
  expect(score).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
});

test('handles rapid game mode switching', async () => {
  await simulateRapidClicks(() => switchMode('next'), 5);
  expect(currentMode).toBeDefined();
  expect(errors).toHaveLength(0);
});
```

### 6. React Components

| Category | Edge Cases |
|----------|------------|
| Props | Missing optional, null children, empty arrays |
| Events | Double-click, keyboard, touch |
| Lifecycle | Unmount during async, rapid mount/unmount |

**Test Examples:**
```typescript
test('renders with missing optional props', () => {
  render(<GameCard />); // No props
  expect(screen.getByRole('article')).toBeInTheDocument();
});

test('handles unmount during async operation', async () => {
  const { unmount } = render(<AsyncComponent />);
  unmount();
  // Should not throw or log errors
  await new Promise(r => setTimeout(r, 100));
});
```

---

## CI/CD Integration

### GitHub Actions

The workflow at `.github/workflows/test.yml` runs:
1. Tests on Node 18.x and 20.x
2. Coverage report generation
3. Edge case audit on PRs

### Coverage Thresholds

Current targets:
- Statements: 50% (warning below)
- Edge case paths: Best effort

### PR Checklist

Every PR must complete the edge case checklist in `.github/pull_request_template.md`.

---

## Adding New Tests

### 1. Create test file next to source

```
src/services/myService.ts
src/services/myService.test.ts  ← Add here
```

### 2. Import edge case utilities

```typescript
import {
  nullVariants,
  STRING_BOUNDARIES,
  createFailingPromise,
} from '../test-utils/edgeCases';
```

### 3. Structure tests by edge category

```typescript
describe('myService', () => {
  describe('happy path', () => { /* ... */ });
  
  describe('edge cases', () => {
    describe('null/undefined inputs', () => { /* ... */ });
    describe('boundary values', () => { /* ... */ });
    describe('async failures', () => { /* ... */ });
  });
});
```

---

## Quick Reference

### Common Edge Cases by Type

| Type | Test Values |
|------|-------------|
| string | `''`, `'a'`, `'a'.repeat(256)`, `'🦁'` |
| number | `0`, `1`, `-1`, `NaN`, `Infinity`, `MAX_SAFE_INTEGER` |
| array | `[]`, `[1]`, `Array(1000)` |
| object | `{}`, `null`, `undefined` |
| async | timeout, reject, network error |

### COPPA/Child Safety Edge Cases

Always test:
- [ ] No PII in error messages
- [ ] No PII in logs (even in dev)
- [ ] Graceful fallback for all AI features
- [ ] Age-appropriate fallback content

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check for Property Testing](https://github.com/dubzzz/fast-check)
