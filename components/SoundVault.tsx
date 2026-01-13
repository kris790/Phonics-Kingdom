
import React, { useState } from 'react';
import { SkillNode, PhonicsSound, MasteredGuardian } from '../types';
import { audioService } from '../services/audioService';
import { geminiService } from '../services/gemini';

interface SoundVaultProps {
  nodes: SkillNode[];
  guardians: Record<string, MasteredGuardian>;
  onSaveGuardian: (g: MasteredGuardian) => void;
  onClose: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GuardianModal: React.FC<{ 
  sound: string; 
  guardian: MasteredGuardian | null; 
  loading: boolean; 
  onClose: () => void 
}> = ({ sound, guardian, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-pop">
      <div className="bg-white rounded-[4rem] max-w-lg w-full overflow-hidden shadow-2xl border-[12px] border-white relative">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-slate-100 hover:bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center font-black text-slate-500">✕</button>
        
        {loading ? (
          <div className="p-20 text-center">
            <div className="text-9xl mb-8 animate-bounce">⚡</div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2">Summoning...</h3>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Waking the Guardian of {sound}</p>
          </div>
        ) : guardian ? (
          <div className="flex flex-col">
            <div className="h-[400px] w-full bg-slate-100 relative group overflow-hidden">
              <img src={guardian.imageUrl} alt={guardian.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                 <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">Sound Shard Restored</span>
                 <h2 className="text-4xl font-black text-white italic tracking-tighter mt-2">{guardian.name}</h2>
              </div>
            </div>
            <div className="p-10 text-center">
              <p className="text-xl font-bold text-slate-700 leading-relaxed italic mb-8">"{guardian.lore}"</p>
              <button 
                onClick={() => audioService.speak(`Behold, ${guardian.name}. ${guardian.lore}`, 'VOWELIA')}
                className="bg-indigo-600 text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                🔊 Listen to Lore
              </button>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <p className="text-red-500 font-black">Summoning Failed! Check your link to Soundia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SoundVault: React.FC<SoundVaultProps> = ({ nodes, guardians, onSaveGuardian, onClose }) => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [loadingGuardian, setLoadingGuardian] = useState(false);

  const masteredLetters = nodes
    .filter(n => n.isMastered)
    .map(n => n.title.match(/\/(.+)\//)?.[1]?.toUpperCase() || '');

  const handleSelectSound = async (letter: string) => {
    const soundKey = letter.toLowerCase();
    const isMastered = masteredLetters.includes(letter);
    
    if (!isMastered) {
      audioService.playPhonemeSound(soundKey as PhonicsSound);
      return;
    }

    // Mastered logic
    setSelectedSound(letter);
    if (!guardians[soundKey]) {
      setLoadingGuardian(true);
      try {
        const guardian = await geminiService.generateGuardian(soundKey);
        onSaveGuardian({ ...guardian, sound: letter });
      } catch (err) {
        console.error("Summoning error", err);
      } finally {
        setLoadingGuardian(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12">
      {selectedSound && (
        <GuardianModal 
          sound={selectedSound} 
          guardian={guardians[selectedSound.toLowerCase()] || null} 
          loading={loadingGuardian}
          onClose={() => setSelectedSound(null)}
        />
      )}

      <div className="bg-white rounded-[4rem] w-full max-w-5xl h-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border-[12px] border-white ring-[24px] ring-white/5">
        
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-6 md:p-12 flex justify-between items-center text-white">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none mb-2">Guardian Bestiary</h2>
            <p className="text-teal-100 font-bold uppercase tracking-widest text-[10px] md:text-xs">Master sounds to summon the Guardians</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 md:w-20 md:h-20 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-2xl md:text-4xl transition-all active:scale-90"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-50">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3 md:gap-6">
            {ALPHABET.map((letter) => {
              const isFound = masteredLetters.includes(letter);
              const soundKey = letter.toLowerCase();
              const hasGuardian = !!guardians[soundKey];
              
              return (
                <button 
                  key={letter} 
                  onClick={() => handleSelectSound(letter)}
                  className="flex flex-col items-center gap-2 group outline-none"
                >
                  <div className={`
                    w-full aspect-[3/4] rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black transition-all duration-300 relative
                    ${isFound 
                      ? 'bg-gradient-to-br from-teal-400 to-indigo-600 text-white shadow-xl shadow-teal-200 scale-105 rotate-2 hover:rotate-0 hover:scale-110 ring-4 ring-white' 
                      : 'bg-white text-slate-300 border-4 border-slate-100 hover:border-teal-200 hover:text-teal-300 scale-95'
                    }
                  `}>
                    <div className="relative z-10">{letter}</div>
                    {isFound && hasGuardian && <div className="absolute top-2 right-2 text-xs">✨</div>}
                    {isFound && <div className="absolute inset-0 blur-xl opacity-40 bg-white animate-pulse"></div>}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isFound ? 'text-teal-600' : 'text-slate-300 group-hover:text-teal-400'}`}>
                    {isFound ? (hasGuardian ? 'Guardian' : 'Summon!') : 'Locked'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 border-t-4 border-slate-50 text-center">
            <div className="inline-flex items-center gap-4 bg-teal-50 px-8 py-3 rounded-full border-2 border-teal-100">
                <span className="text-2xl animate-bounce">💎</span>
                <p className="text-teal-900 font-black uppercase italic text-xs md:text-sm">
                  {masteredLetters.length} / 26 Sound Guardians Collected
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SoundVault;
