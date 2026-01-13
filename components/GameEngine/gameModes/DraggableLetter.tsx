
import React, { useState, useRef } from 'react';
import { PhonicsSound, UserSettings } from '../../../types';
import { audioService } from '../../../services/audioService';

interface DraggableLetterProps {
  id: string;
  letter: string;
  phoneme: PhonicsSound;
  isUsed: boolean;
  isDisabled: boolean;
  characterColor: string;
  settings: UserSettings;
  onDragStart: (id: string) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const DraggableLetter: React.FC<DraggableLetterProps> = ({ 
  id, letter, phoneme, isUsed, isDisabled, characterColor, settings,
  onDragStart, onDragMove, onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDisabled || isUsed) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    onDragStart(id);
    audioService.playPhonemeSound(letter.toLowerCase() as any);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setPosition({ x: dx, y: dy });
    onDragMove(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    onDragEnd(id, e.clientX, e.clientY);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`
        w-20 h-20 md:w-24 md:h-24 rounded-3xl border-4 text-4xl md:text-5xl font-black shadow-lg 
        flex items-center justify-center transition-all duration-75 select-none touch-none
        ${settings.dyslexicFont ? 'dyslexic-font' : ''}
        ${isUsed ? 'opacity-0 scale-50 pointer-events-none' : 'bg-white border-slate-100 text-slate-700'}
        ${isDragging ? 'z-[200] cursor-grabbing rotate-6 scale-125 border-teal-500 text-teal-600 shadow-2xl' : 'cursor-grab'}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: isDragging ? 'relative' : 'static',
        borderColor: isDragging ? characterColor : undefined
      }}
    >
      <div className="flex flex-col items-center">
        {letter}
      </div>
    </div>
  );
};

export default DraggableLetter;
