// World Intro - Animated story introduction
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, CHARACTERS } from '../../types';

interface WorldIntroProps {
  characterType: CharacterType;
  playerName: string;
  onComplete: () => void;
}

interface StorySlide {
  text: string;
  emoji: string;
  bg: string;
}

const WorldIntro: React.FC<WorldIntroProps> = ({
  characterType,
  playerName,
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const character = CHARACTERS[characterType];

  const slides: StorySlide[] = [
    {
      text: `Long ago, the Phonics Kingdom was filled with magical sounds and words...`,
      emoji: '🏰',
      bg: 'from-purple-600 to-indigo-800',
    },
    {
      text: `But a mysterious fog stole the kingdom's sound magic, leaving the islands silent...`,
      emoji: '🌫️',
      bg: 'from-gray-600 to-gray-800',
    },
    {
      text: `The Sound Guardians need a hero to restore the magic by mastering phonics!`,
      emoji: '✨',
      bg: 'from-amber-500 to-orange-600',
    },
    {
      text: `${playerName}, you have been chosen! Together with ${character.name}, you will save the kingdom!`,
      emoji: character.id === 'brio' ? '🦁' : character.id === 'vowelia' ? '🦉' : character.id === 'diesel' ? '🦊' : '🐰',
      bg: 'from-green-500 to-teal-600',
    },
    {
      text: `Master each island's sounds to collect Sound Shards and restore the magic!`,
      emoji: '💎',
      bg: 'from-cyan-500 to-blue-600',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide, slides.length]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${slide.bg} flex flex-col items-center justify-center p-6 transition-all duration-1000`}>
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white/50 hover:text-white text-sm font-medium"
      >
        Skip →
      </button>

      {/* Progress Dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-6' : index < currentSlide ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-8xl mb-8"
          >
            {slide.emoji}
          </motion.div>

          <p className="text-white text-2xl font-medium leading-relaxed mb-12">
            {slide.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Next/Start Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        className="bg-white text-gray-800 px-10 py-4 rounded-full font-bold text-lg shadow-2xl"
      >
        {currentSlide === slides.length - 1 ? "Begin Adventure! ✨" : "Next →"}
      </motion.button>

      {/* Tap Hint */}
      <p className="absolute bottom-8 text-white/50 text-sm">
        Tap anywhere to continue
      </p>

      {/* Click anywhere to advance */}
      <div 
        className="absolute inset-0 z-0" 
        onClick={handleNext}
      />
    </div>
  );
};

export default WorldIntro;
