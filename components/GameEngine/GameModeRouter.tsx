
import React from 'react';
import { Task } from './utils/phonicsRules';
import { CharacterType, UserSettings } from '../../types';
import RhymeRacer from './gameModes/RhymeRacer';
import WordWeaver from './gameModes/WordWeaver';
import CVCWordBuilder from './gameModes/CVCWordBuilder';
import SoundSorter from './gameModes/SoundSorter';
import MultipleChoice from './gameModes/MultipleChoice';
import TracingCanvas from './gameModes/TracingCanvas';
import SonicTracing from './gameModes/SonicTracing';
import VoiceLab from './gameModes/VoiceLab';
import SkyfallShooter from './gameModes/SkyfallShooter';

interface GameModeRouterProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings;
  feedback: 'CORRECT' | 'WRONG' | null;
  visual: string | null;
  visualLoading: boolean;
  onAnswer: (index: number) => void;
  onHear: (text: string) => void;
  onHint: () => void;
  onCompleteTracing: () => void;
}

const PHONICS_COLORS: Record<string, string> = {
  BRIO: '#2dd4bf', VOWELIA: '#a855f7', DIESEL: '#eab308', ZIPPY: '#ef4444'
};

const GameModeRouter: React.FC<GameModeRouterProps> = ({
  task, characterType, settings, feedback, visual, visualLoading,
  onAnswer, onHear, onHint, onCompleteTracing
}) => {
  if (task.type === 'VOICE_LAB') {
    return (
      <VoiceLab 
        task={task}
        characterType={characterType}
        settings={settings}
        feedback={feedback}
        onAnswer={onAnswer}
      />
    );
  }

  if (task.type === 'SKYFALL_SHOOTER') {
    return (
      <SkyfallShooter 
        task={task}
        characterType={characterType}
        settings={settings}
        feedback={feedback}
        onAnswer={onAnswer}
        onHear={onHear}
      />
    );
  }

  if (task.type === 'SOUND_SORTER') {
    return (
      <SoundSorter 
        targetSound={task.targetSound || 'b'}
        options={task.options}
        correctIndex={task.correctIndex}
        feedback={feedback}
        onSelect={onAnswer}
        onHear={onHear}
        characterType={characterType}
        settings={settings}
      />
    );
  }

  if (task.type === 'RHYME_RACER') {
    return (
      <RhymeRacer 
        targetWord={task.targetWord!}
        options={task.options}
        feedback={feedback}
        selectedIndex={null}
        onSelect={onAnswer}
        onHear={onHear}
        dyslexicFont={settings.dyslexicFont}
        visual={visual}
        visualLoading={visualLoading}
      />
    );
  }

  if (task.type === 'WORD_WEAVER') {
    return (
      <WordWeaver 
        wordParts={task.wordParts || []}
        options={task.options}
        feedback={feedback}
        onSelect={onAnswer}
      />
    );
  }

  if (task.type === 'CVC_BUILDER') {
    return (
      <CVCWordBuilder 
        task={task}
        characterType={characterType}
        settings={settings}
        feedback={feedback}
        onAnswer={onAnswer}
        onHear={onHear}
      />
    );
  }

  if (task.type === 'TRACING') {
    return (
      <div className="w-full max-w-2xl mx-auto h-[500px]">
        {navigator.onLine ? (
          <SonicTracing 
            letter={task.letterToTrace || 'A'} 
            color={PHONICS_COLORS[characterType]} 
            onComplete={onCompleteTracing}
            characterType={characterType}
          />
        ) : (
          <TracingCanvas 
            letter={task.letterToTrace || 'A'} 
            color={PHONICS_COLORS[characterType]} 
            onComplete={onCompleteTracing} 
          />
        )}
      </div>
    );
  }

  return (
    <MultipleChoice 
      task={task}
      characterType={characterType}
      settings={settings}
      feedback={feedback}
      visual={visual}
      visualLoading={visualLoading}
      onSelect={onAnswer}
      onHear={onHear}
    />
  );
};

export default GameModeRouter;
