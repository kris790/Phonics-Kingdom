// Level Complete Component
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Character } from '../../types';
import { haptics } from '../../services/nativeService';

interface LevelCompleteProps {
  accuracy: number;
  totalTasks: number;
  correctCount: number;
  character: Character;
  onContinue: () => void;
  onReplay: () => void;
}

export const LevelComplete: React.FC<LevelCompleteProps> = ({
  accuracy,
  totalTasks,
  correctCount,
  character,
  onContinue,
  onReplay,
}) => {
  const stars = accuracy >= 85 ? 3 : accuracy >= 60 ? 2 : accuracy >= 40 ? 1 : 0;
  const isPassing = accuracy >= 85;

  // Celebrate with haptic feedback on level complete
  useEffect(() => {
    if (isPassing) {
      haptics.celebrate();
    } else {
      haptics.tap();
    }
  }, [isPassing]);

  // Haptic feedback for buttons
  const handleReplay = () => {
    haptics.tap();
    onReplay();
  };

  const handleContinue = () => {
    haptics.success();
    onContinue();
  };

  return (
    <div className="min-h-screen bg-kingdom-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: star <= stars ? 1 : 0.5, rotate: 0 }}
              transition={{ delay: star * 0.2, type: 'spring' }}
              className={`text-5xl ${star <= stars ? '' : 'grayscale opacity-30'}`}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-3xl font-bold mb-2 ${
            isPassing ? 'text-green-600' : 'text-orange-600'
          }`}
        >
          {isPassing ? 'Level Complete!' : 'Good Effort!'}
        </motion.h1>

        {/* Character message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl"
            style={{ backgroundColor: character.color }}
          >
            {character.id === 'brio' && '🦁'}
            {character.id === 'vowelia' && '🦉'}
            {character.id === 'diesel' && '🦊'}
            {character.id === 'zippy' && '🐰'}
          </div>
          <p className="text-gray-600 italic">
            "{isPassing ? character.catchphrase : 'Keep practicing, you\'re getting better!'}"
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-vowelia-purple">{accuracy}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-brio-teal">{correctCount}/{totalTasks}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
        </motion.div>

        {/* Mastery Progress (if applicable) */}
        {isPassing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-6 p-4 bg-purple-50 rounded-xl"
          >
            <div className="flex items-center justify-center gap-2 text-vowelia-purple">
              <span className="text-xl">👑</span>
              <span className="font-medium">Mastery Progress: 1/3 days</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Pass 3 different days to earn a King Shard!
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4"
        >
          <button
            onClick={handleReplay}
            className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-brio-teal to-vowelia-purple text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
