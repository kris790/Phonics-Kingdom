// Feedback Overlay Component
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../../services/nativeService';

interface FeedbackOverlayProps {
  type: 'correct' | 'incorrect' | null;
  encouragement?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  type,
  encouragement,
}) => {
  // Trigger haptic feedback when feedback type changes
  useEffect(() => {
    if (type === 'correct') {
      haptics.success();
    } else if (type === 'incorrect') {
      haptics.warning();
    }
  }, [type]);

  return (
    <AnimatePresence mode="wait">
      {type && (
        <motion.div
          key={type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          {type === 'correct' ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">🎉</div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-lg text-2xl font-bold"
              >
                Correct!
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ x: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="text-6xl mb-4"
              >
                🤔
              </motion.div>
              <div className="bg-orange-500 text-white px-8 py-4 rounded-2xl shadow-lg text-xl font-bold">
                Try Again!
              </div>
              {encouragement && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-gray-700 text-lg bg-white/80 px-4 py-2 rounded-lg"
                >
                  {encouragement}
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
