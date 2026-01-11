// CharacterSelectorModal - Choose your guide character
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character, CHARACTERS, GameAction } from '../../types';

interface CharacterSelectorModalProps {
  isOpen: boolean;
  onSelect: (characterId: string) => void;
  dispatch: React.Dispatch<GameAction>;
}

export const CharacterSelectorModal: React.FC<CharacterSelectorModalProps> = ({
  isOpen,
  onSelect,
  dispatch,
}) => {
  const characters = Object.values(CHARACTERS);

  const handleSelect = (character: Character) => {
    onSelect(character.id);
    dispatch({ type: 'SELECT_CHARACTER', characterId: character.id });
    dispatch({ type: 'NAVIGATE', view: 'magic-map' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-b from-kingdom-bg to-blue-100 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-4xl"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Welcome to Phonics Kingdom! 👑
              </h1>
              <p className="text-xl text-gray-600">
                Choose your guide for the adventure
              </p>
            </motion.div>

            {/* Character cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {characters.map((character, index) => (
                <motion.button
                  key={character.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => handleSelect(character)}
                  className="group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden transition-shadow group-hover:shadow-2xl">
                    {/* Character avatar */}
                    <div
                      className="h-32 md:h-40 flex items-center justify-center"
                      style={{ backgroundColor: character.color }}
                    >
                      <motion.span
                        className="text-6xl md:text-7xl"
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          delay: index * 0.2,
                        }}
                      >
                        {character.id === 'brio' && '🦁'}
                        {character.id === 'vowelia' && '🦉'}
                        {character.id === 'diesel' && '🦊'}
                        {character.id === 'zippy' && '🐰'}
                      </motion.span>
                    </div>

                    {/* Character info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">
                        {character.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {character.personality}
                      </p>
                      <div
                        className="text-xs px-2 py-1 rounded-full inline-block text-white"
                        style={{ backgroundColor: character.color }}
                      >
                        {character.specialty}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-10 left-10 text-4xl opacity-50"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-10 right-10 text-4xl opacity-50"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ⭐
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterSelectorModal;
