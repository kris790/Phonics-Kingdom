import React, { useEffect, useState } from 'react';
import { voiceControl } from '../services/voiceControl';

interface VoiceIndicatorProps {
  isListening: boolean;
  intensity: number;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening, intensity }) => {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsThinking(voiceControl.getIsThinking());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className={`
        flex items-center gap-4 px-6 py-4 rounded-[2.5rem] border-4 transition-all duration-500
        ${isThinking ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.5)] scale-110' : 
          isListening ? 'bg-white border-teal-400 shadow-2xl scale-100' : 'opacity-0 scale-90'}
      `}>
        <div className="relative">
          <div className={`absolute inset-0 bg-teal-400 rounded-full blur-md transition-all duration-75`} style={{ opacity: isThinking ? 0 : intensity * 3 }}></div>
          <span className={`text-2xl relative z-10 transition-transform ${isThinking ? 'animate-spin' : ''}`}>
            {isThinking ? '🌀' : '🎙️'}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase leading-none tracking-widest ${isThinking ? 'text-indigo-100' : 'text-teal-600'}`}>
            {isThinking ? 'Thinking...' : 'Navigator Active'}
          </span>
          <span className={`text-xs font-bold italic ${isThinking ? 'text-indigo-200' : 'text-slate-500'}`}>
            {isThinking ? 'Changing Realm...' : 'Try "Go to Map"'}
          </span>
        </div>
        
        {/* Dynamic Volume Visualizer */}
        {!isThinking && (
          <div className="flex gap-1.5 h-6 items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`w-1.5 rounded-full transition-all duration-75 ${intensity * 5 >= i ? 'bg-teal-400' : 'bg-slate-200'}`}
                style={{ height: `${20 + (intensity * 10 >= i ? 80 : 0)}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceIndicator;