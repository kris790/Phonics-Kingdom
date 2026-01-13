
import React from 'react';
import BaseGameMode from './BaseGameMode';
import { CharacterType, UserSettings } from '../../../types';
import { Task } from '../utils/phonicsRules';

interface RhymeRacerProps {
  targetWord: string;
  options: string[];
  feedback: 'CORRECT' | 'WRONG' | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onHear: (word: string) => void;
  dyslexicFont?: boolean;
  visual?: string | null;
  visualLoading?: boolean;
  task?: Task;
  characterType?: CharacterType;
  settings?: UserSettings;
}

const RhymeRacer: React.FC<RhymeRacerProps> = ({ 
  targetWord, options, feedback, selectedIndex, onSelect, onHear, dyslexicFont, visual, visualLoading, task, characterType, settings 
}) => {
  return (
    <BaseGameMode
      task={task || {} as Task}
      characterType={characterType || 'ZIPPY'}
      settings={settings || {} as UserSettings}
      feedback={feedback}
      header={
        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          {(visual || visualLoading) && (
            <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-[3rem] border-8 border-red-100 shadow-2xl overflow-hidden flex items-center justify-center relative shrink-0">
              {visualLoading ? (
                <div className="animate-pulse text-5xl">🎨</div>
              ) : (
                <img src={visual!} className="w-full h-full object-cover" alt={targetWord} />
              )}
            </div>
          )}
          <div className="bg-gradient-to-br from-red-600 to-orange-500 p-8 rounded-[3rem] shadow-2xl border-4 border-white flex-1 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px]">
            <p className="text-white font-black uppercase italic tracking-widest text-[11px] mb-2 opacity-90">Rhyme Mission</p>
            <h2 className={`text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-6 tracking-tighter ${dyslexicFont ? 'dyslexic-font' : ''}`}>
              {targetWord}
            </h2>
            <button onClick={() => onHear(targetWord)} className="bg-white text-red-600 px-10 py-3 rounded-full font-black uppercase text-xs shadow-xl mx-auto flex items-center gap-3">
              <span className="text-lg">🔊</span> Hear Word
            </button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-6 w-full mt-6">
        {options.map((option, idx) => (
          <button
            key={idx}
            disabled={feedback !== null}
            onClick={() => onSelect(idx)}
            className={`bg-white border-4 p-8 rounded-[2rem] shadow-xl text-3xl md:text-5xl font-black transition-all hover:scale-105 active:scale-95
              ${dyslexicFont ? 'dyslexic-font' : ''}
              ${feedback === 'CORRECT' && idx === options.indexOf(option) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-orange-500 text-slate-800'}
              ${feedback === 'WRONG' && idx === selectedIndex ? 'border-red-400 animate-shake bg-red-50 text-red-700' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
    </BaseGameMode>
  );
};

export default RhymeRacer;
