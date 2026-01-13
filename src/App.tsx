// Phonics Kingdom - Main App with Centralized State Management
import React, { useReducer, useEffect, useCallback } from 'react';
import './App.css';
import { GameState, GameAction, LevelSession } from './types';
import { storageService } from './services/storageService';
import { telemetryService } from './services/telemetryService';
import { dummyDataService } from './services/dummyDataService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CharacterSelectorModal } from './components/CharacterSelectorModal';
import { MagicMap } from './components/MagicMap';
import { GameEngine } from './components/GameEngine';
import { ParentHub } from './components/ParentHub';

// Seed dummy data on first load (for demo/testing)
// This only runs once if no data exists
dummyDataService.seedIfEmpty();

// ============================================
// App Reducer - Centralized State Management
// ============================================
const appReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_CHARACTER':
      return {
        ...state,
        selectedCharacterId: action.characterId,
      };

    case 'NAVIGATE':
      console.log('🚀 Reducer: NAVIGATE ->', action.view);
      return {
        ...state,
        view: action.view,
        error: null,
      };

    case 'SELECT_ISLAND':
      console.log('🎯 Reducer: SELECT_ISLAND ->', action.islandId);
      return {
        ...state,
        currentIslandId: action.islandId,
      };

    case 'START_LEVEL': {
      console.log('🎮 Reducer: START_LEVEL ->', action.levelId, 'Tasks:', action.tasks?.length);
      const session: LevelSession = {
        levelId: action.levelId,
        tasks: action.tasks,
        currentTaskIndex: 0,
        results: [],
        startTime: new Date(),
        isComplete: false,
      };
      return {
        ...state,
        currentSession: session,
        view: 'game',
      };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          results: [...state.currentSession.results, action.result],
        },
      };
    }

    case 'NEXT_TASK': {
      if (!state.currentSession) return state;
      
      const nextIndex = state.currentSession.currentTaskIndex + 1;
      const isComplete = nextIndex >= state.currentSession.tasks.length;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentTaskIndex: nextIndex,
          isComplete,
        },
      };
    }

    case 'GAME_COMPLETE': {
      if (!state.currentSession || !state.currentIslandId) return state;
      
      // Calculate stars earned (1-3 based on accuracy)
      const starsEarned = action.accuracy >= 85 ? 3 : action.accuracy >= 60 ? 2 : action.accuracy >= 40 ? 1 : 0;
      
      // Update island progress
      const currentProgress = state.islandProgress[state.currentIslandId] || {
        islandId: state.currentIslandId,
        completedLevels: 0,
        totalLevels: 5,
        masteryDays: [],
        hasShard: false,
      };

      // Only increment completed levels if accuracy >= 85%
      const newCompletedLevels = action.accuracy >= 85
        ? Math.min(currentProgress.completedLevels + 1, currentProgress.totalLevels)
        : currentProgress.completedLevels;

      // End telemetry session
      telemetryService.endSession();

      return {
        ...state,
        totalStars: state.totalStars + starsEarned,
        islandProgress: {
          ...state.islandProgress,
          [state.currentIslandId]: {
            ...currentProgress,
            completedLevels: newCompletedLevels,
          },
        },
        currentSession: {
          ...state.currentSession,
          isComplete: true,
        },
      };
    }

    case 'TOGGLE_AUDIO':
      return {
        ...state,
        audioEnabled: !state.audioEnabled,
      };

    case 'SET_INSTRUCTION_SPEED':
      return {
        ...state,
        instructionSpeed: action.speed,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state,
      };

    case 'RESET_SESSION':
      return {
        ...state,
        currentSession: null,
        currentIslandId: null,
      };

    case 'REPLAY_LEVEL':
      // Reset session but keep currentIslandId to trigger auto-start
      return {
        ...state,
        currentSession: null,
      };

    default:
      return state;
  }
};

// ============================================
// Main App Component
// ============================================
function App() {
  // Initialize state from storage
  const [state, dispatch] = useReducer(appReducer, storageService.getInitialState());

  // Persist state changes to storage
  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  // Handle starting a level
  const handleStartLevel = useCallback(async (islandId: string, levelId: string) => {
    // Note: Task generation is handled by usePhonicsGame hook
    // This is just a callback for when a level is selected
  }, []);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId: string) => {
    // Already dispatched in CharacterSelectorModal
  }, []);

  // Render current view
  const renderView = () => {
    switch (state.view) {
      case 'character-select':
        return (
          <CharacterSelectorModal
            isOpen={true}
            onSelect={handleCharacterSelect}
            dispatch={dispatch}
          />
        );

      case 'magic-map':
        return (
          <MagicMap
            state={state}
            dispatch={dispatch}
            onStartLevel={handleStartLevel}
          />
        );

      case 'game':
        return (
          <GameEngine
            state={state}
            dispatch={dispatch}
          />
        );

      case 'parent-hub':
        return (
          <ParentHub
            state={state}
            dispatch={dispatch}
          />
        );

      case 'settings':
        // Settings is embedded in ParentHub for now
        return (
          <ParentHub
            state={state}
            dispatch={dispatch}
          />
        );

      default:
        return (
          <CharacterSelectorModal
            isOpen={true}
            onSelect={handleCharacterSelect}
            dispatch={dispatch}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {renderView()}
        
        {/* Loading overlay */}
        {state.isLoading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="animate-spin w-10 h-10 border-4 border-vowelia-purple border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading magic...</p>
            </div>
          </div>
        )}

        {/* Error toast */}
        {state.error && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-500 text-white p-4 rounded-xl shadow-lg z-50">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium">Something went wrong</p>
                <p className="text-sm opacity-90">{state.error}</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_ERROR', error: null })}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
