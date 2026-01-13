
import React from 'react';
import { CharacterType } from '../../types';

interface GameHeaderProps {
  currentIndex: number;
  totalTasks: number;
  onExit: () => void;
  characterType: CharacterType;
  narrative?: string;
  onHelp?: () => void;
}

const PHONICS_ICONS: Record<string, string> = {
  BRIO: '🎙️', VOWELIA: '✨', DIESEL: '🏗️', ZIPPY: '🚀'
};

const GameHeader: React.FC<GameHeaderProps> = ({ currentIndex, totalTasks, onExit, characterType, narrative, onHelp }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 flex flex-col gap-4 z-50">
      <header className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={onExit} 
            className="bg-white border-2 border-slate-200 text-slate-500 px-6 py-2 rounded-xl font-black uppercase text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            ← Retreat
          </button>
          <button 
            onClick={onHelp} 
            className="bg-teal-50 text-teal-600 border-2 border-teal-100 px-6 py-2 rounded-xl font-black uppercase text-xs hover:bg-teal-100 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <span>💡</span> Tutor Help
          </button>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-2xl shadow-sm border-2 border-slate-100">
          <span className="text-2xl">{PHONICS_ICONS[characterType]}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Quest Progress</span>
            <span className="font-black text-slate-800 uppercase italic text-sm tracking-widest">
              {currentIndex} / {totalTasks}
            </span>
          </div>
        </div>
      </header>

      {narrative && (
        <div className="animate-pop w-full">
           <div className="bg-[#fff9e6] p-4 md:p-6 rounded-3xl border-4 border-amber-100 shadow-xl relative group overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-amber-200 text-amber-700 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl font-black">📖</div>
                <p className="text-slate-700 font-bold text-lg md:text-xl leading-snug italic">"{narrative}"</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameHeader;
