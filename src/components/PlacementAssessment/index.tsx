// Placement Assessment - Determine starting skill level
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, SkillLevel, CHARACTERS } from '../../types';
import { audioService } from '../../services/audioService';

interface PlacementAssessmentProps {
  characterType: CharacterType;
  onComplete: (score: number, startingLevel: SkillLevel) => void;
}

interface Question {
  id: string;
  type: 'audio' | 'visual';
  level: SkillLevel;
  prompt: string;
  options: string[];
  correctIndex: number;
  audio?: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'audio',
    level: SkillLevel.PHONEMIC_AWARENESS,
    prompt: "What sound does 'cat' start with?",
    options: ['/k/', '/t/', '/a/', '/m/'],
    correctIndex: 0,
  },
  {
    id: 'q2',
    type: 'visual',
    level: SkillLevel.LETTER_SOUNDS,
    prompt: "Which letter makes the 'sss' sound?",
    options: ['M', 'S', 'T', 'B'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    type: 'visual',
    level: SkillLevel.DIGRAPHS_BLENDS,
    prompt: "What sound do 'SH' make together?",
    options: ['/s/ /h/', '/sh/', '/ch/', '/th/'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    type: 'visual',
    level: SkillLevel.BLENDING_CVC,
    prompt: "What word is this: C - A - T?",
    options: ['Cat', 'Cut', 'Cot', 'Kit'],
    correctIndex: 0,
  },
  {
    id: 'q5',
    type: 'visual',
    level: SkillLevel.SIGHT_WORDS,
    prompt: "Can you read this word?",
    options: ['the', 'teh', 'hte', 'eht'],
    correctIndex: 0,
  },
];

const PlacementAssessment: React.FC<PlacementAssessmentProps> = ({
  characterType,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const character = CHARACTERS[characterType];
  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === question.correctIndex;
    setAnswers(prev => [...prev, isCorrect]);

    // Play feedback sound
    if (isCorrect) {
      audioService.play('/sounds/correct.mp3');
    } else {
      audioService.play('/sounds/incorrect.mp3');
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Calculate score and starting level
        const correctAnswers = [...answers, isCorrect].filter(Boolean).length;
        const score = (correctAnswers / ASSESSMENT_QUESTIONS.length) * 100;
        
        // Determine starting level based on score
        let startingLevel: SkillLevel;
        if (score >= 80) {
          startingLevel = SkillLevel.SIGHT_WORDS;
        } else if (score >= 60) {
          startingLevel = SkillLevel.BLENDING_CVC;
        } else if (score >= 40) {
          startingLevel = SkillLevel.DIGRAPHS_BLENDS;
        } else if (score >= 20) {
          startingLevel = SkillLevel.LETTER_SOUNDS;
        } else {
          startingLevel = SkillLevel.PHONEMIC_AWARENESS;
        }

        setTimeout(() => {
          onComplete(score, startingLevel);
        }, 500);
      }
    }, 1500);
  }, [selectedAnswer, question, currentQuestion, answers, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-400 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
          style={{ backgroundColor: character.color }}
        >
          {characterType === 'brio' && '🦁'}
          {characterType === 'vowelia' && '🦉'}
          {characterType === 'diesel' && '🦊'}
          {characterType === 'zippy' && '🐰'}
        </div>
        <div className="flex-1">
          <p className="text-white/80 text-sm">Quick Check-In</p>
          <p className="text-white font-bold">{character.name} wants to know what you know!</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-3 mb-8">
        <motion.div
          className="bg-white h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex-1 flex flex-col"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
            <p className="text-center text-gray-500 text-sm mb-2">
              Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </p>
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              {question.prompt}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctIndex;
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
                    p-6 rounded-2xl text-2xl font-bold transition-all
                    ${showAsCorrect ? 'bg-green-500 text-white' : ''}
                    ${showAsWrong ? 'bg-red-500 text-white' : ''}
                    ${!showFeedback ? 'bg-white text-gray-800 hover:shadow-lg' : ''}
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

      {/* Feedback Overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className={`text-8xl ${selectedAnswer === question.correctIndex ? 'animate-bounce' : 'animate-pulse'}`}>
              {selectedAnswer === question.correctIndex ? '✨' : '💪'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacementAssessment;
