
import React, { useState, useEffect } from 'react';
import { SkillLevel, CharacterType, Task } from '../types';
import { audioService } from '../services/audioService';
import MultipleChoice from './GameEngine/gameModes/MultipleChoice';

interface PlacementAssessmentProps {
  onComplete: (score: number, level: SkillLevel) => void;
  characterType: CharacterType;
}

const PLACEMENT_TASKS: Task[] = [
  {
    prompt: "Which word starts with the sound /b/?",
    options: ["Cat", "Ball", "Dog"],
    correctIndex: 1,
    type: 'MULTIPLE_CHOICE'
  },
  {
    prompt: "Which word ends with the sound /at/?",
    options: ["Hat", "Hen", "Hot"],
    correctIndex: 0,
    type: 'MULTIPLE_CHOICE'
  },
  {
    prompt: "Can you spell the word CAT?",
    options: ["C-A-T", "K-A-T", "C-O-T"],
    correctIndex: 0,
    type: 'MULTIPLE_CHOICE'
  }
];

const PlacementAssessment: React.FC<PlacementAssessmentProps> = ({ onComplete, characterType }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  useEffect(() => {
    audioService.speak("Let's see how much you already know!", characterType);
  }, [characterType]);

  const handleSelect = (idx: number) => {
    if (feedback) return;
    const isCorrect = idx === PLACEMENT_TASKS[index].correctIndex;
    setFeedback(isCorrect ? 'CORRECT' : 'WRONG');
    if (isCorrect) {
      setScore(s => s + 1);
      audioService.playEffect('correct');
    } else {
      audioService.playEffect('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < PLACEMENT_TASKS.length) {
        setIndex(index + 1);
      } else {
        // Determine starting level based on score
        const finalScore = score + (isCorrect ? 1 : 0);
        let level = SkillLevel.PHONEMIC_AWARENESS;
        if (finalScore === 3) level = SkillLevel.LETTER_SOUNDS;
        if (finalScore === 2) level = SkillLevel.PHONEMIC_AWARENESS;
        onComplete(finalScore, level);
      }
    }, 1500);
  };

  return (
    <div className="h-full bg-sky-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-teal-100 text-center">
        <header className="mb-8">
          <span className="text-teal-600 font-black uppercase text-xs tracking-widest">Placement Quest</span>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
            <div 
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / PLACEMENT_TASKS.length) * 100}%` }}
            />
          </div>
        </header>

        <MultipleChoice
          task={PLACEMENT_TASKS[index]}
          characterType={characterType}
          settings={{ speechRate: 1, dyslexicFont: false, highContrast: false, difficulty: 'NORMAL' as any }}
          feedback={feedback}
          visual={null}
          visualLoading={false}
          onSelect={handleSelect}
          onHear={(text) => audioService.speak(text, characterType)}
        />
      </div>
    </div>
  );
};

export default PlacementAssessment;
