
import React, { useState, useEffect, useRef } from 'react';
import { CharacterType, SkillNode, GameSession } from '../types';
import { geminiService } from '../services/gemini';
import { audioService } from '../services/audioService';

interface CharacterChatProps {
  characterType: CharacterType;
  playerName: string;
  nodes: SkillNode[];
  sessions: GameSession[];
  onExit: () => void;
}

const CharacterChat: React.FC<CharacterChatProps> = ({ characterType, playerName, nodes, sessions, onExit }) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const sessionPromiseRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  const startChat = async () => {
    setIsListening(true);
    const mastered = nodes.filter(n => n.isMastered).map(n => n.title).join(', ');
    const sharedCtx = geminiService.getContext();

    try {
      const sessionPromise = geminiService.connectLive({
        systemInstruction: `You are ${characterType} from Phonics Kingdom. You are talking to ${playerName}.
        Progress Summary: They have mastered ${mastered || 'no sounds yet'}. They have played ${sessions.length} quests.
        Your goal is to be an encouraging friend. Ask how they are doing, praise their progress, and give a tiny tip about phonics if appropriate. Keep responses short and child-friendly.`,
        voiceName: characterType === 'VOWELIA' ? 'Puck' : characterType === 'ZIPPY' ? 'Zephyr' : 'Kore',
        callbacks: {
          onAudio: (buffer) => {
            const source = sharedCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(sharedCtx.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, sharedCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
          },
          onOpen: () => {
            console.log("Chat session opened");
            sessionPromise.then(s => s.sendRealtimeInput({ text: "Hey! Let's talk!" }));
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

      scriptProcessor.onaudioprocess = (e) => {
        if (!sessionPromiseRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        const instantVolume = Math.sqrt(sum / inputData.length);
        setVolume(v => (v * 0.7) + (instantVolume * 0.3));

        const base64 = geminiService.encodePCM(inputData);
        sessionPromiseRef.current.then((session: any) => {
          session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
        });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);

    } catch (err) {
      console.error("Chat error", err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sessionPromiseRef.current) sessionPromiseRef.current.then((s: any) => s.close());
      if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    };
  }, []);

  const getCharIcon = () => {
    switch (characterType) {
      case 'BRIO': return '🎙️';
      case 'DIESEL': return '🏗️';
      case 'VOWELIA': return '✨';
      case 'ZIPPY': return '🚀';
      default: return '👤';
    }
  };

  return (
    <div className="fixed inset-0 bg-teal-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-50">
      <div className="max-w-2xl w-full bg-white rounded-[4rem] p-10 shadow-2xl border-[12px] border-white text-center relative overflow-hidden">
        <button onClick={onExit} className="absolute top-6 right-10 text-4xl text-slate-200 hover:text-slate-400">✕</button>
        
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className={`text-[12rem] relative z-10 transition-transform duration-100`} style={{ transform: `scale(${1 + volume})` }}>
            {getCharIcon()}
          </div>
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase italic">Talk to {characterType}</h2>
        <p className="text-slate-500 font-bold mb-10 leading-relaxed max-w-sm mx-auto">
          {isListening ? "I'm listening! Tell me about your day in the Kingdom." : `Ready to chat with your hero, ${playerName}?`}
        </p>

        {!isListening ? (
          <button 
            onClick={startChat}
            className="bg-teal-500 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Start Talking
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 h-12 items-end">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-teal-400 rounded-full transition-all duration-75"
                  style={{ height: `${20 + Math.random() * (volume * 200)}%` }}
                />
              ))}
            </div>
            <p className="text-teal-600 font-black animate-pulse">MIC ACTIVE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterChat;
