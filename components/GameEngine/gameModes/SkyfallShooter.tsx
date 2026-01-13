
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, CharacterType, UserSettings, PhonicsSound } from '../../../types';
import { audioService } from '../../../services/audioService';
import BaseGameMode from './BaseGameMode';
import './styles/SkyfallShooter.css';

interface SkyfallShooterProps {
  task: Task;
  characterType: CharacterType;
  settings: UserSettings;
  feedback: 'CORRECT' | 'WRONG' | null;
  onAnswer: (index: number) => void;
  onHear: (text: string) => void;
}

interface FallingLetter {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  isTarget: boolean;
  isPartOfWord: boolean;
  size: 'small' | 'normal' | 'large';
  exploding?: 'correct' | 'wrong' | null;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  fizzling?: boolean;
}

const SkyfallShooter: React.FC<SkyfallShooterProps> = ({
  task, characterType, settings, feedback, onAnswer, onHear
}) => {
  const [targetChar, setTargetChar] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [fallingLetters, setFallingLetters] = useState<FallingLetter[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [playerPosition, setPlayerPosition] = useState(50); // percentage
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [shootFlash, setShootFlash] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const wordRef = useRef<string>(task.targetWord || 'CAT');

  // Initialize Word
  useEffect(() => {
    wordRef.current = task.targetWord?.toUpperCase() || 'CAT';
    setTargetChar(wordRef.current[0]);
    setWordIndex(0);
    setScore(0);
    setCombo(0);
    setFallingLetters([]);
    setProjectiles([]);
    setIsGameOver(false);
  }, [task]);

  const spawnLetter = useCallback(() => {
    if (isGameOver) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    
    // Weighted spawning logic
    const rand = Math.random();
    let char = '';
    
    if (rand > 0.6) {
      // 40% chance: spawn the current required target letter
      char = targetChar;
    } else if (rand > 0.3) {
      // 30% chance: spawn any letter that is part of the target word
      const wordLetters = wordRef.current.split('');
      char = wordLetters[Math.floor(Math.random() * wordLetters.length)];
    } else {
      // 30% chance: spawn a completely random distractor letter
      char = randomChar;
    }
    
    const isPartOfWord = wordRef.current.includes(char);
    const isTarget = char === targetChar;
    
    const newLetter: FallingLetter = {
      id: Date.now() + Math.random(),
      char,
      x: Math.random() * 90 + 5, // 5% to 95%
      y: -50,
      speed: 0.6 + Math.random() * 0.8,
      isTarget,
      isPartOfWord,
      size: Math.random() > 0.8 ? 'large' : Math.random() > 0.5 ? 'normal' : 'small'
    };
    
    setFallingLetters(prev => [...prev, newLetter]);
  }, [targetChar, isGameOver]);

  const shoot = useCallback(() => {
    if (feedback !== null || isGameOver) return;
    
    audioService.playEffect('click');
    setShootFlash(true);
    setTimeout(() => setShootFlash(false), 50);

    const newProjectile: Projectile = {
      id: Date.now() + Math.random(),
      x: playerPosition,
      y: 85 // Launch from character height
    };
    setProjectiles(prev => [...prev, newProjectile]);
  }, [playerPosition, feedback, isGameOver]);

  const handleSuccessfulHit = useCallback((letterChar: string) => {
    const isCorrect = letterChar === targetChar;
    
    if (isCorrect) {
      audioService.playEffect('pop');
      audioService.playPhonemeSound(letterChar.toLowerCase() as PhonicsSound);
      setScore(s => s + 15 + combo * 5);
      setCombo(c => c + 1);
      
      const nextIdx = wordIndex + 1;
      if (nextIdx < wordRef.current.length) {
        setWordIndex(nextIdx);
        setTargetChar(wordRef.current[nextIdx]);
      } else {
        onAnswer(task.correctIndex);
        setIsGameOver(true);
      }
    } else {
      audioService.playEffect('wrong');
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 400);
      setCombo(0);
      setScore(s => Math.max(0, s - 10));
    }
  }, [targetChar, wordIndex, combo, task.correctIndex, onAnswer]);

  const update = useCallback((time: number) => {
    if (isGameOver) return;

    if (time - lastSpawnRef.current > 2000) {
      spawnLetter();
      lastSpawnRef.current = time;
    }

    // Update Projectiles
    setProjectiles(prev => {
      return prev.map(p => {
        if (p.fizzling) return p;
        const nextY = p.y - 4;
        if (nextY <= 0) return { ...p, y: 0, fizzling: true };
        return { ...p, y: nextY };
      });
    });

    // Update Falling Letters
    setFallingLetters(prev => {
      return prev.map(l => {
        if (l.exploding) return l;
        const nextY = l.y + l.speed;
        
        // CATCH MECHANIC: If letter touches the player at the bottom
        const dxFromPlayer = Math.abs(l.x - playerPosition);
        const dyFromPlayer = Math.abs(nextY - 85); // Character is roughly at 85-90% y

        if (dxFromPlayer < 8 && dyFromPlayer < 8) {
          handleSuccessfulHit(l.char);
          return { ...l, exploding: (l.char === targetChar ? 'correct' : 'wrong') as 'correct' | 'wrong' };
        }

        // Target missed penalty if it falls past
        if (nextY >= 100 && l.char === targetChar) {
          setIsScreenShaking(true);
          setTimeout(() => setIsScreenShaking(false), 300);
          setCombo(0);
          audioService.playEffect('wrong');
        }
        
        return { ...l, y: nextY };
      }).filter(l => l.y < 105);
    });

    // Collision detection: Projectiles vs Letters
    setProjectiles(currProjectiles => {
      let nextProjectiles = [...currProjectiles];
      setFallingLetters(currLetters => {
        let nextLetters = [...currLetters];
        nextProjectiles = nextProjectiles.map(p => {
          if (p.fizzling) return p;
          let hitAny = false;
          nextLetters = nextLetters.map(l => {
            if (l.exploding) return l;
            const dx = Math.abs(p.x - l.x);
            const dy = Math.abs(p.y - l.y);
            if (dx < 7 && dy < 7) { 
              hitAny = true;
              handleSuccessfulHit(l.char);
              return { ...l, exploding: (l.char === targetChar ? 'correct' : 'wrong') as 'correct' | 'wrong' };
            }
            return l;
          });
          if (hitAny) return { ...p, fizzling: true };
          return p;
        });
        return nextLetters;
      });
      return nextProjectiles;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [spawnLetter, playerPosition, targetChar, wordIndex, combo, isGameOver, handleSuccessfulHit]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFallingLetters(prev => prev.filter(l => !l.exploding));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlayerPosition(Math.max(5, Math.min(95, x)));
    }
  };

  const getCharacterIcon = () => {
    switch (characterType) {
      case 'BRIO': return '🎙️';
      case 'DIESEL': return '🏗️';
      case 'VOWELIA': return '✨';
      case 'ZIPPY': return '🚀';
      default: return '🦊';
    }
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
    >
      <div className={`skyfall-shooter ${isScreenShaking ? 'shaking' : ''} ${shootFlash ? 'shoot-flash' : ''}`}>
        <div className="game-header">
          <div className="target-display">
            <div className="flex justify-center gap-2">
              {wordRef.current.split('').map((c, i) => (
                <div 
                  key={i} 
                  className={`letter-slot ${i === wordIndex ? 'current' : i < wordIndex ? 'completed' : ''} ${settings.dyslexicFont ? 'dyslexic-font' : ''}`}
                >
                  {i < wordIndex ? c : i === wordIndex ? '?' : '_'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            {combo > 1 && (
              <div className="stat combo-display">
                <span className="stat-label">Combo</span>
                <span className="stat-value">x{combo}</span>
              </div>
            )}
          </div>
        </div>

        <div 
          ref={gameAreaRef}
          className="game-area"
          onPointerMove={handlePointerMove}
          onPointerDown={shoot}
        >
          {/* Falling Letters */}
          {fallingLetters.map(l => (
            <div 
              key={l.id} 
              className={`falling-letter ${l.isTarget ? 'next-target' : l.isPartOfWord ? 'word-part' : 'wobbling'} ${l.size} ${l.exploding ? `exploding-${l.exploding}` : ''}`}
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
            >
              <span className="letter-content">{l.char}</span>
              {l.exploding && (
                <div className="explosion-container">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="explosion-particle" />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Projectiles */}
          {projectiles.map(p => (
            <div 
              key={p.id} 
              className={`projectile ${p.fizzling ? 'fizzling' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, color: getCharacterColor() }}
            />
          ))}

          {/* Player Character */}
          <div 
            className="player-character"
            style={{ left: `${playerPosition}%`, color: getCharacterColor() }}
          >
            <div className="character-bubbles">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`bubble bubble-${i + 1}`} />
              ))}
            </div>
            <div className="character-icon">{getCharacterIcon()}</div>
            <div className="character-beam"></div>
          </div>
        </div>

        <div className="game-controls">
          <div className="controls-info">
            <p className="text-xs font-black uppercase tracking-widest opacity-60 italic">Move to Catch or Tap to Blast the Sounds!</p>
          </div>
          
          <div className="flex justify-center gap-4">
             <button 
                onClick={() => onHear(`Find the sound ${targetChar}`)}
                className="hint-button"
              >
                🔊 Target: {targetChar}
              </button>
          </div>
        </div>

        {isGameOver && (
          <div className="game-overlay">
            <div className="game-over-message">
              <h3 className="text-5xl font-black mb-4 italic tracking-tighter text-white">WORD RESTORED!</h3>
              <div className="text-2xl font-black text-teal-400 mb-6 uppercase tracking-widest">Score: {score}</div>
              <div className="animate-bounce text-6xl">💎</div>
            </div>
          </div>
        )}
      </div>
    </BaseGameMode>
  );
};

export default SkyfallShooter;
