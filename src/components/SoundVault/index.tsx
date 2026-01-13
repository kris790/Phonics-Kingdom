// Sound Vault - Collection of mastered sounds and guardians
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillNode, MasteredGuardian, SkillLevel } from '../../types';

interface SoundVaultProps {
  nodes: SkillNode[];
  guardians: Record<string, MasteredGuardian>;
  onSaveGuardian: (guardian: MasteredGuardian) => void;
  onClose: () => void;
}

const LEVEL_COLORS: Record<SkillLevel, string> = {
  [SkillLevel.PHONEMIC_AWARENESS]: '#3b82f6',
  [SkillLevel.LETTER_SOUNDS]: '#8b5cf6',
  [SkillLevel.DIGRAPHS_BLENDS]: '#f59e0b',
  [SkillLevel.BLENDING_CVC]: '#10b981',
  [SkillLevel.SIGHT_WORDS]: '#ec4899',
};

const SoundVault: React.FC<SoundVaultProps> = ({
  nodes,
  guardians,
  onSaveGuardian,
  onClose,
}) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  
  const masteredNodes = nodes.filter(n => n.isMastered);
  const inProgressNodes = nodes.filter(n => !n.isLocked && !n.isMastered);
  const lockedNodes = nodes.filter(n => n.isLocked);

  const groupedByLevel = nodes.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = [];
    acc[node.level].push(node);
    return acc;
  }, {} as Record<SkillLevel, SkillNode[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>💎</span> Sound Vault
          </h1>
          <p className="text-purple-300 text-sm">Your collection of mastered sounds</p>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/20 rounded-2xl p-4 text-center border border-green-500/30">
          <p className="text-3xl font-bold text-green-400">{masteredNodes.length}</p>
          <p className="text-green-300 text-xs">Mastered</p>
        </div>
        <div className="bg-yellow-500/20 rounded-2xl p-4 text-center border border-yellow-500/30">
          <p className="text-3xl font-bold text-yellow-400">{inProgressNodes.length}</p>
          <p className="text-yellow-300 text-xs">In Progress</p>
        </div>
        <div className="bg-gray-500/20 rounded-2xl p-4 text-center border border-gray-500/30">
          <p className="text-3xl font-bold text-gray-400">{lockedNodes.length}</p>
          <p className="text-gray-300 text-xs">Locked</p>
        </div>
      </div>

      {/* Skills by Level */}
      <div className="space-y-6">
        {Object.entries(groupedByLevel).map(([level, levelNodes]) => (
          <div key={level}>
            <h2 
              className="text-sm font-bold uppercase tracking-wider mb-3 px-1"
              style={{ color: LEVEL_COLORS[level as SkillLevel] }}
            >
              {level.replace(/_/g, ' ')}
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {levelNodes.map((node) => {
                const guardian = guardians[node.id];
                
                return (
                  <motion.button
                    key={node.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedNode(node)}
                    className={`
                      p-4 rounded-2xl text-left transition-all
                      ${node.isMastered 
                        ? 'bg-gradient-to-br from-white/20 to-white/5 border border-white/20' 
                        : node.isLocked
                        ? 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                        : 'bg-white/10 border border-white/10'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">
                        {node.isMastered ? '✨' : node.isLocked ? '🔒' : '📖'}
                      </span>
                      {node.isMastered && (
                        <div className="flex">
                          {[...Array(3)].map((_, i) => (
                            <span key={i} className="text-xs">⭐</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-white font-medium text-sm mb-1">{node.title}</p>
                    <p className="text-white/50 text-xs">{node.description}</p>
                    
                    {!node.isLocked && !node.isMastered && node.attempts > 0 && (
                      <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                        <div 
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${node.accuracy}%` }}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-4">
                <span className="text-5xl">{selectedNode.isMastered ? '🏆' : '📚'}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">
                {selectedNode.title}
              </h3>
              <p className="text-gray-400 text-center text-sm mb-4">
                {selectedNode.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{selectedNode.accuracy}%</p>
                  <p className="text-gray-400 text-xs">Accuracy</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">{selectedNode.attempts}</p>
                  <p className="text-gray-400 text-xs">Attempts</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoundVault;
