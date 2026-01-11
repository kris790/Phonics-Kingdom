// GameModeRouter - Routes to appropriate task UI based on task type
import React from 'react';
import { Task } from '../../types';
import { LetterSoundTask } from './tasks/LetterSoundTask';
import { WordBuilderTask } from './tasks/WordBuilderTask';
import { RhymeTimeTask } from './tasks/RhymeTimeTask';
import { SoundMatchTask } from './tasks/SoundMatchTask';
import { MultipleChoiceTask } from './tasks/MultipleChoiceTask';
import { SkyfallShooterTask } from './tasks/SkyfallShooterTask';
import { LetterTraceTask } from './tasks/LetterTraceTask';
import { WordCompleteTask } from './tasks/WordCompleteTask';

interface GameModeRouterProps {
  task: Task;
  onAnswer: (answerId: string) => void;
  disabled?: boolean;
}

export const GameModeRouter: React.FC<GameModeRouterProps> = ({
  task,
  onAnswer,
  disabled = false,
}) => {
  const commonProps = {
    task,
    onAnswer,
    disabled,
  };

  switch (task.type) {
    case 'letter-sound':
      return <LetterSoundTask {...commonProps} />;
    
    case 'word-builder':
      return <WordBuilderTask {...commonProps} />;
    
    case 'rhyme-time':
      return <RhymeTimeTask {...commonProps} />;
    
    case 'sound-match':
      return <SoundMatchTask {...commonProps} />;
    
    case 'skyfall-shooter':
      return <SkyfallShooterTask {...commonProps} />;
    
    case 'letter-trace':
      return <LetterTraceTask {...commonProps} />;
    
    case 'word-complete':
    case 'fill-blank':
      return <WordCompleteTask {...commonProps} />;
    
    default:
      // Default to multiple choice for any unsupported types
      return <MultipleChoiceTask {...commonProps} />;
  }
};
