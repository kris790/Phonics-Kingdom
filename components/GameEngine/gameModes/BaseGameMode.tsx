import React from 'react';
import { Task } from '../utils/phonicsRules';
import { CharacterType, UserSettings } from '../../../types';

interface BaseGameModeProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings;
  children: React.ReactNode;
  header?: React.ReactNode;
  feedback?: 'CORRECT' | 'WRONG' | null;
}

const BaseGameMode: React.FC<BaseGameModeProps> = ({ 
  children, 
  header, 
  feedback 
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-6 animate-pop relative">
      {header && <div className="w-full z-10">{header}</div>}
      
      <div className="w-full transition-all duration-300">
        {children}
      </div>

      {/* Shared Feedback Layer for consistent game-feel across modes */}
      {feedback && (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-all duration-500 ${
          feedback === 'CORRECT' ? 'bg-emerald-500/10' : 'bg-red-500/10'
        } backdrop-blur-[2px]`}>
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-[12px] border-white animate-pop text-center">
            <div className="text-[10rem] mb-4">
              {feedback === 'CORRECT' ? '✨' : '☁️'}
            </div>
            <h3 className={`text-5xl font-black uppercase italic ${
              feedback === 'CORRECT' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {feedback === 'CORRECT' ? 'Sparkling!' : 'Static!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseGameMode;
