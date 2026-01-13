// Landing Page - App entry screen
import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-indigo-600 to-blue-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{ 
            y: [null, -20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Logo & Title */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-32 h-32 mx-auto mb-6 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/30"
        >
          <span className="text-6xl">👑</span>
        </motion.div>
        
        <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
          Phonics Kingdom
        </h1>
        <p className="text-white/80 text-lg font-medium">
          The magical world of reading awaits!
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-6 mb-10"
      >
        {[
          { emoji: '🦁', label: 'Fun Characters' },
          { emoji: '🎮', label: 'Learning Games' },
          { emoji: '⭐', label: 'Earn Rewards' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <span className="text-2xl">{feature.emoji}</span>
            </div>
            <span className="text-white/70 text-xs font-medium">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="bg-white text-purple-600 px-12 py-4 rounded-full font-bold text-xl shadow-2xl hover:shadow-purple-500/30 transition-all"
      >
        Start Adventure ✨
      </motion.button>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-white/50 text-xs"
      >
        Version 2.0 • Made with ❤️ for young readers
      </motion.p>
    </div>
  );
};

export default LandingPage;
