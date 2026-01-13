
import { useState, useCallback, useEffect } from 'react';
import { SkillNode, CharacterType, Task } from '../types';
import { generateLocalTasks } from '../utils/taskGenerator';
import { geminiService } from '../services/gemini';

// Removed unused onComplete parameter to fix type mismatch with ActivityProps in GameEngine
export const usePhonicsGame = (
  skill: SkillNode, 
  characterType: CharacterType
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const generateTasksLocally = useCallback(() => {
    const localTasks = generateLocalTasks(skill);
    setTasks(localTasks);
    setIsReady(true);
    return localTasks;
  }, [skill]);

  const enhanceWithAI = useCallback(async (localTasks: Task[]) => {
    if (!navigator.onLine) return;
    try {
      const characterName = characterType.charAt(0) + characterType.slice(1).toLowerCase();
      const characterRole = characterType === 'ZIPPY' ? 'Rhyme Racer' : 'Sound Specialist';
      const difficulty = skill.attempts > 3 && skill.accuracy < 50 ? "EASY" : "NORMAL";

      const aiTasks = await geminiService.generatePhonicsPlan(
        skill.level, 
        characterName, 
        characterRole,
        difficulty
      );
      
      if (aiTasks && aiTasks.length > 0) {
        // Prefer AI for variety, but keep local as backup
        setTasks(aiTasks.slice(0, 5));
      }
    } catch (error) {
      console.warn('AI enhancement failed, relying on local tasks');
    }
  }, [skill, characterType]);

  useEffect(() => {
    const local = generateTasksLocally();
    enhanceWithAI(local);
  }, [skill.id]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    let newScore = score;
    let newStreak = errorStreak;

    if (isCorrect) {
      newScore += 1;
      newStreak = 0;
    } else {
      newStreak += 1;
    }

    setScore(newScore);
    setErrorStreak(newStreak);

    const isLastTask = currentIndex + 1 >= tasks.length;
    const finalAccuracy = isLastTask ? (newScore / tasks.length) * 100 : 0;

    return {
      isCorrect,
      isLastTask,
      nextIndex: isLastTask ? currentIndex : currentIndex + 1,
      finalAccuracy
    };
  }, [currentIndex, score, errorStreak, tasks.length]);

  return { 
    tasks, 
    currentIndex, 
    setCurrentIndex,
    currentTask: tasks[currentIndex], 
    score, 
    errorStreak, 
    handleAnswer, 
    isReady 
  };
};
