// MagicMap - Interactive island navigation
import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameState, GameAction, ISLANDS, CHARACTERS } from '../../types';
import { recommendationService } from '../../services/recommendationService';
import { usePWA } from '../../hooks/usePWA';

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
  const quickSuggestion = useMemo(() => recommendationService.getQuickSuggestion(), []);
  const characterEncouragement = useMemo(
    () => recommendationService.getCharacterEncouragement(state.selectedCharacterId || 'brio'),
    [state.selectedCharacterId]
  );
  const { isOnline, isInstallable, promptInstall } = usePWA();

  const isIslandUnlocked = useCallback((island: typeof ISLANDS[0]) => {
    return state.totalStars >= island.unlockRequirement;
  }, [state.totalStars]);

  const getIslandProgress = useCallback((islandId: string) => {
    return state.islandProgress[islandId] || {
      completedLevels: 0,
      totalLevels: 5,
      masteryDays: [],
      hasShard: false,
    };
  }, [state.islandProgress]);

  const handleIslandClick = useCallback((island: typeof ISLANDS[0]) => {
    if (!isIslandUnlocked(island)) return;
    
    const progress = getIslandProgress(island.id);
    const nextLevel = Math.min(progress.completedLevels + 1, island.levels);
    
    dispatch({ type: 'SELECT_ISLAND', islandId: island.id });
    onStartLevel(island.id, `${island.id}-level-${nextLevel}`);
    dispatch({ type: 'NAVIGATE', view: 'game' });
  }, [isIslandUnlocked, getIslandProgress, dispatch, onStartLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-400 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md p-4 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: character.color } as React.CSSProperties}
            >
              {character.id === 'brio' && '🦁'}
              {character.id === 'vowelia' && '🦉'}
              {character.id === 'diesel' && '🦊'}
              {character.id === 'zippy' && '🐰'}
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Magic Map</h1>
              <p className="text-sm text-gray-500">Choose your adventure!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stars counter */}
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-yellow-700">{state.totalStars}</span>
            </div>

            {/* Shards counter */}
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <span className="text-2xl">👑</span>
              <span className="font-bold text-purple-700">{state.shardsCollected.length}</span>
            </div>

            {/* Offline indicator */}
            {!isOnline && (
              <div className="flex items-center gap-1 bg-orange-100 px-3 py-2 rounded-full text-orange-700 text-sm">
                <span>📴</span>
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Install app button */}
            {isInstallable && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={promptInstall}
                className="flex items-center gap-1 bg-brio-teal/10 hover:bg-brio-teal/20 px-3 py-2 rounded-full text-brio-teal text-sm font-medium transition-colors"
              >
                <span>📲</span>
                <span className="hidden sm:inline">Install</span>
              </motion.button>
            )}

            {/* Parent Hub button */}
            <button
              onClick={() => dispatch({ type: 'NAVIGATE', view: 'parent-hub' })}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Parent Hub"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Quick Suggestion Banner */}
      {quickSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{quickSuggestion.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {character.name} says: {characterEncouragement}
                </p>
                <p className="text-xs text-gray-500">
                  Suggested: <span className="font-medium">{quickSuggestion.island.name}</span> — {quickSuggestion.reason}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleIslandClick(quickSuggestion.island)}
              className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-md"
              style={{ backgroundColor: quickSuggestion.island.color } as React.CSSProperties}
            >
              {quickSuggestion.actionText} →
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Ocean waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0">
        <motion.div
          animate={{ x: [-20, 20, -20] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-t from-blue-500 to-transparent opacity-50"
        />
      </div>

      {/* Map area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 min-h-[600px]">
        {/* Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-60"
            style={{
              top: `${10 + i * 15}%`,
              left: `${10 + i * 20}%`,
            } as React.CSSProperties}
            animate={{
              x: [0, 30, 0],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 10 + i * 2,
              delay: i * 0.5,
            }}
          >
            ☁️
          </motion.div>
        ))}

        {/* Islands */}
        {ISLANDS.map((island) => {
          const unlocked = isIslandUnlocked(island);
          const progress = getIslandProgress(island.id);

          return (
            <motion.button
              key={island.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: ISLANDS.indexOf(island) * 0.1, type: 'spring' }}
              onClick={() => handleIslandClick(island)}
              disabled={!unlocked}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
              `}
              style={{
                left: `${island.position.x}%`,
                top: `${island.position.y}%`,
              } as React.CSSProperties}
              whileHover={unlocked ? { scale: 1.1 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
            >
              {/* Island base */}
              <motion.div
                animate={unlocked ? { y: [0, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, delay: ISLANDS.indexOf(island) * 0.2 }}
                className="relative"
              >
                {/* Island visual */}
                <div
                  className={`
                    w-32 h-24 rounded-[40%] shadow-lg
                    flex flex-col items-center justify-center
                    ${unlocked ? '' : 'grayscale'}
                  `}
                  style={{ backgroundColor: island.color }}
                >
                  {/* Lock icon for locked islands */}
                  {!unlocked && (
                    <div className="absolute -top-2 -right-2 bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      🔒
                    </div>
                  )}

                  {/* Shard indicator */}
                  {progress.hasShard && (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-3 text-2xl"
                    >
                      👑
                    </motion.div>
                  )}

                  {/* Island emoji */}
                  <span className="text-3xl mb-1">
                    {island.id === 'consonant-cove' && '🏝️'}
                    {island.id === 'vowel-valley' && '🌋'}
                    {island.id === 'blend-beach' && '🏖️'}
                    {island.id === 'digraph-den' && '🏔️'}
                    {island.id === 'sight-word-summit' && '🗻'}
                  </span>

                  {/* Progress stars */}
                  <div className="flex gap-0.5">
                    {[...Array(island.levels)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < progress.completedLevels ? '' : 'opacity-30'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Island name */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow">
                    {island.name}
                  </span>
                </div>

                {/* Unlock requirement */}
                {!unlocked && (
                  <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-600">
                      ⭐ {island.unlockRequirement} to unlock
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.button>
          );
        })}

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-20 left-10 text-4xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🚢
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 text-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🦜
        </motion.div>
      </main>

      {/* Character guide */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed bottom-4 left-4 bg-white rounded-2xl shadow-lg p-4 max-w-xs z-20"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: character.color }}
          >
            {character.id === 'brio' && '🦁'}
            {character.id === 'vowelia' && '🦉'}
            {character.id === 'diesel' && '🦊'}
            {character.id === 'zippy' && '🐰'}
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>{character.name}</strong>: "Tap an island to start your adventure! Earn stars to unlock more islands!"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MagicMap;
