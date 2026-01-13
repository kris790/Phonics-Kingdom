// Daily Challenge - Quick practice session
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, CHARACTERS } from '../../types';
import { audioService } from '../../services/audioService';

interface DailyChallengeProps {
  characterType: CharacterType;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

interface Challenge {
  id: string;
  type: 'match' | 'spell' | 'identify';
  prompt: string;
  options: string[];
  correctIndex: number;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'd1',
    type: 'identify',
    prompt: "Which word starts with 'B'?",
    options: ['Cat', 'Ball', 'Dog', 'Fish'],
    correctIndex: 1,
  },
  {
    id: 'd2',
    type: 'match',
    prompt: "Which word rhymes with 'cat'?",
    options: ['Dog', 'Hat', 'Cup', 'Tree'],
    correctIndex: 1,
  },
  {
    id: 'd3',
    type: 'spell',
    prompt: "What letter is missing? _at",
    options: ['B', 'C', 'D', 'F'],
    correctIndex: 1,
  },
  {
    id: 'd4',
    type: 'identify',
    prompt: "Which word has the long 'A' sound?",
    options: ['Cat', 'Cake', 'Can', 'Cap'],
    correctIndex: 1,
  },
  {
    id: 'd5',
    type: 'match',
    prompt: "Which is a sight word?",
    options: ['xyz', 'the', 'zyx', 'abc'],
    correctIndex: 1,
  },
];

const DailyChallenge: React.FC<DailyChallengeProps> = ({
  characterType,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const character = CHARACTERS[characterType];
  const challenge = DAILY_CHALLENGES[currentIndex];
  const progress = ((currentIndex) / DAILY_CHALLENGES.length) * 100;

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowFeedback(true);

    const isCorrect = index === challenge.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      audioService.play('/sounds/correct.mp3');
    } else {
      audioService.play('/sounds/incorrect.mp3');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (currentIndex < DAILY_CHALLENGES.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 1200);
  }, [selectedAnswer, challenge, currentIndex]);

  const finalStars = Math.ceil((score / DAILY_CHALLENGES.length) * 3);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Daily Challenge Complete!
          </h1>
          
          <p className="text-gray-500 mb-4">
            You got {score} out of {DAILY_CHALLENGES.length} correct!
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className={`text-4xl ${i < finalStars ? '' : 'opacity-30'}`}
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <button
            onClick={() => onComplete(finalStars)}
            className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition-colors"
          >
            Collect Stars! ✨
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="p-2 rounded-full bg-white/20 text-white"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
          <span>⭐</span>
          <span className="text-white font-bold">{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-white/20 rounded-full h-2 mb-6">
        <motion.div
          className="bg-white h-full rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Character */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: character.color }}
        >
          {characterType === 'brio' && '🦁'}
          {characterType === 'vowelia' && '🦉'}
          {characterType === 'diesel' && '🦊'}
          {characterType === 'zippy' && '🐰'}
        </div>
        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-lg">
          <p className="text-gray-800 font-medium">Daily Challenge!</p>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <p className="text-center text-gray-400 text-sm mb-2">
              {currentIndex + 1} of {DAILY_CHALLENGES.length}
            </p>
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {challenge.prompt}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {challenge.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === challenge.correctIndex;
              const showAsCorrect = showFeedback && isCorrect;
              const showAsWrong = showFeedback && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`
                    p-6 rounded-2xl text-xl font-bold transition-all
                    ${showAsCorrect ? 'bg-green-500 text-white' : ''}
                    ${showAsWrong ? 'bg-red-500 text-white' : ''}
                    ${!showFeedback ? 'bg-white text-gray-800 shadow-lg' : ''}
                    ${showFeedback && !isSelected && !isCorrect ? 'bg-white/50 text-gray-400' : ''}
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyChallenge;
