
import React, { useEffect, useState, useMemo } from 'react';
import { audioService } from '../../services/audioService';

interface GameCompleteScreenProps {
  accuracy: number;
  skillId: string;
  successivePasses: number; // Current passes after this session
  onExit: () => void;
  earnedShard?: boolean;
}

const Confetti: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            backgroundColor: ['#2dd4bf', '#a855f7', '#f59e0b', '#ef4444', '#10b981'][Math.floor(Math.random() * 5)],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
};

const GameCompleteScreen: React.FC<GameCompleteScreenProps> = ({ accuracy, successivePasses, onExit, earnedShard = false }) => {
  const [showShard, setShowShard] = useState(false);
  const isMastered = successivePasses >= 3;
  const isPass = accuracy >= 85;

  useEffect(() => {
    const timer = setTimeout(() => {
        if (earnedShard) {
          setShowShard(true);
          audioService.playEffect('correct');
          audioService.speak("Legendary! You've mastered this sound!", 'ZIPPY');
        } else if (isPass) {
          audioService.playEffect('correct');
          audioService.speak(`Success! That's ${successivePasses} out of 3 days towards mastery!`, 'BRIO');
        } else {
          audioService.speak("Great effort, Sound Scout! Practice makes progress.", 'DIESEL');
        }
    }, 800);
    return () => clearTimeout(timer);
  }, [earnedShard, isPass, successivePasses]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-indigo-900/95 backdrop-blur-xl z-[100] p-6 text-center">
      {isMastered && <Confetti />}
      
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border-[12px] border-white max-w-xl w-full animate-pop overflow-hidden relative">
        
        {/* Animated Background Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-50 via-white to-white opacity-50 animate-pulse"></div>

        <div className="relative z-10">
            <div className="text-[8rem] md:text-[10rem] mb-6 animate-bounce">
              {isMastered ? '👑' : isPass ? '⭐' : '💪'}
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">
              {isMastered ? 'MASTERED!' : isPass ? 'SUCCESS!' : 'KEEP GOING!'}
            </h2>
            <p className="text-teal-600 font-black uppercase tracking-widest text-sm mb-10">
              {isMastered ? 'Biome Restored' : isPass ? 'Progress Gained' : 'Quest Attempted'}
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1 bg-teal-50 rounded-3xl p-6 border-2 border-teal-100 transition-all hover:scale-105">
                    <div className="text-[10px] font-black text-teal-800 uppercase mb-1">Session Accuracy</div>
                    <div className="text-5xl font-black text-teal-600">{Math.round(accuracy)}%</div>
                </div>

                <div className="flex-1 bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 transition-all hover:scale-105">
                    <div className="text-[10px] font-black text-amber-800 uppercase mb-1">Mastery Progress</div>
                    <div className="flex justify-center gap-2 mt-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${successivePasses >= i ? 'bg-amber-400 scale-125' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                </div>
            </div>

            {earnedShard && (
                <div className={`mb-10 bg-indigo-50 rounded-3xl p-8 border-4 border-indigo-200 transition-all duration-1000 transform ${showShard ? 'scale-110 rotate-3 shadow-xl' : 'scale-0 opacity-0'}`}>
                    <div className="text-[10px] font-black text-indigo-800 uppercase mb-2">Sound Shard Restored!</div>
                    <div className="text-7xl flex justify-center animate-pulse">💎</div>
                </div>
            )}

            <button 
              onClick={onExit}
              className="w-full py-6 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-2xl shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              Continue Adventure
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteScreen;
