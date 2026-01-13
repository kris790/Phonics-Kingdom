
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../../../services/audioService';
import { getWordImage } from '../../../utils/phonicsResources';
import DraggableLetter from './DraggableLetter';
import WordSlot from './WordSlot';
import BaseGameMode from './BaseGameMode';
import { Task, CharacterType, UserSettings, PhonicsSound, SlotState } from '../../../types';
import './styles/CVCWordBuilder.css';

interface CVCWordBuilderProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings;
  feedback: 'CORRECT' | 'WRONG' | null;
  onAnswer: (index: number) => void;
  onHear: (text: string) => void;
}

interface LetterItem {
  id: string;
  char: string;
  isUsed: boolean;
}

const CVCWordBuilder: React.FC<CVCWordBuilderProps> = ({ 
  task, characterType, settings, feedback, onAnswer, onHear 
}) => {
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [availableLetters, setAvailableLetters] = useState<LetterItem[]>([]);
  const [wordImage, setWordImage] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [highlightedSlotIdx, setHighlightedSlotIdx] = useState<number | null>(null);
  const [hintLetterId, setHintLetterId] = useState<string | null>(null);
  
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hintTimerRef = useRef<number | null>(null);

  const resetHintTimer = useCallback(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setHintLetterId(null);
    
    hintTimerRef.current = window.setTimeout(() => {
      const firstEmptySlot = slots.find(s => s.currentLetter === null);
      if (firstEmptySlot) {
        const correctLetterItem = availableLetters.find(l => l.char.toLowerCase() === firstEmptySlot.expectedLetter && !l.isUsed);
        if (correctLetterItem) {
          setHintLetterId(correctLetterItem.id);
        }
      }
    }, 10000);
  }, [slots, availableLetters]);

  useEffect(() => {
    if (!task.targetWord || task.targetWord.length < 3) return;
    
    const targetWord = task.targetWord.toLowerCase();
    const letters = targetWord.split('');
    
    const initialSlots: SlotState[] = [
      { id: 0, position: 'initial', expectedLetter: letters[0], currentLetter: null, isCorrect: null, phoneme: letters[0] as PhonicsSound },
      { id: 1, position: 'middle', expectedLetter: letters[1], currentLetter: null, isCorrect: null, phoneme: letters[1] as PhonicsSound },
      { id: 2, position: 'final', expectedLetter: letters[2], currentLetter: null, isCorrect: null, phoneme: letters[2] as PhonicsSound }
    ];
    
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const distractors = alphabet
      .filter(l => !letters.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allChars = [...letters, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((char, i) => ({
        id: `letter-${char}-${i}`,
        char: char.toUpperCase(),
        isUsed: false
      }));
    
    setAvailableLetters(allChars);
    setSlots(initialSlots);
    setHoveredSlot(null);
    setActiveDragId(null);
    setHighlightedSlotIdx(null);
    setHintLetterId(null);

    const loadAssets = async () => {
      const img = await getWordImage(targetWord);
      setWordImage(img);
    };
    loadAssets();
    
    onHear(`Build the word: ${targetWord}`);
    resetHintTimer();

    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [task.targetWord, onHear, resetHintTimer]);

  const handleDragMove = useCallback((x: number, y: number) => {
    let currentHover: number | null = null;
    slotRefs.current.forEach((ref, idx) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          currentHover = idx;
        }
      }
    });
    setHoveredSlot(currentHover);
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setActiveDragId(id);
    resetHintTimer();
  }, [resetHintTimer]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    let dropIdx: number | null = null;
    slotRefs.current.forEach((ref, idx) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          dropIdx = idx;
        }
      }
    });

    const letter = availableLetters.find(l => l.id === id);
    if (dropIdx !== null && slots[dropIdx].currentLetter === null && letter) {
      const isLetterCorrect = letter.char.toLowerCase() === slots[dropIdx].expectedLetter;
      const newSlots = [...slots];
      newSlots[dropIdx] = { 
        ...newSlots[dropIdx], 
        currentLetter: letter.char,
        isCorrect: isLetterCorrect 
      };
      setSlots(newSlots);

      if (isLetterCorrect) {
        audioService.playEffect('pop');
      } else {
        audioService.playEffect('wrong');
      }
      
      setAvailableLetters(prev => prev.map(l => l.id === id ? { ...l, isUsed: true } : l));
      audioService.playPhonemeSound(letter.char.toLowerCase() as PhonicsSound);

      if (newSlots.every(s => s.currentLetter !== null)) {
        const formedWord = newSlots.map(s => s.currentLetter!.toLowerCase()).join('');
        const target = task.targetWord?.toLowerCase();
        
        if (formedWord === target) {
          onAnswer(task.correctIndex);
        } else {
          onAnswer(-1); 
          setTimeout(() => {
            setSlots(prev => prev.map(s => s.isCorrect === false ? { ...s, currentLetter: null, isCorrect: null } : s));
            setAvailableLetters(prev => {
              const wrongLetters = newSlots.filter(s => s.isCorrect === false).map(s => s.currentLetter);
              let tempWrong = [...wrongLetters];
              return prev.map(l => {
                if (tempWrong.includes(l.char) && l.isUsed) {
                  const idx = tempWrong.indexOf(l.char);
                  tempWrong.splice(idx, 1);
                  return { ...l, isUsed: false };
                }
                return l;
              });
            });
          }, 1500);
        }
      }
    }

    setActiveDragId(null);
    setHoveredSlot(null);
    resetHintTimer();
  }, [availableLetters, slots, task, onAnswer, resetHintTimer]);

  const clearSlot = useCallback((index: number) => {
    if (feedback !== null || slots[index].currentLetter === null) return;
    
    const charToReturn = slots[index].currentLetter;
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], currentLetter: null, isCorrect: null };
    setSlots(newSlots);

    let marked = false;
    setAvailableLetters(prev => prev.map(l => {
      if (!marked && l.char === charToReturn && l.isUsed) {
        marked = true;
        return { ...l, isUsed: false };
      }
      return l;
    }));
    resetHintTimer();
  }, [slots, feedback, resetHintTimer]);

  const playSequentialSoundOut = async () => {
    const letters = task.targetWord?.split('') || [];
    for (let i = 0; i < letters.length; i++) {
      setHighlightedSlotIdx(i);
      audioService.playPhonemeSound(letters[i] as any);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setHighlightedSlotIdx(null);
  };

  const getCharacterColor = () => {
    const colors = { BRIO: '#2dd4bf', VOWELIA: '#a855f7', DIESEL: '#eab308', ZIPPY: '#ef4444' };
    return colors[characterType] || '#14b8a6';
  };

  return (
    <BaseGameMode
      task={task}
      characterType={characterType}
      settings={settings}
      feedback={feedback}
      header={
        <div className="bg-white border-4 border-slate-100 p-6 md:p-10 rounded-[3rem] shadow-xl w-full text-center relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            {wordImage && (
              <div className="w-24 h-24 md:w-36 md:h-36 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 p-2 flex items-center justify-center shadow-inner overflow-hidden group hover:scale-105 transition-transform">
                <img src={wordImage} alt={task.targetWord} className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="flex gap-4">
              {slots.map((slot, i) => (
                <WordSlot
                  key={i}
                  slot={slot}
                  isHovered={hoveredSlot === i}
                  isHighlighted={highlightedSlotIdx === i}
                  isShaking={feedback === 'WRONG' && slot.isCorrect === false}
                  onRemove={() => clearSlot(i)}
                  characterColor={getCharacterColor()}
                  settings={settings}
                  ref={(el) => { slotRefs.current[i] = el; }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => onHear(`Build the word: ${task.targetWord}`)} className="bg-slate-50 text-slate-500 px-8 py-3 rounded-full font-black uppercase text-xs border-2 border-slate-100 flex items-center gap-2">
              <span className="text-lg">🔊</span> Hear Word
            </button>
            <button onClick={playSequentialSoundOut} className="bg-teal-50 text-teal-600 px-8 py-3 rounded-full font-black uppercase text-xs border-2 border-teal-100 flex items-center gap-2">
              <span className="text-lg">✨</span> Sound Out
            </button>
          </div>
        </div>
      }
    >
      <div className="mt-12 bg-white/50 p-8 rounded-[3rem] border-4 border-dashed border-slate-200">
        <h3 className="text-center font-black text-slate-400 uppercase text-[10px] tracking-widest mb-6">Your Letter Bank</h3>
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto select-none relative">
          {availableLetters.map((l) => (
            <div key={l.id} className={hintLetterId === l.id ? 'hint-pulse rounded-3xl' : ''}>
              <DraggableLetter
                id={l.id}
                letter={l.char}
                phoneme={l.char.toLowerCase() as PhonicsSound}
                isUsed={l.isUsed}
                isDisabled={feedback !== null}
                characterColor={getCharacterColor()}
                settings={settings}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            </div>
          ))}
        </div>
      </div>
    </BaseGameMode>
  );
};

export default CVCWordBuilder;
