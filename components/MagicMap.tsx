
import React, { useEffect, useState, useMemo } from 'react';
import { SkillNode, CharacterType, UserProfile } from '../types';
import { audioService } from '../services/audioService';

interface MagicMapProps {
  nodes: SkillNode[];
  onNodeSelect: (node: SkillNode) => void;
  stars: number;
  characterType: CharacterType;
  profile: UserProfile;
  onOpenSelector: () => void;
  onDailyChallenge: () => void;
  onChat: () => void;
}

const PHONICS_ICONS: Record<CharacterType, string> = {
  BRIO: '🎙️',
  VOWELIA: '✨',
  DIESEL: '🏗️',
  ZIPPY: '🚀'
};

const BIOME_DECOR: Record<string, { color: string; bg: string; props: string[]; title: string; restoredEmoji: string; altImg?: string }> = {
  's1': { color: 'from-teal-100 to-teal-300', bg: 'bg-teal-50', props: ['🎵', '🎧', '🎸', '🎹'], title: 'Beatbox Basin', restoredEmoji: '🎷' },
  's2': { color: 'from-orange-100 to-orange-300', bg: 'bg-orange-50', props: ['🚜', '🏗️', '🚧', '🔩'], title: 'Consonant Quarry', restoredEmoji: '🏛️' },
  's3': { color: 'from-purple-100 to-purple-300', bg: 'bg-purple-50', props: ['🌸', '⛰️', '🦋', '🍄'], title: 'Vowel Valley', restoredEmoji: '🌋' },
  's4': { color: 'from-indigo-100 to-indigo-300', bg: 'bg-indigo-50', props: ['🏘️', '🌈', '🏰', '🛡️'], title: 'Echo Canyon', restoredEmoji: '💒' },
  's5': { color: 'from-rose-100 to-rose-300', bg: 'bg-rose-50', props: ['🧵', '🪄', '💎', '🧶'], title: 'Word Weaver Isle', restoredEmoji: '🎡' },
  's6': { color: 'from-red-100 to-red-300', bg: 'bg-red-50', props: ['🏁', '🚩', '🚦', '🏎️'], title: 'Zippy\'s Speedway', restoredEmoji: '🏎️' }
};

const AMBIENT_WORLD_DECOR = [
  { x: 10, y: 15, emoji: '☁️', size: 'text-6xl', delay: '0s' },
  { x: 85, y: 80, emoji: '☁️', size: 'text-8xl', delay: '2s' },
  { x: 50, y: 20, emoji: '☁️', size: 'text-5xl', delay: '4s' },
  { x: 25, y: 50, emoji: '✨', size: 'text-3xl', delay: '1s' },
  { x: 75, y: 45, emoji: '✨', size: 'text-4xl', delay: '3s' },
  { x: 40, y: 90, emoji: '🎶', size: 'text-2xl', delay: '5s' },
];

