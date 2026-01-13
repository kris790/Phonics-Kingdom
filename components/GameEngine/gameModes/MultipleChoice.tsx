
import React from 'react';
import BaseGameMode from './BaseGameMode';
import { Task, CharacterType, UserSettings } from '../../../types';

interface MultipleChoiceProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings & { simplifiedUI?: boolean };
  feedback: 'CORRECT' | 'WRONG' | null;
  visual: string | null;
  visualLoading: boolean;
  onSelect: (index: number) => void;
  onHear: (text: string) => void;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  task, characterType, settings, feedback, visual, visualLoading, onSelect, onHear
}) => {
  const options = task.options || [];

  return (
    <BaseGameMode
      task={task}
      characterType={characterType}
      settings={settings}
      feedback={feedback}
    >
      <div className="flex flex-col w-full gap-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 aspect-square bg-white rounded-[3rem] border-8 border-teal-100 shadow-2xl overflow-hidden flex items-center justify-center relative group">
            {visualLoading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="text-6xl">🎨</div>
                <p className="text-teal-400 font-black uppercase text-xs tracking-widest">Drawing Context...</p>
              </div>
            ) : visual ? (
              <img src={visual} className="w-full h-full object-cover" alt="Task Context" />
            ) : (
              <div className="text-[12rem] opacity-10">📚</div>
            )}
            <button 
              onClick={() => onHear(task.prompt)}
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95 border-2 border-teal-200"
            >
              🔊
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h2 className={`text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-8 ${settings.dyslexicFont ? 'dyslexic-font' : ''}`}>
              {task.prompt}
            </h2>
            
            <div className="grid grid-cols-1 gap-4 w-full">
              {options.length > 0 ? options.map((option, idx) => {
                // Adaptive Logic: Simplified UI shows fewer distractions
                // Only show the correct answer and the FIRST distractor if simplifiedUI is active
                const isCorrect = idx === task.correctIndex;
                const isFirstDistractor = options.findIndex((o, i) => i !== task.correctIndex) === idx;
                
                if (settings.simplifiedUI && !isCorrect && !isFirstDistractor) return null;

                return (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => onSelect(idx)}
                    className={`group relative bg-white border-4 p-6 rounded-3xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-6
                      ${feedback === 'CORRECT' && idx === task.correctIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-teal-400'}
                      ${feedback === 'WRONG' && idx !== task.correctIndex ? 'opacity-50 grayscale' : ''}
                      ${settings.simplifiedUI && !isCorrect ? 'border-amber-200' : ''}
                    `}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-slate-800">{option}</span>
                  </button>
                );
              }) : (
                <div className="p-12 text-center bg-slate-100 rounded-3xl border-4 border-dashed border-slate-200">
                   <p className="text-slate-400 font-black uppercase italic tracking-widest">Searching the sound bank...</p>
                </div>
              )}
            </div>
            {settings.simplifiedUI && (
              <div className="mt-6 flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest animate-pulse">
                <span>✨</span> Simplified Mode Active: Focus on the sounds!
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseGameMode>
  );
};

export default MultipleChoice;
