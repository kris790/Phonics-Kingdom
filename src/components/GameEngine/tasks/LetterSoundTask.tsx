// Letter Sound Task - Assessment-First Approach
// Flow: Show picture → Ask question → Child answers → Provide feedback with teaching
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../types';
import { getLetterPicture } from '../../../data/wordPictures';
import { audioService } from '../../../services/audioService';

interface LetterSoundTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

type TaskPhase = 'assessment' | 'feedback';

export const LetterSoundTask: React.FC<LetterSoundTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const targetLetter = task.targetPhoneme.toLowerCase();
  const targetLetterUpper = targetLetter.toUpperCase();
  const picture = getLetterPicture(targetLetter);
  
  const [phase, setPhase] = useState<TaskPhase>('assessment');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Speak the assessment question (NOT the answer!)
  const speakQuestion = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // ASSESSMENT prompt - ask about the sound, don't reveal it
    const questionText = `Look at the picture. What sound do you hear at the beginning of ${picture.word}?`;
    audioService.speak(questionText, {
      rate: 0.85,
      pitch: 1.1,
      onComplete: () => setIsPlaying(false)
    });
  }, [picture.word, isPlaying]);

  // Speak teaching feedback AFTER the answer
  const speakFeedback = useCallback((correct: boolean) => {
    setIsPlaying(true);
    
    if (correct) {
      // Correct: Reinforce the learning
      const feedbackText = `Great job! ${targetLetterUpper} says /${targetLetter}/ like in ${picture.word}!`;
      audioService.speak(feedbackText, {
        rate: 0.8,
        pitch: 1.2,
        onComplete: () => setIsPlaying(false)
      });
    } else {
      // Incorrect: Teach the correct answer
      const feedbackText = `Let's listen: /${targetLetter}/, /${targetLetter}/, ${picture.word}. ${targetLetterUpper} makes the /${targetLetter}/ sound!`;
      audioService.speak(feedbackText, {
        rate: 0.75,
        pitch: 1.0,
        onComplete: () => setIsPlaying(false)
      });
    }
  }, [targetLetter, targetLetterUpper, picture.word]);

  // Auto-play question when task loads
  useEffect(() => {
    const timer = setTimeout(() => {
      speakQuestion();
    }, 600);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle answer selection
  const handleAnswer = (option: { id: string; text: string; isCorrect: boolean }) => {
    if (disabled || phase === 'feedback') return;
    
    setSelectedOption(option.id);
    setIsCorrect(option.isCorrect);
    setPhase('feedback');
    
    // Speak feedback
    speakFeedback(option.isCorrect);
    
    // Wait for feedback, then submit answer
    setTimeout(() => {
      onAnswer(option.id);
    }, 3000);
  };

  return (
    <div className="text-center">
      {/* ASSESSMENT PHASE: Show picture, hide letter-sound connection */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="mb-6"
      >
        <div className="inline-block bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-3xl shadow-lg min-w-[200px] min-h-[200px] flex flex-col items-center justify-center border-4 border-white">
          {/* Show picture ONLY - don't reveal the letter connection yet */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="text-9xl mb-2"
            role="img"
            aria-label={picture.word}
          >
            {picture.emoji}
          </motion.div>
          
          {/* Show word name but NOT the starting letter connection */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-700 capitalize"
          >
            {picture.word}
          </motion.p>
        </div>
      </motion.div>

      {/* Question prompt - Assessment style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        {phase === 'assessment' ? (
          <>
            <p className="text-xl text-gray-700 font-medium mb-3">
              What sound do you hear at the <span className="font-bold text-brio-teal">beginning</span> of 
              <span className="font-bold text-vowelia-purple"> "{picture.word}"</span>?
            </p>
            
            {/* Listen button */}
            <motion.button
              onClick={speakQuestion}
              disabled={isPlaying}
              className={`
                px-5 py-2 rounded-full font-bold text-base
                ${isPlaying 
                  ? 'bg-brio-teal text-white animate-pulse' 
                  : 'bg-white border-2 border-brio-teal text-brio-teal hover:bg-brio-teal hover:text-white'
                }
                transition-all shadow-md
              `}
            >
              <span className="flex items-center gap-2">
                <span>🔊</span> {isPlaying ? 'Listening...' : 'Hear Question'}
              </span>
            </motion.button>
          </>
        ) : (
          /* FEEDBACK PHASE: Now reveal the teaching */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-4 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
          >
            {isCorrect ? (
              <p className="text-xl font-bold text-green-700">
                🎉 Great job! <span className="text-2xl">{targetLetterUpper}</span> says 
                <span className="text-brio-teal"> /{targetLetter}/</span> like in 
                <span className="text-vowelia-purple"> {picture.word}</span>!
              </p>
            ) : (
              <div className="text-amber-800">
                <p className="text-lg font-medium mb-2">
                  Let's learn! Listen: <span className="font-bold">/{targetLetter}/, /{targetLetter}/, {picture.word}</span>
                </p>
                <p className="text-xl font-bold">
                  <span className="text-2xl">{targetLetterUpper}</span> makes the 
                  <span className="text-brio-teal"> /{targetLetter}/</span> sound!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Answer options - Letter choices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {task.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const showCorrect = phase === 'feedback' && option.isCorrect;
          const showWrong = phase === 'feedback' && isSelected && !option.isCorrect;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleAnswer(option)}
              disabled={disabled || phase === 'feedback'}
              className={`
                p-6 rounded-2xl text-4xl font-bold transition-all
                ${showCorrect 
                  ? 'bg-green-500 text-white border-4 border-green-600 scale-110' 
                  : showWrong 
                    ? 'bg-red-400 text-white border-4 border-red-500' 
                    : 'bg-white border-4 border-gray-200 hover:border-brio-teal hover:shadow-lg hover:bg-teal-50'
                }
                ${phase === 'feedback' && !showCorrect && !showWrong ? 'opacity-40' : ''}
                disabled:cursor-not-allowed
              `}
              whileHover={phase === 'assessment' ? { scale: 1.08, rotate: [-2, 2, 0] } : {}}
              whileTap={phase === 'assessment' ? { scale: 0.95 } : {}}
            >
              {option.text.toUpperCase()}
              {showCorrect && <span className="block text-lg mt-1">✓</span>}
              {showWrong && <span className="block text-lg mt-1">✗</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Visual hint after wrong answer */}
      <AnimatePresence>
        {phase === 'feedback' && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-vowelia-purple"
          >
            <span className="text-4xl">{picture.emoji}</span>
            <span className="text-3xl font-bold text-vowelia-purple">{targetLetterUpper}</span>
            <span className="text-xl text-gray-500">→</span>
            <span className="text-2xl font-bold text-brio-teal">/{targetLetter}/</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
