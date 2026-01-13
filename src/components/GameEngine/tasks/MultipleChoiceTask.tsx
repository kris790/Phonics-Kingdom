// Multiple Choice Task - Default task type (Assessment-First)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../../types';
import { getWordPicture } from '../../../data/wordPictures';

interface MultipleChoiceTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

type TaskPhase = 'assessment' | 'feedback';

export const MultipleChoiceTask: React.FC<MultipleChoiceTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [phase, setPhase] = useState<TaskPhase>('assessment');
  const [selectedOption, setSelectedOption] = useState<{ id: string; text: string; isCorrect: boolean } | null>(null);

  const handleAnswer = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (disabled || phase === 'feedback') return;
    
    setSelectedOption(option);
    setPhase('feedback');
    
    setTimeout(() => {
      onAnswer(option.id);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feedback display */}
      {phase === 'feedback' && selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-2xl text-center ${selectedOption.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
        >
          {selectedOption.isCorrect ? (
            <p className="text-xl font-bold text-green-700">
              🎉 Correct! Great job!
            </p>
          ) : (
            <p className="text-lg font-medium text-amber-800">
              The correct answer is <span className="font-bold">{task.options.find(o => o.isCorrect)?.text || 'the highlighted one'}</span>.
            </p>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {task.options.map((option, index) => {
          const optionEmoji = getWordPicture(option.text);
          const isSelected = selectedOption?.id === option.id;
          const showCorrect = phase === 'feedback' && option.isCorrect;
          const showWrong = phase === 'feedback' && isSelected && !option.isCorrect;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAnswer(option)}
              disabled={disabled || phase === 'feedback'}
              className={`
                p-6 rounded-2xl text-xl font-medium transition-all
                ${showCorrect 
                  ? 'bg-green-100 border-4 border-green-500 scale-105' 
                  : showWrong 
                    ? 'bg-red-100 border-4 border-red-400' 
                    : 'bg-white border-2 border-gray-200 hover:border-vowelia-purple hover:shadow-lg'
                }
                ${phase === 'feedback' && !showCorrect && !showWrong ? 'opacity-40' : ''}
                disabled:cursor-not-allowed
                flex flex-col items-center gap-2
              `}
              whileHover={phase === 'assessment' ? { scale: 1.02 } : {}}
              whileTap={phase === 'assessment' ? { scale: 0.98 } : {}}
            >
              <span className="text-4xl">{optionEmoji}</span>
              <span>{option.text}</span>
              {showCorrect && <span className="text-green-600 text-lg">✓</span>}
              {showWrong && <span className="text-red-600 text-lg">✗</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
