
import React from 'react';
import { CharacterType } from '../types';

interface CharacterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: CharacterType) => void;
  currentType: CharacterType;
}

const CharacterSelectorModal: React.FC<CharacterSelectorModalProps> = ({ isOpen, onClose, onSelect, currentType }) => {
  if (!isOpen) return null;

  const characters: CharacterType[] = ['BRIO', 'VOWELIA', 'DIESEL', 'ZIPPY'];

  const getIcon = (type: CharacterType) => {
    switch (type) {
      case 'BRIO': return '🎙️';
      case 'VOWELIA': return '✨';
      case 'DIESEL': return '🏗️';
      case 'ZIPPY': return '🚀';
      default: return '👤';
    }
  };

  const getAvatarUrl = (type: CharacterType) => {
    const seed = type.charAt(0) + type.slice(1).toLowerCase();
    const colors: Record<CharacterType, string> = {
      BRIO: '2dd4bf',
      VOWELIA: 'a855f7',
      DIESEL: 'f59e0b',
      ZIPPY: 'ef4444'
    };
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=${colors[type]}`;
  };

  const getColorClass = (type: CharacterType) => {
    switch (type) {
      case 'BRIO': return 'border-teal-500 bg-teal-50 ring-4 ring-teal-100';
      case 'VOWELIA': return 'border-purple-500 bg-purple-50 ring-4 ring-purple-100';
      case 'DIESEL': return 'border-yellow-500 bg-yellow-50 ring-4 ring-yellow-100';
      case 'ZIPPY': return 'border-red-500 bg-red-50 ring-4 ring-red-100';
      default: return 'border-slate-100';
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full shadow-2xl border-t-[12px] border-teal-500 animate-pop overflow-y-auto max-h-[90vh]">
        <h2 className="text-4xl font-black text-slate-800 mb-10 text-center uppercase italic tracking-tighter">
          Choose Your Sound Scout
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {characters.map((type) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`p-6 rounded-[2.5rem] border-4 flex flex-col items-center gap-6 transition-all hover:scale-[1.02] active:scale-95 hover-shake group ${
                currentType === type ? getColorClass(type) : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                  <img src={getAvatarUrl(type)} alt={type} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white w-12 h-12 rounded-2xl shadow-xl border-2 border-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {getIcon(type)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl opacity-40">{getIcon(type)}</span>
                  <p className="font-black text-slate-800 uppercase text-2xl tracking-tight italic leading-none">{type}</p>
                  <span className="text-xl opacity-40">{getIcon(type)}</span>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                  {type === 'BRIO' && 'Beatbox Master'}
                  {type === 'VOWELIA' && 'Magic Weaver'}
                  {type === 'DIESEL' && 'Sound Builder'}
                  {type === 'ZIPPY' && 'Rhyme Racer'}
                </p>
              </div>
            </button>
          ))}
        </div>
        <button 
          onClick={onClose} 
          className="mt-10 w-full py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors border-2 border-slate-200 hover-shake"
        >
          Return to Kingdom
        </button>
      </div>
    </div>
  );
};

export default CharacterSelectorModal;
