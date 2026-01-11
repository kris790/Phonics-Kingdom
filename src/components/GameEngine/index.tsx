// GameEngine - Main game component with task handling
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, GameAction, CHARACTERS } from '../../types';
import { usePhonicsGame } from '../../hooks/usePhonicsGame';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useAdaptiveAI } from '../../hooks/useAdaptiveAI';
import { GameModeRouter } from './GameModeRouter';
import { TaskProgress } from './TaskProgress';
import { FeedbackOverlay } from './FeedbackOverlay';
import { LevelComplete } from './LevelComplete';

interface GameEngineProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameEngine: React.FC<GameEngineProps> = ({ state, dispatch }) => {
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const isStartingLevelRef = useRef(false);

  const {
    currentTask,
    taskIndex,
    totalTasks,
    accuracy,
    submitAnswer,
    nextTask,
    endSession,
    getHint,
    startLevel,
    isLoadingTasks,
  } = usePhonicsGame({ state, dispatch });

  const character = CHARACTERS[state.selectedCharacterId || 'brio'];

  const { speak, playPhrase, stop, isSpeaking } = useAudioEngine({
    characterId: state.selectedCharacterId || 'brio',
    speed: state.instructionSpeed,
    enabled: state.audioEnabled,
  });

  const {
    adaptiveState,
    recordResult,
    shouldProvideHint,
    getEncouragement,
  } = useAdaptiveAI();

  // Auto-start level when GameEngine mounts with an island selected but no session
  useEffect(() => {
    if (state.currentIslandId && !state.currentSession && !isLoadingTasks && !isStartingLevelRef.current) {
      isStartingLevelRef.current = true;
      const islandId = state.currentIslandId;
      const progress = state.islandProgress[islandId];
      const completedLevels = progress?.completedLevels || 0;
      const nextLevel = Math.min(completedLevels + 1, 5);
      const levelId = `${islandId}-level-${nextLevel}`;
      startLevel(islandId, levelId).finally(() => {
        isStartingLevelRef.current = false;
      });
    }
  }, [state.currentIslandId, state.currentSession, isLoadingTasks, state.islandProgress, startLevel]);

  // Speak instruction when task changes
  useEffect(() => {
    if (currentTask && state.audioEnabled) {
      speak(currentTask.instruction);
    }
    setHint(null);
    setAttempts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask?.id, state.audioEnabled]);

  // Handle answer submission
  const handleAnswer = useCallback(async (answerId: string) => {
    if (!currentTask || showFeedback) return;

    const result = submitAnswer(answerId);
    recordResult(result);
    setAttempts(prev => prev + 1);

    if (result.correct) {
      setShowFeedback('correct');
      await playPhrase('correct');
      
      // Auto advance after delay
      setTimeout(() => {
        setShowFeedback(null);
        nextTask();
      }, 1500);
    } else {
      setShowFeedback('incorrect');
      
      // Check if hint should be shown
      if (shouldProvideHint(attempts + 1)) {
        const newHint = await getHint();
        setHint(newHint);
      }
      
      // Reset feedback after delay
      setTimeout(() => {
        setShowFeedback(null);
      }, 1000);
    }
  }, [currentTask, showFeedback, submitAnswer, recordResult, attempts, shouldProvideHint, getHint, nextTask, playPhrase]);

  // Handle exit
  const handleExit = useCallback(() => {
    stop();
    endSession();
  }, [stop, endSession]);

  // Show level complete screen
  if (state.currentSession?.isComplete) {
    return (
      <LevelComplete
        accuracy={accuracy}
        totalTasks={totalTasks}
        correctCount={state.currentSession.results.filter(r => r.correct).length}
        character={character}
        onContinue={() => {
          dispatch({ type: 'RESET_SESSION' });
          dispatch({ type: 'NAVIGATE', view: 'magic-map' });
        }}
        onReplay={() => {
          dispatch({ type: 'REPLAY_LEVEL' });
        }}
      />
    );
  }

  // Loading state
  if (!currentTask || isLoadingTasks) {
    return (
      <div className="min-h-screen bg-kingdom-bg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-vowelia-purple border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kingdom-bg relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleExit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Exit game"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <TaskProgress
            current={taskIndex + 1}
            total={totalTasks}
            accuracy={accuracy}
          />

          <button
            onClick={() => speak(currentTask.instruction)}
            disabled={isSpeaking}
            className={`p-2 rounded-lg transition-colors ${
              isSpeaking ? 'bg-vowelia-purple text-white' : 'hover:bg-gray-100'
            }`}
            aria-label="Repeat instruction"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Character Guide */}
      <div className="absolute top-24 left-4 z-10">
        <motion.div
          animate={adaptiveState.encouragementNeeded ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: adaptiveState.encouragementNeeded ? 3 : 0 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg`}
          style={{ backgroundColor: character.color } as React.CSSProperties}
        >
          {character.id === 'brio' && '🦁'}
          {character.id === 'vowelia' && '🦉'}
          {character.id === 'diesel' && '🦊'}
          {character.id === 'zippy' && '🐰'}
        </motion.div>
      </div>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Instruction - hide for tasks that handle their own display */}
            {!['letter-sound', 'sound-match', 'rhyme-time', 'word-complete', 'word-builder', 'letter-trace', 'skyfall-shooter'].includes(currentTask.type) && (
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {currentTask.instruction}
                </h2>
                {currentTask.prompt && (
                  <p className="text-lg text-gray-600">
                    {currentTask.prompt}
                  </p>
                )}
              </div>
            )}

            {/* Task Content */}
            <GameModeRouter
              task={currentTask}
              onAnswer={handleAnswer}
              disabled={showFeedback !== null}
            />

            {/* Hint */}
            <AnimatePresence>
              {hint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
                >
                  <span className="text-yellow-800">💡 {hint}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={showFeedback}
        encouragement={showFeedback === 'incorrect' ? getEncouragement() : undefined}
      />
    </div>
  );
};

export default GameEngine;
