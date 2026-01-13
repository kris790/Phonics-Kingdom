import { useState, useCallback, useEffect } from 'react';
import { SkillNode, CharacterType, Task, UserSettings, DifficultyLevel } from '../../../types';
import { generateLocalTasks } from '../../../utils/taskGenerator';
import { geminiService } from '../../../services/gemini';
import { mergeTasks } from '../utils/phonicsRules';

export const usePhonicsGame = (
  skill: SkillNode, 
  characterType: CharacterType,
  settings: UserSettings
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const hydrateLocal = useCallback(() => {
    const localTasks = generateLocalTasks(skill);
    setTasks(localTasks);
    setIsReady(true);
    return localTasks;
  }, [skill]);

  const enhanceWithAI = useCallback(async (baseTasks: Task[]) => {
    if (!navigator.onLine || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const charName = characterType.charAt(0) + characterType.slice(1).toLowerCase();
      
      let finalDifficulty = settings.difficulty as string;
      if (errorStreak >= 2) {
        finalDifficulty = DifficultyLevel.EASY;
      } else if (skill.attempts > 3 && skill.accuracy < 50) {
        finalDifficulty = DifficultyLevel.EASY;
      }

      const aiTasks = await geminiService.generatePhonicsPlan(
        skill.level, 
        charName, 
        'Phonics Specialist',
        finalDifficulty
      );
      
      if (aiTasks && aiTasks.length > 0) {
        setTasks(mergeTasks(baseTasks, aiTasks));
      }
    } catch (error) {
      console.warn('AI enhancement failed, using local tasks.');
    } finally {
      setIsEnhancing(false);
    }
  }, [skill, characterType, isEnhancing, settings.difficulty, errorStreak]);

  useEffect(() => {
    const local = hydrateLocal();
    enhanceWithAI(local);
    setCurrentIndex(0);
    setScore(0);
    setErrorStreak(0);
  }, [skill.id, settings.difficulty]); // Re-fetch tasks if difficulty changes mid-session

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
    currentTask: tasks[currentIndex] || null, 
    score, 
    errorStreak, 
    handleAnswer, 
    isReady,
    isEnhancing
  };
};