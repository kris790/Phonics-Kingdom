import React from 'react';
import BaseGameMode from './BaseGameMode';
import { Task } from '../utils/phonicsRules';
import { CharacterType, UserSettings } from '../../../types';

interface WordWeaverProps {
  wordParts: string[];
  options: string[];
  feedback: 'CORRECT' | 'WRONG' | null;
  onSelect: (index: number) => void;
}

const WordWeaver: React.FC<WordWeaverProps> = ({ wordParts, options, feedback, onSelect }) => {
  return (
    <BaseGameMode
      task={{} as Task}
      characterType={'VOWELIA'}
      settings={{} as UserSettings}
      feedback={feedback}
      header={
        <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-8 rounded-[2rem] shadow-2xl border-4 border-white/30 w-full text-center">
           <div className="flex justify-center gap-4 items-center mb-6">
              {wordParts.map((part, i) => (
                <div key={i} className={`w-20 h-28 md:w-28 md:h-36 flex items-center justify-center text-5xl md:text-7xl font-black rounded-2xl border-4 shadow-xl ${part === '_' ? 'bg-indigo-900/50 border-white border-dashed text-white animate-pulse' : 'bg-white border-white text-indigo-700'}`}>
                  {part === '_' ? '?' : part}
                </div>
              ))}
           </div>
           <p className="text-white font-black uppercase italic text-sm tracking-widest opacity-80">Weave the magical missing sound!</p>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-4 w-full max-w-xl mx-auto mt-4">
        {options.map((option, idx) => (
          <button
            key={idx}
            disabled={feedback !== null}
            onClick={() => onSelect(idx)}
            className={`bg-white border-4 p-6 rounded-2xl shadow-xl text-4xl font-black transition-all hover:scale-110 active:scale-95
              ${feedback === 'CORRECT' && idx === options.indexOf(option) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-purple-400 text-slate-800'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </BaseGameMode>
  );
};

export default WordWeaver;
