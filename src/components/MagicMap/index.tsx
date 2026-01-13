// MagicMap - Interactive island navigation with modern UI
import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameState, GameAction, ISLANDS, CHARACTERS } from '../../types';
import { usePWA } from '../../hooks/usePWA';

// Island background images (using beautiful landscape photos)
const ISLAND_IMAGES: Record<string, string> = {
  'consonant-cove': 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=400&fit=crop',
  'vowel-valley': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
  'blend-beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
  'digraph-den': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&h=400&fit=crop',
  'sight-word-summit': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
};

interface MagicMapProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onStartLevel: (islandId: string, levelId: string) => void;
}

export const MagicMap: React.FC<MagicMapProps> = ({
  state,
  dispatch,
  onStartLevel,
}) => {
  const character = CHARACTERS[state.selectedCharacterId || 'brio'];
  const { isOnline, isInstallable, promptInstall } = usePWA();

  const isIslandUnlocked = useCallback((island: typeof ISLANDS[0]) => {
    return state.totalStars >= island.unlockRequirement;
  }, [state.totalStars]);

  const isIslandRestored = useCallback((island: typeof ISLANDS[0]) => {
    const progress = state.islandProgress[island.id];
    return progress && progress.completedLevels > 0;
  }, [state.islandProgress]);

  const getIslandProgress = useCallback((islandId: string) => {
    return state.islandProgress[islandId] || {
      completedLevels: 0,
      totalLevels: 5,
      masteryDays: [],
      hasShard: false,
    };
  }, [state.islandProgress]);

  const restoredCount = useMemo(() => {
    return ISLANDS.filter(island => {
      const progress = state.islandProgress[island.id];
      return progress && progress.completedLevels > 0;
    }).length;
  }, [state.islandProgress]);

  const handleIslandClick = useCallback((island: typeof ISLANDS[0]) => {
    if (!isIslandUnlocked(island)) return;
    
    const progress = getIslandProgress(island.id);
    const nextLevel = Math.min(progress.completedLevels + 1, island.levels);
    
    dispatch({ type: 'SELECT_ISLAND', islandId: island.id });
    onStartLevel(island.id, `${island.id}-level-${nextLevel}`);
    dispatch({ type: 'NAVIGATE', view: 'game' });
  }, [isIslandUnlocked, getIslandProgress, dispatch, onStartLevel]);

  const getCharacterGreeting = () => {
    const greetings: Record<string, { intro: string; message: string }> = {
      brio: { intro: "Yo! I'm Brio!", message: "Ready to restore the magic today?" },
      vowelia: { intro: "Greetings, dear learner...", message: "The islands await your magic touch" },
      diesel: { intro: "Hey there, explorer!", message: "Let's dig up some treasure!" },
      zippy: { intro: "Zoom zoom!", message: "Ready to race through learning?" },
    };
    return greetings[character.id] || greetings.brio;
  };

  const greeting = getCharacterGreeting();

  // Reorder islands: make sight-word-summit first (featured), then others
  const orderedIslands = useMemo(() => {
    const summit = ISLANDS.find(i => i.id === 'sight-word-summit');
    const others = ISLANDS.filter(i => i.id !== 'sight-word-summit');
    return summit ? [summit, ...others] : ISLANDS;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-200 via-sky-200 to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md safe-area-inset-top">
        <div className="flex items-center p-4 pb-2 justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-xl">✨</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Phonics Kingdom</h1>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/10 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-500/20">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{state.totalStars}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">💎</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{state.shardsCollected.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-600">🌱</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{restoredCount * 10}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-28 min-h-screen">
        <div className="max-w-lg mx-auto px-4">
          
          {/* Character Greeting Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-sm backdrop-blur-sm mb-6"
          >
            <div className="flex gap-4">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full ring-4 ring-purple-200 dark:ring-purple-500/30 flex items-center justify-center text-4xl flex-shrink-0 shadow-lg"
                style={{ backgroundColor: character.color } as React.CSSProperties}
              >
                {character.id === 'brio' && '🦁'}
                {character.id === 'vowelia' && '🦉'}
                {character.id === 'diesel' && '🦊'}
                {character.id === 'zippy' && '🐰'}
              </motion.div>
              <div className="flex flex-col justify-center flex-1">
                <div className="bg-white dark:bg-purple-900/30 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <p className="text-gray-900 dark:text-white text-base font-bold leading-tight">{greeting.intro}</p>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mt-1">{greeting.message}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section Header */}
          <h2 className="text-purple-600 dark:text-purple-400 text-xs font-bold tracking-[0.2em] text-center uppercase mb-4">
            ✨ Explore the Islands ✨
          </h2>

          {/* Island Grid */}
          <div className="grid grid-cols-2 gap-3">
            {orderedIslands.map((island, index) => {
              const unlocked = isIslandUnlocked(island);
              const restored = isIslandRestored(island);
              const progress = getIslandProgress(island.id);
              const isFeatured = index === 0; // First island (sight-word-summit) is featured
              
              return (
                <motion.button
                  key={island.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleIslandClick(island)}
                  disabled={!unlocked}
                  className={`
                    relative overflow-hidden rounded-2xl
                    ${isFeatured ? 'col-span-2 h-44' : 'aspect-square'}
                    ${!unlocked || (!restored && unlocked) ? 'grayscale' : ''}
                    ${!unlocked ? 'brightness-75' : ''}
                    ${restored ? 'ring-2' : ''}
                    active:scale-[0.98] transition-all duration-200
                    focus:outline-none focus:ring-4 focus:ring-purple-500/50
                  `}
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%), url("${ISLAND_IMAGES[island.id]}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderColor: restored ? island.color : 'transparent',
                    boxShadow: restored ? `0 8px 20px -5px ${island.color}50` : '0 4px 12px rgba(0,0,0,0.1)',
                  } as React.CSSProperties}
                >
                  {/* Locked Badge */}
                  {!unlocked && (
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-purple-700 shadow-md flex items-center gap-1">
                      <span>🔒</span> 
                      <span>LOCKED</span>
                    </div>
                  )}

                  {/* Unlock Requirement */}
                  {!unlocked && (
                    <div className="absolute top-3 left-3 bg-black/50 px-2 py-1 rounded-full text-[10px] font-medium text-white flex items-center gap-1">
                      <span>⭐</span> 
                      <span>{island.unlockRequirement}</span>
                    </div>
                  )}

                  {/* Needs Restoration Indicator */}
                  {unlocked && !restored && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="bg-white/90 px-3 py-2 rounded-full text-xs font-bold text-purple-700 flex items-center gap-1 shadow-lg"
                      >
                        <span>✨</span>
                        <span>Tap to Restore</span>
                      </motion.div>
                    </div>
                  )}

                  {/* Progress Stars (for restored islands) */}
                  {restored && (
                    <div className="absolute top-3 left-3 flex gap-0.5 bg-black/30 px-2 py-1 rounded-full">
                      {[...Array(island.levels)].map((_, i) => (
                        <span 
                          key={i}
                          className={`text-sm ${i < progress.completedLevels ? 'drop-shadow-lg' : 'opacity-40'}`}
                        >
                          {i < progress.completedLevels ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Restored Badge */}
                  {restored && (
                    <div className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1">
                      <span>✓</span> 
                      <span>RESTORED</span>
                    </div>
                  )}

                  {/* Island Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-lg font-bold leading-tight drop-shadow-lg">{island.name}</p>
                    {isFeatured && (
                      <p className="text-white/80 text-xs font-medium italic mt-1">{island.lore.subtitle}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Restoration Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white/80 dark:bg-white/5 rounded-2xl p-4 border border-purple-100 dark:border-purple-500/20 shadow-sm"
          >
            <p className="text-gray-900 dark:text-white text-sm font-bold mb-3 flex items-center gap-2">
              <span className="text-purple-600">📈</span> Restoration Progress
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(restoredCount / ISLANDS.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full"
              />
            </div>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-2 uppercase tracking-widest text-right">
              {restoredCount}/{ISLANDS.length} Islands Restored
            </p>
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
        <div className="mx-4 mb-4">
          <div className="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-xl rounded-full p-1.5 flex items-center justify-around shadow-2xl border border-white/10 dark:border-black/10 max-w-md mx-auto">
            <button 
              className="flex flex-col items-center justify-center w-20 py-2 rounded-full bg-purple-600/20"
              onClick={() => dispatch({ type: 'NAVIGATE', view: 'magic-map' })}
            >
              <span className="text-xl">🏠</span>
              <span className="text-[10px] font-bold text-white dark:text-gray-900 mt-0.5">Home</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center w-20 py-2 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => {/* Shop coming soon */}}
            >
              <span className="text-xl">🛍️</span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 mt-0.5">Shop</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center w-20 py-2 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => dispatch({ type: 'NAVIGATE', view: 'parent-hub' })}
            >
              <span className="text-xl">👨‍👩‍👧</span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 mt-0.5">Parents</span>
            </button>
          </div>
        </div>
      </nav>

      {/* PWA Install Prompt */}
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={promptInstall}
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <span>📲</span>
            <span>Install App</span>
          </button>
        </motion.div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          📴 Offline Mode
        </div>
      )}
    </div>
  );
};

export default MagicMap;
