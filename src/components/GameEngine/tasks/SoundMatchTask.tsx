// Sound Match Task - Match words with same starting sound (Assessment-First)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../../types';
import { getWordPicture } from '../../../data/wordPictures';

interface SoundMatchTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

type TaskPhase = 'assessment' | 'feedback';

export const SoundMatchTask: React.FC<SoundMatchTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [phase, setPhase] = useState<TaskPhase>('assessment');
  const [selectedOption, setSelectedOption] = useState<{ id: string; text: string; isCorrect: boolean } | null>(null);

  // Extract the reference word from the prompt (e.g., 'Find another word that starts like "cat"')
  const wordMatch = task.prompt.match(/"([^"]+)"/);
  const referenceWord = wordMatch ? wordMatch[1] : task.targetPhoneme;
  const startingSound = referenceWord[0].toUpperCase();
  const referenceEmoji = getWordPicture(referenceWord);

  const handleAnswer = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (disabled || phase === 'feedback') return;
    
    setSelectedOption(option);
    setPhase('feedback');
    
    setTimeout(() => {
      onAnswer(option.id);
    }, 2500);
  };

  return (
    <div className="text-center">
      {/* Source word display with picture - DON'T show the phoneme */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="inline-block bg-gradient-to-br from-zippy-red to-pink-500 p-6 rounded-3xl shadow-lg">
          <div className="text-white text-lg mb-2">Which word starts with the same sound as:</div>
          {/* Picture of the reference word */}
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl block mb-2"
          >
            {referenceEmoji}
          </motion.span>
          <span className="text-3xl font-bold text-white block">
            {referenceWord}
          </span>
          {/* DON'T show the phoneme here - that's giving away the answer! */}
        </div>
      </motion.div>

      {/* Feedback display */}
      {phase === 'feedback' && selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-2xl ${selectedOption.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
        >
          {selectedOption.isCorrect ? (
            <p className="text-xl font-bold text-green-700">
              🎉 Great! Both words start with the <span className="text-2xl">/{startingSound.toLowerCase()}/</span> sound!
            </p>
          ) : (
            <div className="text-amber-800">
              <p className="text-lg font-medium">
                "{referenceWord}" starts with <span className="font-bold">/{startingSound.toLowerCase()}/</span>.
              </p>
              <p className="text-lg">
                Look for another word that starts with <span className="font-bold">/{startingSound.toLowerCase()}/</span>!
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Sound wave animation */}
      <motion.div
        className="flex justify-center gap-1 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 bg-zippy-red rounded-full"
            animate={{
              height: [20, 40, 20],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Word options with pictures */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        {task.options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = phase === 'feedback' && option.isCorrect;
          const showWrong = phase === 'feedback' && isSelected && !option.isCorrect;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleAnswer(option)}
              disabled={disabled || phase === 'feedback'}
              className={`
                p-6 rounded-2xl transition-all
                ${showCorrect 
                  ? 'bg-green-100 border-4 border-green-500 scale-105' 
                  : showWrong 
                    ? 'bg-red-100 border-4 border-red-400' 
                    : 'bg-white border-2 border-gray-200 hover:border-zippy-red hover:shadow-lg'
                }
                ${phase === 'feedback' && !showCorrect && !showWrong ? 'opacity-40' : ''}
                disabled:cursor-not-allowed
              `}
              whileHover={phase === 'assessment' ? { scale: 1.05 } : {}}
              whileTap={phase === 'assessment' ? { scale: 0.95 } : {}}
            >
              <div className="text-5xl mb-2">
                {getWordPicture(option.text)}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {option.text}
              </div>
              {showCorrect && <span className="text-green-600 text-lg">✓ Same sound!</span>}
              {showWrong && <span className="text-red-600 text-lg">✗ Different sound</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
