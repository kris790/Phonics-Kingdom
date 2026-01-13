// Voice Indicator - Shows when voice control is active
import React from 'react';
import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isListening: boolean;
  intensity: number;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening, intensity }) => {
  if (!isListening) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-purple-600/90 backdrop-blur-lg px-3 py-2 rounded-full shadow-lg"
    >
      {/* Sound Bars */}
      <div className="flex items-end gap-0.5 h-4">
        {[0.4, 0.7, 1, 0.7, 0.4].map((height, i) => (
          <motion.div
            key={i}
            className="w-1 bg-white rounded-full"
            animate={{
              height: isListening ? [4, 4 + intensity * 12 * height, 4] : 4,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      <span className="text-white text-xs font-medium">
        🎤 Listening...
      </span>
    </motion.div>
  );
};

export default VoiceIndicator;
