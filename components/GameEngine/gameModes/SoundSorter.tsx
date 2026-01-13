
import React, { useState } from 'react';
import BaseGameMode from './BaseGameMode';
import { Task } from '../utils/phonicsRules';
import { CharacterType, UserSettings } from '../../../types';

interface SoundSorterProps {
  targetSound: string;
  options: string[];
  correctIndex: number;
  feedback: 'CORRECT' | 'WRONG' | null;
  onSelect: (index: number) => void;
  onHear: (text: string) => void;
  characterType: CharacterType;
  settings: UserSettings & { simplifiedUI?: boolean };
}

const SoundSorter: React.FC<SoundSorterProps> = ({ 
  targetSound, options, correctIndex, feedback, onSelect, onHear, characterType, settings 
}) => {
  const [flyingIndex, setFlyingIndex] = useState<number | null>(null);

  const handleChoice = (idx: number) => {
    if (feedback !== null) return;
    if (idx === correctIndex) {
      setFlyingIndex(idx);
    }
    onSelect(idx);
  };

  const getBucketIcon = () => {
    switch (characterType) {
      case 'BRIO': return '🧺';
      case 'DIESEL': return '🛒';
      case 'VOWELIA': return '🔮';
      case 'ZIPPY': return '📦';
      default: return '📥';
    }
  };

  return (
    <BaseGameMode
      task={{} as Task}
      characterType={characterType}
      settings={settings}
      feedback={feedback}
      header={
        <div className="bg-teal-600 p-8 rounded-[2rem] shadow-2xl border-4 border-white w-full text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">👂</div>
          <p className="text-teal-100 font-black uppercase italic tracking-widest text-xs mb-2">Sound Sorting</p>
          <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg flex items-center justify-center gap-4">
            Listen for: <span className="bg-white text-teal-600 px-6 py-2 rounded-2xl border-4 border-teal-400">/{targetSound}/</span>
          </h2>
          <button 
            onClick={() => onHear(`Listen for the ${targetSound} sound`)}
            className="mt-4 bg-teal-400 text-white px-6 py-2 rounded-xl font-black uppercase text-xs hover:bg-teal-500 transition-all border-2 border-teal-300"
          >
            🔊 Replay Sound
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-12 w-full">
        <div className={`grid ${settings.simplifiedUI ? 'grid-cols-2' : 'grid-cols-3'} gap-6 w-full max-w-2xl`}>
          {options.map((option, idx) => {
            // Adaptive Logic: Hide extra distractors in simplified mode
            const isCorrect = idx === correctIndex;
            const isFirstDistractor = options.findIndex((o, i) => i !== correctIndex) === idx;
            if (settings.simplifiedUI && !isCorrect && !isFirstDistractor) return null;

            return (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleChoice(idx)}
                className={`relative bg-white border-4 p-6 rounded-3xl shadow-xl transition-all hover:scale-110 active:scale-90
                  ${feedback === 'CORRECT' && idx === correctIndex ? 'border-emerald-500 z-50' : 'border-slate-100'}
                  ${feedback === 'WRONG' && idx === flyingIndex ? 'animate-shake border-red-400' : ''}
                  ${flyingIndex === idx ? 'animate-bounce' : ''}
                  ${settings.simplifiedUI && !isCorrect ? 'border-amber-200' : ''}
                `}
              >
                <div className="text-5xl md:text-7xl mb-2">📦</div>
                <span className={`font-black text-slate-800 text-xl md:text-2xl ${settings.dyslexicFont ? 'dyslexic-font' : ''}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* The Collector Bucket */}
        <div className="relative group">
          <div className="absolute inset-0 bg-teal-200/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative text-9xl md:text-[12rem] filter drop-shadow-2xl animate-float">
            {getBucketIcon()}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-6 py-2 rounded-full border-4 border-teal-500 shadow-xl">
              <span className="text-teal-700 font-black uppercase italic tracking-tighter text-sm">Target Collector</span>
            </div>
          </div>
        </div>

        {settings.simplifiedUI && (
          <p className="text-amber-600 font-black uppercase text-[10px] tracking-widest animate-pulse">✨ Focus Mode: Pick the box with the sound!</p>
        )}
      </div>
    </BaseGameMode>
  );
};

export default SoundSorter;