const MagicMap: React.FC<MagicMapProps> = ({ nodes, onNodeSelect, stars, characterType, profile, onOpenSelector, onDailyChallenge, onChat }) => {
  const activeNode = nodes.find(n => !n.isLocked && !n.isMastered) || nodes.find(n => !n.isLocked);
  const isVehicle = characterType === 'DIESEL' || characterType === 'ZIPPY';
  const [greeted, setGreeted] = useState(false);
  const [displayGreeting, setDisplayGreeting] = useState("");

  const getDynamicGreeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    const playerName = profile.playerName || "Scout";

    switch(characterType) {
      case 'BRIO':
        return `Yo ${playerName}! Good ${timeOfDay}. Ready to drop some beats and find sounds?`;
      case 'DIESEL':
        return `Hey ${playerName}! It's a great ${timeOfDay} for digging up new consonants!`;
      case 'VOWELIA':
        return `A magical ${timeOfDay} to you, ${playerName}. Shall we weave some vowel magic?`;
      case 'ZIPPY':
        return `Speedy ${timeOfDay}, ${playerName}! Zipping into the next quest! Catch me if you can!`;
      default:
        return `Welcome back, ${playerName}. Ready for your quest?`;
    }
  }, [characterType, profile.playerName]);

  useEffect(() => {
    if (!greeted) {
      setDisplayGreeting(getDynamicGreeting);
      audioService.speak(getDynamicGreeting, characterType);
      setGreeted(true);
    }
  }, [greeted, getDynamicGreeting, characterType]);

  // Reset greeting flag if character changes so they greet again
  useEffect(() => {
    setGreeted(false);
  }, [characterType]);

  const handleNodeClick = (node: SkillNode) => {
    audioService.stop();
    onNodeSelect(node);
  };

  const handleLockedClick = (node: SkillNode) => {
    audioService.speak(`The Static Scrambler is hiding the ${node.title}! Practice more to clear the way!`, characterType);
  };

  const dailyDone = useMemo(() => {
    if (!profile.lastDailyChallenge) return false;
    const lastDate = new Date(profile.lastDailyChallenge).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
  }, [profile.lastDailyChallenge]);

  const restoredCount = nodes.filter(n => n.isMastered).length;
  const progressPercent = (restoredCount / nodes.length) * 100;

  return (
    <div className="relative w-full h-full track-bg overflow-hidden bg-sky-50 transition-all duration-1000 flex flex-col">
      {/* Top HUD (AppBar style) */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-teal-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-teal-600 bg-teal-100 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
             <span className="text-xl">🏰</span>
          </div>
          <h1 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">Phonics Kingdom</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border-2 border-teal-50">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-500 text-lg drop-shadow-sm">⭐</span>
            <p className="text-xs font-black text-slate-700">{stars}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 text-lg drop-shadow-sm">💎</span>
            <p className="text-xs font-black text-slate-700">{profile.totalSoundShards || 0}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-700 text-lg drop-shadow-sm">🌱</span>
            <p className="text-xs font-black text-slate-700">{profile.totalMagicSeeds || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden mt-16">
        {/* Character Greeting Overlay (at top of map) */}
        <div className="absolute top-8 left-8 z-40 max-w-sm animate-pop">
           <div className="bg-white/90 backdrop-blur-md p-4 rounded-[2.5rem] border-4 border-teal-100 shadow-2xl flex items-center gap-4">
              <div 
                onClick={onOpenSelector}
                className={`w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden cursor-pointer hover:scale-110 transition-transform ${isVehicle ? 'animate-vehicle' : 'animate-float'}`}
                style={{ backgroundColor: BIOME_DECOR['s1'].bg.replace('bg-', '') }}
              >
                 <span className="text-5xl flex items-center justify-center h-full">{PHONICS_ICONS[characterType]}</span>
              </div>
              <div className="flex-1">
                 <p className="text-sm font-black text-slate-800 leading-tight">Hey! I'm {characterType}!</p>
                 <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-snug mt-1">{displayGreeting}</p>
              </div>
           </div>
        </div>

        {/* Ambient World Decor */}
        <div className="absolute inset-0 pointer-events-none">
          {AMBIENT_WORLD_DECOR.map((item, i) => (
            <div 
              key={i} 
              className={`absolute ${item.size} opacity-20 animate-drift`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, animationDelay: item.delay }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Connection Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d={`M ${nodes.map(n => `${n.coordinates.x}%,${n.coordinates.y}%`).join(' L ')}`}
            style={{ strokeDasharray: '20, 20', strokeWidth: '20', stroke: '#cbd5e1', fill: 'none' }}
          />
          <path
            d={`M ${nodes.filter(n => !n.isLocked).map(n => `${n.coordinates.x}%,${n.coordinates.y}%`).join(' L ')}`}
            className="transition-all duration-1000"
            style={{ 
              strokeWidth: '16', 
              stroke: '#2dd4bf', 
              fill: 'none', 
              strokeLinecap: 'round', 
              filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.6))' 
            }}
          />
        </svg>

        {/* Nodes / Biomes */}
        {nodes.map((node) => {
          const decor = BIOME_DECOR[node.id] || BIOME_DECOR['s1'];
          const isActive = activeNode?.id === node.id;
          const mastered = node.isMastered;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-700"
              style={{ left: `${node.coordinates.x}%`, top: `${node.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-40 h-24 md:w-64 md:h-36 bg-gradient-to-b ${decor.color} rounded-[50%] opacity-60 blur-sm absolute -z-10 translate-y-12 md:translate-y-16 animate-sway`} />
              
              <button
                onClick={() => node.isLocked ? handleLockedClick(node) : handleNodeClick(node)}
                className={`relative group transition-all duration-500 transform hover:scale-110 active:scale-95 z-10 ${node.isLocked ? 'cursor-default' : 'cursor-pointer hover-shake'}`}
              >
                <div className={`w-28 h-28 md:w-44 md:h-44 rounded-[3.5rem] flex flex-col items-center justify-end p-4 border-[6px] shadow-2xl transition-all duration-500 overflow-hidden relative
                  ${mastered ? 'bg-emerald-400 border-white ring-[12px] ring-emerald-100/50 scale-105' : 'bg-white border-teal-500'}
                  ${node.isLocked ? 'bg-slate-200 border-slate-300 grayscale' : 'hover:rotate-3'}
                  ${isActive ? 'ring-[16px] ring-teal-400/30' : ''}
                `}>
                  
                  {/* The actual island visual */}
                  <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYMtxI9Y3Y6OJMPzVMh1pxuwOXmtM8kMrHDGPEwnYgurnFQ-ZBx8OMWZnDT5-kJMWLPazPGt8urIZV3baQqNDy_RrrsOFep2G3iZBIWtW5O3IwqVEn3cLPINhUQSHChT595BvGrdA7Z1D3I8mOwtxHbsxJpl1cw7EosaNvq1x13C_-A5EbbzvTyI7SM1Ys8DdzRPlqE3m8CESHN_Jf44BCSUAwW2QlAd3V-lmaacnJGRQGv5FnPFngUpiDoY69ZCbCz_M829HLMw')` }}></div>

                  {node.isLocked && (
                    <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-[10px] font-black text-slate-400 shadow-sm flex items-center gap-1 z-20">
                      🔒 LOCKED
                    </div>
                  )}

                  {!node.isLocked && mastered && (
                    <div className="absolute top-3 left-3 flex gap-0.5 z-20">
                       <span className="text-yellow-400 text-xs">⭐</span>
                       <span className="text-yellow-400 text-xs">⭐</span>
                       <span className="text-yellow-400 text-xs">⭐</span>
                    </div>
                  )}

                  <div className="relative text-6xl md:text-8xl mb-2 z-10 drop-shadow-md">
                    {node.isLocked ? '🌫️' : mastered ? decor.restoredEmoji : decor.props[0]}
                  </div>

                  <div className="z-20 w-full text-center">
                    <p className={`text-[10px] font-black uppercase tracking-tighter leading-none mb-1 ${mastered ? 'text-white' : 'text-slate-400'}`}>
                      {node.title}
                    </p>
                    {isActive && !mastered && (
                       <div className="flex gap-2 justify-center mb-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-white ${node.successivePasses >= i ? 'bg-teal-500 scale-110' : 'bg-slate-200'}`} />
                          ))}
                       </div>
                    )}
                  </div>
                </div>

                {isActive && !mastered && (
                  <div className="absolute -top-4 -right-4 bg-teal-500 text-white w-14 h-14 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-3xl animate-bounce z-20">
                    ▶️
                  </div>
                )}
              </button>
            </div>
          );
        })}

        {/* Active Scout Marker */}
        {activeNode && (
          <div className="absolute z-30 transition-all duration-1000 ease-in-out pointer-events-none" style={{ left: `${activeNode.coordinates.x}%`, top: `${activeNode.coordinates.y}%`, transform: 'translate(-50%, -100%)' }}>
            <div className="flex flex-col items-center mb-20 md:mb-28">
               <div className={`text-9xl md:text-[12rem] drop-shadow-2xl ${isVehicle ? 'animate-vehicle' : 'animate-float'}`}>
                 {PHONICS_ICONS[characterType]}
               </div>
               <div className="w-24 h-4 bg-black/10 blur-xl rounded-full mt-[-20px] animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Kingdom Footer HUD */}
      <div className="p-6 bg-white/90 backdrop-blur-xl border-t-4 border-teal-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex-1 w-full max-w-md">
              <div className="flex items-center justify-between mb-2 px-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="text-teal-500">📈</span> Restoration Progress
                 </p>
                 <p className="text-[10px] font-black text-teal-600 uppercase">{restoredCount} / {nodes.length} Biomes</p>
              </div>
              <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden border-2 border-white shadow-inner">
                 <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-1000 rounded-full shadow-lg" style={{ width: `${progressPercent}%` }}></div>
              </div>
           </div>

           <div className="flex gap-4">
              {!dailyDone && (
                <button 
                  onClick={onDailyChallenge}
                  className="bg-amber-400 text-white px-8 py-3 rounded-full shadow-xl border-4 border-white animate-bounce flex items-center gap-4 hover:scale-105 active:scale-95"
                >
                  <span className="text-3xl">🤡</span>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-black uppercase opacity-80">Daily Quest</span>
                    <span className="text-lg font-black uppercase italic">Jester</span>
                  </div>
                </button>
              )}
              <button 
                onClick={onChat}
                className="bg-teal-500 text-white px-8 py-3 rounded-full shadow-xl border-4 border-white flex items-center gap-4 hover:scale-105 active:scale-95"
              >
                <span className="text-3xl">{PHONICS_ICONS[characterType]}</span>
                <div className="text-left leading-none">
                  <span className="block text-[8px] font-black uppercase opacity-80">Chat Mode</span>
                  <span className="text-lg font-black uppercase italic">Talk</span>
                </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MagicMap;
