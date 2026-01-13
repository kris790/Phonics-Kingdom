
import React, { useState, useEffect } from 'react';
import { CharacterType } from '../../types';

interface GameLoadingScreenProps {
  characterType: CharacterType;
}

const PHONICS_ICONS: Record<string, string> = {
  BRIO: '🎙️', VOWELIA: '✨', DIESEL: '🏗️', ZIPPY: '🚀'
};

const LOADING_MESSAGES = [
  "Whispering to the Sound Spirits...",
  "Summoning the Word Weaver...",
  "Polishing the Sound Shards...",
  "Clearing the Static Scrambler's fog...",
  "Powering up the Beatbox Basin...",
  "Digging deep for new sounds...",
  "Zipping into the Word Zone..."
];

const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({ characterType }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-teal-50 z-50 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2dd4bf20_0%,_transparent_70%)] animate-pulse"></div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-teal-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="animate-float text-[12rem] relative z-10 filter drop-shadow-2xl">
          {PHONICS_ICONS[characterType]}
        </div>
        
        {/* Orbiting particles */}
        {[...Array(6)].map((_, i) => (
           <div 
             key={i} 
             className="absolute w-4 h-4 bg-teal-400 rounded-full blur-sm"
             style={{
               top: '50%',
               left: '50%',
               animation: `spin ${3 + i}s linear infinite`,
               transformOrigin: `${50 + (i * 20)}px ${50 + (i * 10)}px`
             }}
           />
        ))}
      </div>

      <div className="mt-16 text-center px-10 relative z-20">
        <p className="text-4xl font-black text-teal-900 tracking-tight uppercase italic mb-4 animate-pop">
          {LOADING_MESSAGES[msgIdx]}
        </p>
        <div className="w-64 h-3 bg-slate-200 rounded-full mx-auto overflow-hidden border-2 border-white shadow-inner">
           <div className="h-full bg-teal-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        <p className="mt-6 text-teal-600 font-bold uppercase text-[10px] tracking-[0.3em] opacity-60">
          Preparing your phonics adventure
        </p>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0%; transform: translateX(100%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GameLoadingScreen;
