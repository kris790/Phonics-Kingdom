// Phonics Game Hook - Core game logic and state management
import { useCallback, useEffect, useRef, useState } from 'react';
import { Task, TaskResult, GameState, GameAction } from '../types';
import { geminiService } from '../services/geminiService';
import { telemetryService } from '../services/telemetryService';
import { audioService } from '../services/audioService';

interface UsePhonicsGameProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

interface UsePhonicsGameReturn {
  // Current task state
  currentTask: Task | null;
  taskIndex: number;
  totalTasks: number;
  
  // Session stats
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  
  // Actions
  startLevel: (islandId: string, levelId: string) => Promise<void>;
  submitAnswer: (answerId: string) => TaskResult;
  nextTask: () => void;
  endSession: () => void;
  
  // Helpers
  isCorrect: (answerId: string) => boolean;
  getHint: () => Promise<string>;
  
  // Loading states
  isLoadingTasks: boolean;
  isSessionActive: boolean;
}

export const usePhonicsGame = ({ state, dispatch }: UsePhonicsGameProps): UsePhonicsGameReturn => {
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const taskStartTimeRef = useRef<Date | null>(null);
  
  // Derived state
  const session = state.currentSession;
  const currentTask = session?.tasks[session.currentTaskIndex] || null;
  const taskIndex = session?.currentTaskIndex || 0;
  const totalTasks = session?.tasks.length || 0;
  
  const correctCount = session?.results.filter(r => r.correct).length || 0;
  const incorrectCount = session?.results.filter(r => !r.correct).length || 0;
  const accuracy = session?.results.length 
    ? Math.round((correctCount / session.results.length) * 100)
    : 0;

  // Reset task timer when task changes
  useEffect(() => {
    if (currentTask) {
      taskStartTimeRef.current = new Date();
      setCurrentAttempts(0);
    }
    // We only want to reset when task.id changes, not on every currentTask reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask?.id]);

  // Start a new level
  const startLevel = useCallback(async (islandId: string, levelId: string) => {
    setIsLoadingTasks(true);
    dispatch({ type: 'SET_LOADING', isLoading: true });

    try {
      // Generate tasks using Gemini or fallback
      const tasks = await geminiService.generateTasks(
        islandId,
        levelId,
        state.selectedCharacterId || 'brio',
        1
      );

      // Start telemetry session
      telemetryService.startSession(islandId, levelId);

      // Update state
      dispatch({
        type: 'START_LEVEL',
        levelId,
        tasks,
      });

    } catch (error) {
      console.error('Failed to start level:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load level. Please try again.' });
    } finally {
      setIsLoadingTasks(false);
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [state.selectedCharacterId, dispatch]);

  // Check if answer is correct
  const isCorrect = useCallback((answerId: string): boolean => {
    if (!currentTask) return false;
    const option = currentTask.options.find(o => o.id === answerId);
    return option?.isCorrect ?? false;
  }, [currentTask]);

  // Submit an answer
  const submitAnswer = useCallback((answerId: string): TaskResult => {
    // Gracefully handle missing task state instead of throwing
    if (!currentTask || !taskStartTimeRef.current) {
      console.warn('[usePhonicsGame] submitAnswer called with no active task');
      return {
        taskId: '',
        correct: false,
        attempts: 0,
        timeSpentMs: 0,
        timestamp: new Date(),
      };
    }

    const correct = isCorrect(answerId);
    const timeSpentMs = new Date().getTime() - taskStartTimeRef.current.getTime();
    
    setCurrentAttempts(prev => prev + 1);

    const result: TaskResult = {
      taskId: currentTask.id,
      correct,
      attempts: currentAttempts + 1,
      timeSpentMs,
      timestamp: new Date(),
    };

    // Play feedback sound
    if (correct) {
      audioService.playNotification('success');
    } else {
      audioService.playNotification('error');
    }

    // Only record result if correct or max attempts reached
    if (correct || currentAttempts >= 2) {
      telemetryService.recordTaskResult(result);
      dispatch({ type: 'SUBMIT_ANSWER', result });
    }

    return result;
  }, [currentTask, currentAttempts, isCorrect, dispatch]);

  // Move to next task
  const nextTask = useCallback(() => {
    if (!session) return;

    if (session.currentTaskIndex < session.tasks.length - 1) {
      dispatch({ type: 'NEXT_TASK' });
    } else {
      // Level complete
      const finalAccuracy = session.results.length > 0
        ? (session.results.filter(r => r.correct).length / session.results.length) * 100
        : 0;
      
      dispatch({ type: 'GAME_COMPLETE', accuracy: finalAccuracy });
    }
  }, [session, dispatch]);

  // End session early
  const endSession = useCallback(() => {
    telemetryService.endSession();
    dispatch({ type: 'RESET_SESSION' });
    dispatch({ type: 'NAVIGATE', view: 'magic-map' });
  }, [dispatch]);

  // Get hint for current task
  const getHint = useCallback(async (): Promise<string> => {
    if (!currentTask) return '';
    
    return geminiService.getAdaptiveHint(
      currentTask,
      currentAttempts,
      state.selectedCharacterId || 'brio'
    );
  }, [currentTask, currentAttempts, state.selectedCharacterId]);

  return {
    currentTask,
    taskIndex,
    totalTasks,
    correctCount,
    incorrectCount,
    accuracy,
    startLevel,
    submitAnswer,
    nextTask,
    endSession,
    isCorrect,
    getHint,
    isLoadingTasks,
    isSessionActive: session !== null && !session.isComplete,
  };
};
