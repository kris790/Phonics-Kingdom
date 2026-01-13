# Phonics Kingdom: Technical Architecture

## 1. System Overview
Phonics Kingdom is a React-based Progressive Web App (PWA) designed for a "Stealth Learning" experience. It utilizes a modular architecture to separate pedagogical logic from AI content generation.

## 2. Core Modules

### A. State Management (`App.tsx` & `appReducer`)
- **Pattern:** Centralized state with `useReducer`.
- **Data Flow:** Unidirectional. Actions (e.g., `GAME_COMPLETE`) update the global state, which then persists to `LocalStorage` via the `storageService`.
- **Mastery Calculation:**
  - Accuracy >= 85% = Pass.
  - 3 Passes across different calendar days = Mastery (King Shard).

### B. The Intelligence Layer (`GeminiService.ts`)
The app utilizes a fleet of Gemini models:
| Task | Model | Config |
| :--- | :--- | :--- |
| **Narrative Generation** | `gemini-3-pro-preview` | `thinkingBudget: 2048` |
| **Phonics Task Logic** | `gemini-3-flash-preview` | `responseMimeType: application/json` |
| **Task Visuals** | `gemini-2.5-flash-image` | `aspectRatio: 1:1` |
| **Character Voice** | `gemini-2.5-flash-preview-tts` | `voiceConfig: Kore/Puck/Zephyr` |
| **Voice Lab/Nav** | `gemini-2.5-flash-native-audio-preview-12-2025` | `Modality.AUDIO` |

### C. Game Engine Orchestration
- **Dynamic Routing:** `GameModeRouter` determines the UI layout based on the AI-generated `TaskType`.
- **Adaptive Scaffolding:** `useAudioEngine` and `useAdaptiveAI` work together to slow down instruction speed and provide simplified prompts if the student struggles.

## 3. Data Pipeline
1. **User Request:** Child selects an island on the `MagicMap`.
2. **Task Hydration:** 
   - Check cache/local storage for fallback tasks.
   - Request `gemini-3-flash-preview` to generate 5 level-appropriate tasks in character voice.
3. **Asset Generation:** Parallel requests for `Image` and `TTS` assets for the current task.
4. **Interactive Turn:** Child interacts (Voice, Touch, or Drag).
5. **Feedback Loop:** Local validation (Multiple Choice) or AI validation (Voice Lab).
6. **Persistence:** `TelemetryService` logs accuracy for parent analytics.

## 4. Resilience & Performance
- **TTS Caching:** Common character phrases (e.g., "Sparkling Success!") are stored in a `Map` to avoid redundant API calls.
- **Offline Logic:** The app is fully functional offline using `wordBank.ts` as a local data source.
- **Circuit Breaker:** `audioService.stop()` acts as a global kill-switch to prevent audio overlaps during view transitions.