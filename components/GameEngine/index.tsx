
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ActivityProps, Task, GameSession } from '../../types';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useAdaptiveAI } from './hooks/useAdaptiveAI';
import { usePhonicsGame } from './hooks/usePhonicsGame';
import { getAdaptiveSettings, getPromptScaffolding } from '../../utils/difficultyScaler';
import { geminiService } from '../../services/gemini';
import { PHONEME_SOUNDS } from '../../data/phonemeSounds';

import GameHeader from './GameHeader';
import GameLoadingScreen from './GameLoadingScreen';
import GameCompleteScreen from './GameCompleteScreen';
import GameModeRouter from './GameModeRouter';

const TutorBubble: React.FC<{ text: string; char: string; mouthHint?: string; onDismiss: () => void }> = ({ text, char, mouthHint, onDismiss }) => (
  <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[80] w-full max-w-lg px-4 animate-pop">
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-teal-100 flex flex-col gap-4 relative">
      <div className="flex items-start gap-6">
        <div className="text-5xl shrink-0">{char === 'BRIO' ? '🎙️' : char === 'VOWELIA' ? '✨' : char === 'DIESEL' ? '🏗️' : '🚀'}</div>
        <div className="flex-1">
          <p className="text-xl font-black text-slate-800 leading-tight italic">"{text}"</p>
          {mouthHint && (
            <div className="mt-4 bg-teal-50 p-4 rounded-2xl border-2 border-teal-100 flex items-center gap-3 animate-pulse">
              <span className="text-3xl">👄</span>
              <div className="flex-1">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Mouth Position Hint</p>
                <p className="text-xs font-bold text-teal-800 italic leading-snug">{mouthHint}</p>
              </div>
            </div>
          )}
          <button onClick={onDismiss} className="mt-4 text-teal-600 font-black uppercase text-xs tracking-widest hover:text-teal-400">I'm ready! →</button>
        </div>
      </div>
      <div className="absolute -bottom-4 left-12 w-8 h-8 bg-white border-r-4 border-b-4 border-teal-100 rotate-45"></div>
    </div>
  </div>
);

