// Word Complete Task - Fill in the missing sound/letter to complete the word
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../types';
import { getWordPicture } from '../../../data/wordPictures';

interface WordCompleteTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

export const WordCompleteTask: React.FC<WordCompleteTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Parse the word to find the blank position
  // The prompt format: 'Complete the word: c_t' or similar
  const wordMatch = task.prompt.match(/[a-zA-Z_]+/g);
  const incompleteWord = wordMatch ? wordMatch[wordMatch.length - 1] : '_at';
  const blankIndex = incompleteWord.indexOf('_');
  
  // Get the full correct word
  const correctWord = task.correctAnswer;
  const missingLetter = blankIndex >= 0 && blankIndex < correctWord.length 
    ? correctWord[blankIndex].toUpperCase() 
    : correctWord[0].toUpperCase();

  // Get emoji for the word
  const wordEmoji = getWordPicture(correctWord);

  const handleLetterSelect = useCallback((letter: string, optionId: string) => {
    if (disabled || showResult) return;
    
    setSelectedLetter(letter);
    setShowResult(true);

    // Check if correct
    const isCorrect = letter.toUpperCase() === missingLetter;
    
    setTimeout(() => {
      onAnswer(isCorrect ? optionId : 'wrong');
    }, 1000);
  }, [disabled, showResult, missingLetter, onAnswer]);

  return (
    <div className="text-center max-w-xl mx-auto">
      {/* Visual hint - picture */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6"
      >
        <div className="inline-block bg-gradient-to-br from-diesel-yellow/20 to-orange-100 p-6 rounded-2xl">
          <motion.span 
            className="text-8xl block"
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            {wordEmoji}
          </motion.span>
          <p className="text-gray-600 mt-2">What sound is missing?</p>
        </div>
      </motion.div>

      {/* Word display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="inline-flex gap-2 bg-white rounded-2xl p-6 shadow-lg">
          {incompleteWord.split('').map((char, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-16 h-20 rounded-xl flex items-center justify-center text-4xl font-bold border-4 ${
                char === '_'
                  ? selectedLetter
                    ? showResult && selectedLetter.toUpperCase() === missingLetter
                      ? 'bg-green-100 border-green-400 text-green-600'
                      : showResult
                      ? 'bg-red-100 border-red-400 text-red-600'
                      : 'bg-vowelia-purple/20 border-vowelia-purple text-vowelia-purple'
                    : 'bg-gray-100 border-dashed border-gray-300 text-gray-400 animate-pulse'
                  : 'bg-brio-teal/10 border-brio-teal/30 text-gray-800'
              }`}
            >
              {char === '_' ? (selectedLetter || '?') : char.toUpperCase()}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Letter options */}
      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {task.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => handleLetterSelect(option.text, option.id)}
              disabled={disabled || showResult}
              className={`w-16 h-16 rounded-xl text-3xl font-bold shadow-lg transition-all ${
                selectedLetter === option.text
                  ? showResult && option.isCorrect
                    ? 'bg-green-500 text-white scale-110'
                    : showResult && !option.isCorrect
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-vowelia-purple text-white'
                  : 'bg-white border-2 border-gray-200 hover:border-vowelia-purple hover:shadow-xl disabled:opacity-50'
              }`}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
              {option.text.toUpperCase()}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <p className={`text-xl font-bold ${
              selectedLetter?.toUpperCase() === missingLetter ? 'text-green-600' : 'text-orange-600'
            }`}>
              {selectedLetter?.toUpperCase() === missingLetter 
                ? `Yes! The word is "${correctWord}"! 🎉`
                : `The missing letter is "${missingLetter}"!`
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-gray-500 text-sm">
        Which letter completes the word?
      </p>
    </div>
  );
};
