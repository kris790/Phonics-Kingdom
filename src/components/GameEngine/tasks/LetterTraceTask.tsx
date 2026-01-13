// Letter Trace Task - Trace letters to learn formation
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../../types';
import { getLetterPicture } from '../../../data/wordPictures';

interface Point {
  x: number;
  y: number;
}

interface LetterTraceTaskProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

// Simple letter path guides (SVG path-like coordinates for guidance)
const letterGuides: Record<string, Point[][]> = {
  'A': [[{ x: 50, y: 90 }, { x: 50, y: 10 }], [{ x: 50, y: 10 }, { x: 90, y: 90 }], [{ x: 30, y: 60 }, { x: 70, y: 60 }]],
  'B': [[{ x: 20, y: 10 }, { x: 20, y: 90 }], [{ x: 20, y: 10 }, { x: 60, y: 10 }, { x: 70, y: 25 }, { x: 60, y: 45 }, { x: 20, y: 50 }], [{ x: 20, y: 50 }, { x: 65, y: 50 }, { x: 80, y: 70 }, { x: 65, y: 90 }, { x: 20, y: 90 }]],
  'C': [[{ x: 80, y: 25 }, { x: 60, y: 10 }, { x: 30, y: 10 }, { x: 15, y: 50 }, { x: 30, y: 90 }, { x: 60, y: 90 }, { x: 80, y: 75 }]],
  // Default for any letter - just draw a circle
  'default': [[{ x: 50, y: 10 }, { x: 80, y: 30 }, { x: 80, y: 70 }, { x: 50, y: 90 }, { x: 20, y: 70 }, { x: 20, y: 30 }, { x: 50, y: 10 }]],
};

export const LetterTraceTask: React.FC<LetterTraceTaskProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const targetLetter = task.targetPhoneme.toUpperCase();
  const guide = letterGuides[targetLetter] || letterGuides['default'];
  const letterPicture = getLetterPicture(task.targetPhoneme.toLowerCase());

  // Get relative position within canvas
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || completed) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPosition(e);
    if (pos) setCurrentPath([pos]);
  }, [disabled, completed, getPosition]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || completed) return;
    e.preventDefault();
    const pos = getPosition(e);
    if (pos) {
      setCurrentPath(prev => [...prev, pos]);
    }
  }, [isDrawing, disabled, completed, getPosition]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 5) {
      setPaths(prev => [...prev, currentPath]);
      // Increase progress for each stroke
      setProgress(prev => Math.min(100, prev + 35));
    }
    setCurrentPath([]);
  }, [isDrawing, currentPath]);

  // Check completion
  useEffect(() => {
    if (progress >= 100 && !completed) {
      setCompleted(true);
      const correctOption = task.options.find(o => o.isCorrect);
      setTimeout(() => {
        onAnswer(correctOption?.id || '1');
      }, 800);
    }
  }, [progress, completed, task.options, onAnswer]);

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    setProgress(0);
    setCompleted(false);
  }, []);

  // Convert points to SVG path
  const pointsToPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="text-center max-w-md mx-auto">
      {/* Picture hint */}
      <div className="mb-4 flex flex-col items-center gap-2">
        <span className="text-5xl">{letterPicture.emoji}</span>
        <span className="text-lg font-medium text-gray-600">
          Trace the letter <strong className="text-brio-teal text-2xl">/{targetLetter.toLowerCase()}/</strong> for <span className="text-vowelia-purple font-bold">{letterPicture.word}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brio-teal to-vowelia-purple"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
      </div>

      {/* Tracing canvas */}
      <div
        ref={canvasRef}
        className="relative w-full aspect-square bg-white rounded-2xl border-4 border-gray-200 shadow-lg overflow-hidden cursor-crosshair touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Background letter guide (faded) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span 
            className="text-[200px] font-bold text-gray-100 select-none"
            style={{ lineHeight: 1 }}
          >
            {targetLetter}
          </span>
        </div>

        {/* Guide dots */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {guide.map((stroke, strokeIndex) => (
            <g key={strokeIndex}>
              {/* Guide line (dotted) */}
              <path
                d={pointsToPath(stroke)}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="2 4"
              />
              {/* Start point */}
              <circle
                cx={stroke[0].x}
                cy={stroke[0].y}
                r="4"
                fill="#10b981"
                className="animate-pulse"
              />
            </g>
          ))}
        </svg>

        {/* Drawn paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {paths.map((path, index) => (
            <path
              key={index}
              d={pointsToPath(path)}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Current drawing path */}
          {currentPath.length > 0 && (
            <path
              d={pointsToPath(currentPath)}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Completion overlay */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white/80 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ delay: 0.2 }}
                className="text-6xl mb-2"
              >
                ⭐
              </motion.div>
              <p className="text-xl font-bold text-gray-800">Perfect!</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
          disabled={disabled || completed || paths.length === 0}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Try Again
        </motion.button>
      </div>

      <p className="mt-4 text-gray-500 text-sm">
        Trace the letter "{targetLetter}" - follow the green dots!
      </p>
    </div>
  );
};
