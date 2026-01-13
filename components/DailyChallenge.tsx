
import React, { useState, useEffect } from 'react';
import { CharacterType, Task } from '../types';
import { audioService } from '../services/audioService';
import { geminiService } from '../services/gemini';
import MultipleChoice from './GameEngine/gameModes/MultipleChoice';

interface DailyChallengeProps {
  characterType: CharacterType;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ characterType, onComplete, onExit }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const plan = await geminiService.generatePhonicsPlan('PHONEMIC_AWARENESS', 'Jester', 'Fun Daily Guide', 'NORMAL');
        if (plan && plan.length > 0) {
          setTask(plan[0]);
        }
      } catch (err) {
        console.error("Daily task failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadTask();
    audioService.speak("Ho ho! Time for the Jester's Daily Challenge! Are you ready for double stars?", characterType);
  }, [characterType]);

  const handleSelect = (idx: number) => {
    if (!task || feedback) return;
    const isCorrect = idx === task.correctIndex;
    setFeedback(isCorrect ? 'CORRECT' : 'WRONG');
    
    if (isCorrect) {
      audioService.playEffect('correct');
      setTimeout(() => onComplete(100), 2000);
    } else {
      audioService.playEffect('wrong');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-amber-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-8xl animate-bounce">🤡</div>
        <p className="text-amber-800 font-black uppercase mt-4 italic">Jester is juggling the tasks...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-amber-100 flex flex-col items-center justify-center p-6 z-50 overflow-hidden">
      <div className="max-w-3xl w-full bg-white rounded-[4rem] p-10 shadow-2xl border-[12px] border-amber-400 text-center relative">
        <button onClick={onExit} className="absolute top-4 right-8 text-4xl text-amber-200 hover:text-amber-400">✕</button>
        <div className="absolute -top-12 -left-12 text-9xl animate-float">🤡</div>
        
        <header className="mb-10">
          <span className="bg-amber-400 text-white px-8 py-2 rounded-full font-black uppercase italic tracking-tighter text-2xl shadow-xl">Jester's Daily Challenge</span>
          <p className="mt-4 text-amber-800 font-bold uppercase text-xs tracking-widest opacity-60">Restore the kingdom's joy!</p>
        </header>

        {task && (
          <MultipleChoice
            task={task}
            characterType={characterType}
            settings={{ speechRate: 1, dyslexicFont: false, highContrast: false, difficulty: 'NORMAL' as any }}
            feedback={feedback}
            visual={null}
            visualLoading={false}
            onSelect={handleSelect}
            onHear={(text) => audioService.speak(text, characterType)}
          />
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
