// Rhyme Time Task - Find rhyming words (Assessment-First)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../../types';
import { getWordPicture } from '../../../data/wordPictures';

interface RhymeTimeTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

type TaskPhase = 'assessment' | 'feedback';

export const RhymeTimeTask: React.FC<RhymeTimeTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [phase, setPhase] = useState<TaskPhase>('assessment');
  const [selectedOption, setSelectedOption] = useState<{ id: string; text: string; isCorrect: boolean } | null>(null);

  // Extract the source word from the prompt (e.g., 'Which word rhymes with "cat"?')
  const wordMatch = task.prompt.match(/"([^"]+)"/);
  const sourceWord = wordMatch ? wordMatch[1] : task.targetPhoneme;
  const sourceEmoji = getWordPicture(sourceWord);
  
  // Get the rhyme ending (e.g., -at from cat)
  const rhymeEnding = sourceWord.slice(-2);

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
      {/* Target word display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="inline-block bg-gradient-to-r from-diesel-yellow to-orange-500 px-8 py-4 rounded-2xl shadow-lg">
          <span className="text-5xl mr-3">{sourceEmoji}</span>
          <span className="text-4xl font-bold text-white">
            {sourceWord}
          </span>
        </div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-3 text-gray-600 text-lg"
        >
          🎵 Which word sounds the same at the end? 🎵
        </motion.div>
      </motion.div>

      {/* Feedback display */}
      {phase === 'feedback' && selectedOption && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-2xl ${selectedOption.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
        >
          {selectedOption.isCorrect ? (
            <p className="text-xl font-bold text-green-700">
              🎉 Yes! "{sourceWord}" and "{selectedOption.text}" both end with <span className="text-2xl">-{rhymeEnding}</span>! They rhyme!
            </p>
          ) : (
            <div className="text-amber-800">
              <p className="text-lg font-medium mb-1">
                "{sourceWord}" ends with <span className="font-bold">-{rhymeEnding}</span>.
              </p>
              <p className="text-lg">
                Look for another word that ends with <span className="font-bold">-{rhymeEnding}</span>!
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Rhyme options */}
      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        {task.options.map((option, index) => {
          const optionEmoji = getWordPicture(option.text);
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = phase === 'feedback' && option.isCorrect;
          const showWrong = phase === 'feedback' && isSelected && !option.isCorrect;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAnswer(option)}
              disabled={disabled || phase === 'feedback'}
              className={`
                p-6 rounded-2xl text-2xl font-bold transition-all
                ${showCorrect 
                  ? 'bg-green-100 border-4 border-green-500 scale-105' 
                  : showWrong 
                    ? 'bg-red-100 border-4 border-red-400' 
                    : 'bg-white border-2 border-gray-200 hover:border-diesel-yellow hover:shadow-lg hover:bg-yellow-50'
                }
                ${phase === 'feedback' && !showCorrect && !showWrong ? 'opacity-40' : ''}
                disabled:cursor-not-allowed
                flex flex-col items-center gap-2
              `}
              whileHover={phase === 'assessment' ? { scale: 1.05 } : {}}
              whileTap={phase === 'assessment' ? { scale: 0.95 } : {}}
            >
              <span className="text-4xl">{optionEmoji}</span>
              <motion.span
                animate={phase === 'assessment' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.3 }}
              >
                {option.text}
              </motion.span>
              {showCorrect && <span className="text-green-600 text-lg">✓ Rhymes!</span>}
              {showWrong && <span className="text-red-600 text-lg">✗ Doesn't rhyme</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
