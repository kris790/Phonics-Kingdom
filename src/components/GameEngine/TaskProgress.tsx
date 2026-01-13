// Task Progress Component
import React from 'react';
import { motion } from 'framer-motion';

interface TaskProgressProps {
  current: number;
  total: number;
  accuracy: number;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  current,
  total,
  accuracy,
}) => {
  const progressPercent = (current / total) * 100;

  return (
    <div className="flex items-center gap-4">
      {/* Progress bar */}
      <div className="flex-1 min-w-[120px]">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Task {current} of {total}</span>
          <span>{accuracy}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-brio-teal to-vowelia-purple rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Stars earned */}
      <div className="flex items-center gap-1">
        {[...Array(3)].map((_, i) => {
          const threshold = (i + 1) * 33;
          const isEarned = accuracy >= threshold;
          
          return (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: isEarned ? 1 : 0.5 }}
              className={`text-xl ${isEarned ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};
