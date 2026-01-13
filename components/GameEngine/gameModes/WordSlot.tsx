
import React, { forwardRef } from 'react';
import { SlotState, UserSettings } from '../../../types';
import { audioService } from '../../../services/audioService';

interface WordSlotProps {
  slot: SlotState;
  isHovered?: boolean;
  isShaking: boolean;
  isHighlighted?: boolean;
  onRemove: () => void;
  characterColor: string;
  settings: UserSettings;
}

const WordSlot = forwardRef<HTMLDivElement, WordSlotProps>(({
  slot,
  isHovered,
  isShaking,
  isHighlighted,
  onRemove,
  characterColor,
  settings
}, ref) => {
  const getSlotLabel = (position: SlotState['position']) => {
    switch (position) {
      case 'initial': return 'First';
      case 'middle': return 'Middle';
      case 'final': return 'Last';
      default: return 'Sound';
    }
  };
  
  const playSlotSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slot.currentLetter) {
      audioService.playPhonemeSound(slot.currentLetter.toLowerCase() as any);
    } else {
      audioService.playPhonemeSound(slot.phoneme);
    }
  };
  
  const { currentLetter, isCorrect } = slot;

  return (
    <div 
      ref={ref}
      onClick={currentLetter && isCorrect !== true ? onRemove : undefined}
      className={`
        relative w-24 h-32 md:w-32 md:h-44 rounded-[2.5rem] border-4 flex flex-col items-center justify-between 
        transition-all duration-300 select-none
        ${currentLetter 
          ? isCorrect === true 
            ? 'bg-emerald-500 border-emerald-300 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105'
            : isCorrect === false
              ? 'bg-rose-500 border-rose-300 text-white shadow-lg animate-shake'
              : 'bg-white border-slate-200 text-slate-800 shadow-md'
          : 'bg-slate-50 border-slate-200 border-dashed text-slate-200'
        }
        ${isHovered && !currentLetter ? 'border-teal-400 bg-teal-50 scale-110 rotate-1' : ''}
        ${isHighlighted ? 'ring-8 ring-teal-300 ring-offset-4 ring-offset-white' : ''}
        ${isShaking ? 'animate-shake' : ''}
        ${currentLetter && isCorrect !== true ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        borderColor: currentLetter && isCorrect === null ? characterColor : (isHovered ? characterColor : undefined)
      }}
    >
      <div className="pt-4 text-center">
        <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${settings.dyslexicFont ? 'dyslexic-font' : ''}`}>
          {getSlotLabel(slot.position)}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <span className={`text-5xl md:text-7xl font-black ${settings.dyslexicFont ? 'dyslexic-font' : ''}`}>
          {currentLetter || '?'}
        </span>
      </div>
      
      {isCorrect === true && (
        <div className="absolute -top-3 -right-3 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl border-4 border-emerald-100 animate-pop z-30">
          <span className="text-2xl">✅</span>
        </div>
      )}

      {isCorrect === false && (
        <div className="absolute -top-3 -right-3 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl border-4 border-rose-100 animate-pop z-30">
          <span className="text-2xl">❌</span>
        </div>
      )}

      <button 
        onClick={playSlotSound}
        className={`mb-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${currentLetter ? 'bg-white/20 hover:bg-white/40' : 'bg-slate-200/50 hover:bg-slate-200'}
        `}
      >
        <span className="text-xs">🔊</span>
      </button>
    </div>
  );
});

WordSlot.displayName = 'WordSlot';

export default WordSlot;
