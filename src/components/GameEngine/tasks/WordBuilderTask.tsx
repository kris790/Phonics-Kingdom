// Word Builder Task - Build words from letters (Assessment-First)
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../types';
import { getWordPicture } from '../../../data/wordPictures';

interface WordBuilderTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

type TaskPhase = 'building' | 'feedback';

export const WordBuilderTask: React.FC<WordBuilderTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState(
    task.options.map((o, i) => ({ ...o, originalIndex: i }))
  );
  const [phase, setPhase] = useState<TaskPhase>('building');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const targetWord = task.correctAnswer.toUpperCase();
  const targetEmoji = getWordPicture(task.correctAnswer.toLowerCase());

  // Add letter to word
  const handleLetterClick = useCallback((letter: string, optionId: string) => {
    if (disabled || phase === 'feedback') return;
    
    setSelectedLetters(prev => [...prev, letter]);
    setAvailableOptions(prev => prev.filter(o => o.id !== optionId));
  }, [disabled, phase]);

  // Remove letter from word
  const handleRemoveLetter = useCallback((index: number) => {
    if (disabled || phase === 'feedback') return;
    
    const removedLetter = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    
    // Find the original option and add it back
    const originalOption = task.options.find(o => o.text === removedLetter);
    if (originalOption) {
      setAvailableOptions(prev => [...prev, { ...originalOption, originalIndex: task.options.indexOf(originalOption) }]);
    }
  }, [disabled, phase, selectedLetters, task.options]);

  // Check answer
  const handleCheck = useCallback(() => {
    const builtWord = selectedLetters.join('');
    const correct = builtWord === targetWord;
    
    setIsCorrect(correct);
    setPhase('feedback');
    
    // Wait for feedback, then submit
    setTimeout(() => {
      onAnswer(correct ? task.options.find(o => o.isCorrect)?.id || '1' : 'wrong');
    }, 2500);
  }, [selectedLetters, targetWord, onAnswer, task.options]);

  // Clear all
  const handleClear = useCallback(() => {
    setSelectedLetters([]);
    setAvailableOptions(task.options.map((o, i) => ({ ...o, originalIndex: i })));
  }, [task.options]);

  return (
    <div className="text-center max-w-2xl mx-auto">
      {/* Picture hint */}
      <div className="mb-4">
        <span className="text-6xl">{targetEmoji}</span>
        <p className="text-gray-600 mt-2 text-lg">Use the letters to spell this word!</p>
      </div>

      {/* Feedback display */}
      {phase === 'feedback' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-4 p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
        >
          {isCorrect ? (
            <p className="text-xl font-bold text-green-700">
              🎉 Correct! You spelled "{task.correctAnswer}"!
            </p>
          ) : (
            <div className="text-amber-800">
              <p className="text-lg font-medium mb-1">
                The correct spelling is:
              </p>
              <p className="text-2xl font-bold tracking-widest">
                {targetWord.split('').map((letter, i) => (
                  <span key={i} className="mx-1">{letter}</span>
                ))}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Word building area */}
      <div className={`mb-8 min-h-[100px] rounded-2xl border-2 border-dashed p-4 flex items-center justify-center gap-2 flex-wrap ${
        phase === 'feedback' 
          ? isCorrect 
            ? 'bg-green-50 border-green-300' 
            : 'bg-amber-50 border-amber-300'
          : 'bg-white border-gray-300'
      }`}>
        <AnimatePresence mode="popLayout">
          {selectedLetters.length === 0 ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-lg"
            >
              Tap letters to build the word
            </motion.span>
          ) : (
            selectedLetters.map((letter, index) => (
              <motion.button
                key={`${letter}-${index}`}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => handleRemoveLetter(index)}
                disabled={disabled || phase === 'feedback'}
                className={`w-14 h-14 text-white text-2xl font-bold rounded-xl shadow-lg transition-shadow ${
                  phase === 'feedback'
                    ? isCorrect 
                      ? 'bg-green-500' 
                      : 'bg-amber-500'
                    : 'bg-gradient-to-br from-brio-teal to-teal-600 hover:shadow-xl'
                }`}
                whileHover={phase === 'building' ? { scale: 1.1 } : {}}
                whileTap={phase === 'building' ? { scale: 0.9 } : {}}
              >
                {letter}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Available letters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <AnimatePresence>
          {availableOptions
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map((option) => (
              <motion.button
                key={option.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => handleLetterClick(option.text, option.id)}
                disabled={disabled || phase === 'feedback'}
                className={`w-14 h-14 bg-white border-2 border-gray-200 text-2xl font-bold rounded-xl shadow transition-all ${
                  phase === 'building' ? 'hover:border-vowelia-purple hover:shadow-lg' : 'opacity-50'
                }`}
                whileHover={phase === 'building' ? { scale: 1.1, rotate: 5 } : {}}
                whileTap={phase === 'building' ? { scale: 0.9 } : {}}
              >
                {option.text}
              </motion.button>
            ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {phase === 'building' && (
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            disabled={disabled || selectedLetters.length === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
            disabled={disabled || selectedLetters.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-vowelia-purple to-brio-teal text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Check Answer
          </motion.button>
        </div>
      )}
    </div>
  );
};
