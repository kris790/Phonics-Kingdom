
import React, { useState, useEffect, useRef } from 'react';
import BaseGameMode from './BaseGameMode';
import { Task, CharacterType, UserSettings } from '../../../types';
import { geminiService } from '../../../services/gemini';
import { PHONEME_SOUNDS } from '../../../data/phonemeSounds';

interface VoiceLabProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings;
  feedback: 'CORRECT' | 'WRONG' | null;
  onAnswer: (index: number) => void;
}

const VoiceLab: React.FC<VoiceLabProps> = ({ task, characterType, settings, feedback, onAnswer }) => {
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [volume, setVolume] = useState(0);
  const [aiFeedbackText, setAiFeedbackText] = useState<string | null>(null);
  
  const sessionPromiseRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);

  const phonemeData = task.targetSound ? PHONEME_SOUNDS[task.targetSound.toLowerCase()] : null;

  const startSession = async () => {
    setIsListening(true);
    setIsEvaluating(false);
    setAiFeedbackText(null);

    try {
      const mouthHint = phonemeData ? phonemeData.mouthAction : "Try to say the sound clearly.";
      const sharedCtx = geminiService.getContext();

      const sessionPromise = geminiService.connectLivePhonics({
        onAudio: (buffer) => {
          const source = sharedCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(sharedCtx.destination);
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, sharedCtx.currentTime);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
        },
        onInterruption: () => {
          nextStartTimeRef.current = 0;
        },
        onPhonemeEvaluated: (isCorrect, text) => {
          setIsEvaluating(false);
          setAiFeedbackText(text);
          setTimeout(() => {
            onAnswer(isCorrect ? task.correctIndex : -1);
          }, 2500);
        }
      });

      sessionPromiseRef.current = sessionPromise;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        if (isEvaluating || !sessionPromiseRef.current) return;
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

      sessionPromise.then((session) => {
        session.sendRealtimeInput({ 
          text: `Hey Sound Scout! Brio here. Let's practice /${task.targetSound}/. ${mouthHint}` 
        });
      });

    } catch (err) {
      console.error("Voice Lab Connection Error:", err);
      setIsListening(false);
    }
  };

  const handleFinish = () => {
    if (!sessionPromiseRef.current) return;
    setIsEvaluating(true);
    setIsListening(false);
    sessionPromiseRef.current.then((session: any) => {
      session.sendRealtimeInput({ text: "I'm finished! How was my sound?" });
    });
  };

  useEffect(() => {
    return () => {
      if (sessionPromiseRef.current) sessionPromiseRef.current.then((s: any) => s.close());
      if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    };
  }, []);

  return (
    <BaseGameMode
      task={task}
      characterType={characterType}
      settings={settings}
      feedback={feedback}
      header={
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 w-full text-center relative overflow-hidden min-h-[500px] flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 transition-all duration-700" 
            style={{ 
              backgroundColor: isListening ? '#2dd4bf' : isEvaluating ? '#a855f7' : '#f8fafc',
              transform: isListening ? `scale(${1 + volume})` : 'scale(1)'
            }}
          ></div>
          <div className="relative z-10">
            <div className="mb-10 flex justify-center">
              <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-150 relative ${isListening ? 'voice-orb-active' : ''}`}
                style={{ backgroundColor: isListening ? '#2dd4bf' : isEvaluating ? '#a855f7' : '#cbd5e1', transform: `scale(${1 + volume * 2})` }}>
                <span className="text-9xl">{isEvaluating ? '🧠' : isListening ? '🎙️' : '👂'}</span>
              </div>
            </div>
            <h2 className="text-5xl font-black text-slate-800 mb-4">{task.prompt}</h2>
            {aiFeedbackText && <p className="text-teal-900 font-black italic text-2xl mb-6">"{aiFeedbackText}"</p>}
            {!isListening && !isEvaluating ? (
              <button onClick={startSession} className="bg-teal-500 text-white px-16 py-8 rounded-[3rem] font-black uppercase text-3xl shadow-2xl hover:scale-105 active:scale-95">Start Recording</button>
            ) : isListening ? (
              <button onClick={handleFinish} className="bg-rose-500 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xl shadow-xl active:scale-95">Finish Recording</button>
            ) : (
              <div className="animate-pulse text-purple-600 font-black">Analyzing...</div>
            )}
          </div>
        </div>
      }
    >
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mouth Move</p>
          <p className="text-slate-800 font-bold">{phonemeData?.mouthAction || "Say the sound clearly!"}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Examples</p>
          <div className="flex flex-wrap gap-2">{phonemeData?.exampleWords.map(w => <span key={w} className="bg-teal-50 px-3 py-1 rounded-lg text-teal-700 font-bold">{w}</span>)}</div>
        </div>
      </div>
    </BaseGameMode>
  );
};

export default VoiceLab;