const GameEngine: React.FC<ActivityProps> = ({ skill, characterType, onComplete, onExit, settings }) => {
  const [currentVisual, setCurrentVisual] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [tutorAdvice, setTutorAdvice] = useState<string | null>(null);
  const [mouthHint, setMouthHint] = useState<string | undefined>(undefined);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState<number | null>(null);
  const [finalPasses, setFinalPasses] = useState(0);
  const hintCountRef = useRef(0);
  const startTime = useRef(Date.now());

  const { 
    tasks, currentIndex, setCurrentIndex, currentTask, errorStreak, 
    handleAnswer, isReady 
  } = usePhonicsGame(skill, characterType, settings);

  const adaptiveSettings = useMemo(() => getAdaptiveSettings(settings, errorStreak), [settings, errorStreak]);
  
  const { speak } = useAudioEngine(characterType, adaptiveSettings);
  const { generateVisual } = useAdaptiveAI(skill, characterType, settings);

  const loadTaskAssets = useCallback(async (task: Task) => {
    if (!task) return;
    setCurrentVisual(null);
    setTutorAdvice(null);
    setMouthHint(undefined);
    
    if (task.narrative) await speak(task.narrative, 'normal');

    const scaffoldedPrompt = getPromptScaffolding(task.prompt, errorStreak);
    speak(scaffoldedPrompt, errorStreak > 0 ? 'encouraging' : 'normal');
    
    if (errorStreak >= 3 && task.targetSound) {
      const phoneme = PHONEME_SOUNDS[task.targetSound.toLowerCase()];
      if (phoneme) {
        setMouthHint(phoneme.mouthAction);
        hintCountRef.current += 1;
      }
    }

    if (task.type !== 'TRACING' && task.type !== 'VOICE_LAB' && navigator.onLine) {
      const visual = await generateVisual(task.prompt);
      setCurrentVisual(visual);
    }
  }, [speak, errorStreak, generateVisual]);

  useEffect(() => {
    if (isReady && currentTask) {
      loadTaskAssets(currentTask);
    }
  }, [currentIndex, isReady, currentTask, loadTaskAssets]);

  const onChoice = async (index: number) => {
    if (feedback !== null || !currentTask || isFinishing) return;
    
    const isCorrect = index === currentTask.correctIndex;
    const result = handleAnswer(isCorrect);
    
    setFeedback(isCorrect ? 'CORRECT' : 'WRONG');

    if (!isCorrect && navigator.onLine) {
      const chosenText = currentTask.options[index] || "that sound";
      const targetText = currentTask.targetSound || currentTask.targetWord || "the right sound";
      
      const advice = await geminiService.analyzeMistake(characterType, targetText, chosenText);
      setTutorAdvice(advice);
      hintCountRef.current += 1;
      
      if (errorStreak >= 2 && currentTask.targetSound) {
        const phoneme = PHONEME_SOUNDS[currentTask.targetSound.toLowerCase()];
        if (phoneme) {
          speak(`${advice} Remember: ${phoneme.mouthAction}`, 'encouraging');
          setMouthHint(phoneme.mouthAction);
        } else {
          speak(advice, 'encouraging');
        }
      } else {
        speak(advice, 'encouraging');
      }
    } else {
      const feedbackText = isCorrect ? "Sparkling!" : "Try again, Sound Scout!";
      speak(feedbackText, isCorrect ? 'excited' : 'encouraging');
    }

    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        setTutorAdvice(null);
        setMouthHint(undefined);
        if (result.isLastTask) {
          setFinalAccuracy(result.finalAccuracy);
          
          let nextPasses = skill.successivePasses;
          if (result.finalAccuracy >= 85) {
            const isNewDay = !skill.lastAttemptAt || (new Date(Date.now()).toDateString() !== new Date(skill.lastAttemptAt).toDateString());
            if (isNewDay || skill.successivePasses === 0) {
              nextPasses = Math.min(3, skill.successivePasses + 1);
            }
          }
          setFinalPasses(nextPasses);
          setIsFinishing(true);
        } else {
          setCurrentIndex(result.nextIndex);
        }
      }
    }, isCorrect ? 1500 : 5000);
  };

  const handleQuestExit = () => {
    const elapsed = Date.now() - startTime.current;
    if (finalAccuracy !== null) {
      // Fix: Added missing seedsEarned to GameSession to satisfy type requirement
      const session: GameSession = {
        id: `session_${Date.now()}`,
        skillId: skill.id,
        startTime: startTime.current,
        endTime: Date.now(),
        accuracy: finalAccuracy,
        tasksCompleted: tasks.length,
        errorStreak: errorStreak,
        hintCount: hintCountRef.current,
        avgResponseTime: elapsed / tasks.length,
        starsEarned: finalAccuracy >= 85 ? 30 : finalAccuracy >= 60 ? 10 : 2,
        shardsEarned: (finalAccuracy >= 85 && finalPasses === 3 && !skill.isMastered) ? 1 : 0,
        seedsEarned: finalAccuracy >= 90 ? 10 : finalAccuracy >= 70 ? 5 : 1
      };
      onComplete(finalAccuracy, skill.id, elapsed, session);
    } else {
      onExit();
    }
  };

  if (!isReady || tasks.length === 0) return <GameLoadingScreen characterType={characterType} />;
  if (isFinishing && finalAccuracy !== null) return (
    <GameCompleteScreen 
      accuracy={finalAccuracy} 
      skillId={skill.id}
      successivePasses={finalPasses}
      onExit={handleQuestExit} 
      earnedShard={finalAccuracy >= 85 && finalPasses === 3 && !skill.isMastered} 
    />
  );

  return (
    <div className={`flex flex-col h-full overflow-hidden relative transition-all duration-500 bg-slate-50`}>
      <GameHeader 
        currentIndex={currentIndex + 1}
        totalTasks={tasks.length}
        onExit={onExit}
        characterType={characterType}
        narrative={currentTask?.narrative}
      />

      {tutorAdvice && (
        <TutorBubble text={tutorAdvice} char={characterType} mouthHint={mouthHint} onDismiss={() => setTutorAdvice(null)} />
      )}

      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full p-4 md:p-8 relative z-10">
        <GameModeRouter 
          task={currentTask}
          characterType={characterType}
          settings={adaptiveSettings}
          feedback={feedback}
          visual={currentVisual}
          visualLoading={false}
          onAnswer={onChoice}
          onHear={(text) => speak(text)}
          onHint={() => {
            speak("Listen for the sound again!");
            hintCountRef.current += 1;
          }}
          onCompleteTracing={() => onChoice(currentTask.correctIndex)}
        />
      </main>
    </div>
  );
};

export default GameEngine;