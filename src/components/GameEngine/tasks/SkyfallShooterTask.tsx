// Skyfall Shooter Task - Shoot falling letters that match the target sound
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../types';
import { getLetterPicture } from '../../../data/wordPictures';

interface FallingLetter {
  id: string;
  letter: string;
  x: number;
  y: number;
  speed: number;
  isCorrect: boolean;
}

interface SkyfallShooterTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

export const SkyfallShooterTask: React.FC<SkyfallShooterTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [score, setScore] = useState(0);
  const [targetHits, setTargetHits] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number }[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetLetter = task.targetPhoneme.toUpperCase();
  const targetPicture = getLetterPicture(targetLetter);
  const requiredHits = 3;

  // Show temporary feedback message
  const showFeedback = useCallback((text: string, isCorrect: boolean) => {
    setFeedbackMessage({ text, isCorrect });
    setTimeout(() => setFeedbackMessage(null), 800);
  }, []);

  // Generate random letters including the target
  const generateLetter = useCallback(() => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const isTarget = Math.random() < 0.4; // 40% chance of target letter
    const letter = isTarget ? targetLetter : allLetters[Math.floor(Math.random() * allLetters.length)];
    
    return {
      id: `${Date.now()}-${Math.random()}`,
      letter,
      x: Math.random() * 80 + 10, // 10-90% of width
      y: -10,
      speed: 0.5 + Math.random() * 0.5,
      isCorrect: letter === targetLetter,
    };
  }, [targetLetter]);

  // Game loop
  useEffect(() => {
    if (disabled || gameOver) return;

    // Spawn letters
    const spawnInterval = setInterval(() => {
      setFallingLetters(prev => [...prev, generateLetter()]);
    }, 1500);

    // Move letters down
    const moveInterval = setInterval(() => {
      setFallingLetters(prev => {
        const updated = prev
          .map(letter => ({ ...letter, y: letter.y + letter.speed }))
          .filter(letter => letter.y < 100); // Remove letters that fell off screen
        return updated;
      });
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [disabled, gameOver, generateLetter]);

  // Check for win condition
  useEffect(() => {
    if (targetHits >= requiredHits && !gameOver) {
      setGameOver(true);
      // Find correct option and submit
      const correctOption = task.options.find(o => o.isCorrect);
      setTimeout(() => {
        onAnswer(correctOption?.id || '1');
      }, 500);
    }
  }, [targetHits, gameOver, task.options, onAnswer]);

  // Handle letter click/tap
  const handleLetterClick = useCallback((letter: FallingLetter) => {
    if (disabled || gameOver) return;

    // Add explosion effect
    setExplosions(prev => [...prev, { id: letter.id, x: letter.x, y: letter.y }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== letter.id));
    }, 500);

    // Remove the letter
    setFallingLetters(prev => prev.filter(l => l.id !== letter.id));

    if (letter.isCorrect) {
      setScore(prev => prev + 10);
      setTargetHits(prev => prev + 1);
      showFeedback(`Yes! /${targetLetter.toLowerCase()}/ sound!`, true);
    } else {
      setScore(prev => Math.max(0, prev - 5));
      showFeedback(`That's /${letter.letter.toLowerCase()}/`, false);
    }
  }, [disabled, gameOver, showFeedback, targetLetter]);

  return (
    <div className="text-center">
      {/* Target indicator with picture */}
      <div className="mb-4 flex items-center justify-center gap-4 flex-wrap">
        <div className="bg-gradient-to-r from-brio-teal to-vowelia-purple px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
          <span className="text-white font-bold">Tap the /{targetLetter.toLowerCase()}/ sound!</span>
          <span className="text-4xl">{targetPicture.emoji}</span>
          <span className="text-white/80 text-sm">({targetPicture.word})</span>
        </div>
        <div className="bg-yellow-100 px-4 py-2 rounded-full">
          <span className="text-yellow-700 font-bold">⭐ {score}</span>
        </div>
        <div className="bg-purple-100 px-4 py-2 rounded-full">
          <span className="text-purple-700 font-bold">{targetHits}/{requiredHits} 🎯</span>
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Feedback message overlay */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full font-bold text-lg shadow-lg ${
                feedbackMessage.isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-400 text-white'
              }`}
            >
              {feedbackMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stars background */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
          />
        ))}

        {/* Falling letters - DON'T color-code correct vs wrong! */}
        <AnimatePresence>
          {fallingLetters.map(letter => {
            const letterPic = getLetterPicture(letter.letter);
            return (
              <motion.button
                key={letter.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleLetterClick(letter)}
                disabled={disabled}
                className="absolute w-14 h-14 rounded-full font-bold text-xl flex flex-col items-center justify-center shadow-lg cursor-pointer transform -translate-x-1/2 bg-gradient-to-br from-white to-gray-100 text-gray-800 hover:from-yellow-100 hover:to-yellow-200"
                style={{
                  position: 'absolute',
                  left: `${letter.x}%`,
                  top: `${letter.y}%`,
                } as React.CSSProperties}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <span className="text-2xl leading-none">{letterPic.emoji}</span>
                <span className="text-xs font-bold">{letter.letter}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(explosion => (
            <motion.div
              key={explosion.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute w-16 h-16 pointer-events-none"
              style={{
                position: 'absolute',
                left: `${explosion.x}%`,
                top: `${explosion.y}%`,
                transform: 'translate(-50%, -50%)',
              } as React.CSSProperties}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Win overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-white"
            >
              🎉 Great Job! 🎉
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <p className="mt-4 text-gray-500 text-sm">
        Tap the letters that match the target sound! Avoid the wrong ones!
      </p>
    </div>
  );
};
