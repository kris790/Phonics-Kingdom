
import React, { useState } from 'react';
import { CharacterType } from '../types';

interface OnboardingFlowProps {
  onComplete: (name: string, character: CharacterType) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'NAME' | 'CHARACTER'>('NAME');
  const [name, setName] = useState('');
  const [character, setCharacter] = useState<CharacterType>('BRIO');

  const characters: { type: CharacterType; icon: string; name: string; color: string }[] = [
    { type: 'BRIO', icon: '🎙️', name: 'Brio', color: 'bg-teal-500' },
    { type: 'VOWELIA', icon: '✨', name: 'Vowelia', color: 'bg-purple-500' },
    { type: 'DIESEL', icon: '🏗️', name: 'Diesel', color: 'bg-amber-500' },
    { type: 'ZIPPY', icon: '🚀', name: 'Zippy', color: 'bg-rose-500' },
  ];

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) setStep('CHARACTER');
  };

  return (
    <div className="h-full flex items-center justify-center p-6 bg-teal-50">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl max-w-xl w-full border-t-[12px] border-teal-500 animate-pop">
        {step === 'NAME' ? (
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-800 mb-6 uppercase italic tracking-tighter">What is your Name, Sound Scout?</h2>
            <form onSubmit={handleNameSubmit} className="space-y-8">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name..."
                className="w-full text-center text-4xl font-black p-6 rounded-[2rem] border-4 border-slate-100 focus:border-teal-500 outline-none transition-all bg-slate-50"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-6 bg-teal-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-2xl shadow-xl shadow-teal-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                Next →
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">Choose Your Hero, {name}!</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {characters.map((char) => (
                <button
                  key={char.type}
                  onClick={() => setCharacter(char.type)}
                  className={`p-6 rounded-[2.5rem] border-4 transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-3 ${
                    character === char.type ? 'border-teal-500 bg-teal-50' : 'border-slate-100'
                  }`}
                >
                  <span className="text-6xl">{char.icon}</span>
                  <span className="font-black text-slate-700 uppercase">{char.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(name, character)}
              className="w-full py-6 bg-teal-500 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-2xl shadow-xl shadow-teal-100 hover:scale-105 active:scale-95 transition-all"
            >
              Start My Quest!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
