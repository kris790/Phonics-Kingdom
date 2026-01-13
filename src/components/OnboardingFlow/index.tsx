// Onboarding Flow - Name entry and character selection
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterType, CHARACTERS } from '../../types';

interface OnboardingFlowProps {
  onComplete: (playerName: string, characterType: CharacterType) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'name' | 'character'>('name');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('brio');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStep('character');
    }
  };

  const handleComplete = () => {
    onComplete(playerName.trim(), selectedCharacter);
  };

  const characterList = Object.values(CHARACTERS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-cyan-200 flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl text-center mb-6"
            >
              👋
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Welcome, Explorer!
            </h1>
            <p className="text-gray-500 text-center mb-6">
              What should we call you?
            </p>

            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-6 py-4 text-xl rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-center font-medium mb-6"
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </form>
          </motion.div>
        )}

        {step === 'character' && (
          <motion.div
            key="character"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full"
          >
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Hi, {playerName}! 🎉
            </h1>
            <p className="text-gray-500 text-center mb-6">
              Choose your learning buddy:
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {characterList.map((char) => (
                <motion.button
                  key={char.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCharacter(char.id as CharacterType)}
                  className={`p-4 rounded-2xl border-3 transition-all ${
                    selectedCharacter === char.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <motion.div
                    animate={selectedCharacter === char.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2"
                    style={{ backgroundColor: char.color }}
                  >
                    {char.id === 'brio' && '🦁'}
                    {char.id === 'vowelia' && '🦉'}
                    {char.id === 'diesel' && '🦊'}
                    {char.id === 'zippy' && '🐰'}
                  </motion.div>
                  <p className="font-bold text-gray-800">{char.name}</p>
                  <p className="text-xs text-gray-500">{char.specialty}</p>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('name')}
                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-2 flex-grow bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-purple-700 transition-all"
              >
                Let's Go! ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
