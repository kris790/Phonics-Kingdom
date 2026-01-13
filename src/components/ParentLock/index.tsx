// Parent Lock - Simple math challenge to access Parent Hub
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ParentLockProps {
  onUnlock: () => void;
  onCancel: () => void;
}

const ParentLock: React.FC<ParentLockProps> = ({ onUnlock, onCancel }) => {
  // Generate a simple math problem
  const [numbers] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  });
  
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(input) === numbers.answer) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1000);
    }
  }, [input, numbers.answer, onUnlock]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Parent Area</h2>
          <p className="text-gray-500 text-sm mt-1">
            Solve to enter (keeps little ones out!)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-gray-800 mb-4">
              {numbers.a} + {numbers.b} = ?
            </p>
            
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="?"
              className={`
                w-24 h-16 text-3xl font-bold text-center rounded-xl border-3
                transition-all outline-none
                ${error 
                  ? 'border-red-500 bg-red-50 animate-shake' 
                  : 'border-gray-200 focus:border-purple-500'}
              `}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Enter
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </motion.div>
  );
};

export default ParentLock;
