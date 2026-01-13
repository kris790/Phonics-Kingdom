
import React, { useEffect, useState } from 'react';
import { CharacterType } from '../types';
import { audioService } from '../services/audioService';

interface WorldIntroProps {
  characterType: CharacterType;
  playerName: string;
  onComplete: () => void;
}

const WorldIntro: React.FC<WorldIntroProps> = ({ characterType, playerName, onComplete }) => {
  const [step, setStep] = useState(0);

  const script = [
    `Welcome to Soundia, ${playerName}! It used to be a land of perfect rhymes...`,
    `But the Static Scrambler has arrived and broken all the bridges!`,
    `We need your help to restore the sounds and save the kingdom.`,
    `Let's start by clearing the fog in the Letter Lagoon!`
  ];

  useEffect(() => {
    audioService.speak(script[step], characterType);
  }, [step]);

  const handleNext = () => {
    if (step + 1 < script.length) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Static Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:10px_10px] animate-pulse"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 animate-pop">
        <div className="text-[10rem] mb-10 filter drop-shadow-[0_0_50px_rgba(45,212,191,0.5)] animate-float">
          {characterType === 'BRIO' ? '🎙️' : characterType === 'VOWELIA' ? '✨' : characterType === 'DIESEL' ? '🏗️' : '🚀'}
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border-4 border-white/20 p-12 rounded-[4rem] shadow-2xl mb-12">
          <p className="text-3xl font-black text-white leading-tight italic">
            "{script[step]}"
          </p>
        </div>

        <button
          onClick={handleNext}
          className="bg-teal-500 text-white px-16 py-6 rounded-[3rem] font-black uppercase text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          {step === script.length - 1 ? "Save the Kingdom!" : "Next →"}
        </button>
      </div>

      {/* The Scrambler Peek */}
      <div className="absolute top-10 right-10 text-8xl opacity-10 grayscale animate-drift">🌪️</div>
      <div className="absolute bottom-10 left-10 text-8xl opacity-10 grayscale animate-drift" style={{ animationDelay: '2s' }}>⚡</div>
    </div>
  );
};

export default WorldIntro;
