// ParentHub - Analytics dashboard for parents
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameState, GameAction, ISLANDS } from '../../types';
import { storageService } from '../../services/storageService';
import { telemetryService } from '../../services/telemetryService';
import { recommendationService, Recommendation } from '../../services/recommendationService';
import { dummyDataService } from '../../services/dummyDataService';

interface ParentHubProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const ParentHub: React.FC<ParentHubProps> = ({ state, dispatch }) => {
  const analytics = useMemo(() => storageService.getAnalytics(), []);
  const weeklySummary = useMemo(() => telemetryService.getWeeklySummary(), []);
  const streak = useMemo(() => telemetryService.calculateStreak(), []);
  const performanceByCategory = useMemo(() => telemetryService.getPerformanceByCategory(), []);
  const { recommendations, summary: recSummary } = useMemo(() => recommendationService.getRecommendations(), []);
  const learningStory = useMemo(() => recommendationService.getLearningStory(), []);

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE', view: 'magic-map' });
  };

  const handleExportData = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phonics-kingdom-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      storageService.clearAll();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to map"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Parent Hub</h1>
            <p className="text-sm text-gray-500">Track your child's learning progress</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Weekly Summary Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">This Week</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-500">{streak}</div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-blue-500">{weeklySummary.daysActive}</div>
              <div className="text-sm text-gray-500">Days Active</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-green-500">{weeklySummary.totalMinutes}</div>
              <div className="text-sm text-gray-500">Minutes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-purple-500">{weeklySummary.averageAccuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </motion.div>
          </div>
        </section>

        {/* Learning Story */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Learning Story</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-vowelia-purple/10 to-brio-teal/10 rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">📖</div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {learningStory}
                </p>
              </div>
            </div>
            {/* Health indicator badge */}
            <div className="mt-4 flex justify-end">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                recSummary.overallHealth === 'excellent' ? 'bg-green-100 text-green-800' :
                recSummary.overallHealth === 'good' ? 'bg-blue-100 text-blue-800' :
                recSummary.overallHealth === 'needs-attention' ? 'bg-yellow-100 text-yellow-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {recSummary.overallHealth === 'excellent' && '⭐ Excellent'}
                {recSummary.overallHealth === 'good' && '👍 Good Progress'}
                {recSummary.overallHealth === 'needs-attention' && '💪 Keep Practicing'}
                {recSummary.overallHealth === 'struggling' && '🤗 Needs Support'}
              </span>
            </div>
          </motion.div>
        </section>

        {/* Areas for Play - Recommendations */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Areas for Play</h2>
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">🎮</div>
              <p className="text-gray-500">Start playing to get personalized recommendations!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <RecommendationCard key={rec.id} recommendation={rec} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Overall Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Overall Progress</h2>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-vowelia-purple">{analytics.totalSessions}</div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brio-teal">{analytics.totalTasksCompleted}</div>
                <div className="text-sm text-gray-500">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-diesel-yellow">{analytics.averageAccuracy}%</div>
                <div className="text-sm text-gray-500">Average Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-zippy-red">{state.totalStars}</div>
                <div className="text-sm text-gray-500">Stars Earned</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mastery Progress */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Skill Mastery</h2>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="space-y-4">
              {ISLANDS.map((island) => {
                const progress = state.islandProgress[island.id];
                const categoryPerf = performanceByCategory[island.id];
                const completedLevels = progress?.completedLevels || 0;
                const masteryDays = progress?.masteryDays?.length || 0;

                return (
                  <div key={island.id} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: island.color }}
                    >
                      {island.id === 'consonant-cove' && '🏝️'}
                      {island.id === 'vowel-valley' && '🌋'}
                      {island.id === 'blend-beach' && '🏖️'}
                      {island.id === 'digraph-den' && '🏔️'}
                      {island.id === 'sight-word-summit' && '🗻'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{island.name}</span>
                        <div className="flex items-center gap-2">
                          {progress?.hasShard && <span className="text-lg">👑</span>}
                          <span className="text-sm text-gray-500">
                            {categoryPerf?.avgAccuracy || 0}% avg
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(completedLevels / island.levels) * 100}%`,
                              backgroundColor: island.color,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {completedLevels}/{island.levels}
                        </span>
                      </div>
                      {!progress?.hasShard && masteryDays > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Mastery progress: {masteryDays}/3 days
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Sessions</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {analytics.recentSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No sessions yet. Start playing to track progress!
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Island</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasks</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.recentSessions.map((session, index) => {
                    const island = ISLANDS.find(i => i.id === session.islandId);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {island?.name || session.islandId}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.accuracy >= 85 ? 'bg-green-100 text-green-800' :
                            session.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.accuracy}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {session.tasksCompleted}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {session.timeSpentMinutes} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Settings</h2>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            {/* Audio toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Audio</div>
                <div className="text-sm text-gray-500">Enable sound effects and narration</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_AUDIO' })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  state.audioEnabled ? 'bg-brio-teal' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  state.audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Instruction speed */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Instruction Speed</div>
                <div className="text-sm text-gray-500">How fast characters speak</div>
              </div>
              <select
                value={state.instructionSpeed}
                onChange={(e) => dispatch({
                  type: 'SET_INSTRUCTION_SPEED',
                  speed: e.target.value as 'slow' | 'normal' | 'fast',
                })}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <hr className="my-4" />

            {/* Export data */}
            <button
              onClick={handleExportData}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              Export Progress Data
            </button>

            {/* Reset progress */}
            <button
              onClick={handleResetProgress}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-red-600 transition-colors"
            >
              Reset All Progress
            </button>

            {/* Demo Data Section (for testing) */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <hr className="my-4" />
                <div className="text-sm text-gray-500 mb-2">Demo Data (Dev Only)</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { dummyDataService.forceSeed(); window.location.reload(); }}
                    className="py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-600 transition-colors"
                  >
                    📊 Normal
                  </button>
                  <button
                    onClick={() => { dummyDataService.seedStrugglingProfile(); window.location.reload(); }}
                    className="py-2 px-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm font-medium text-orange-600 transition-colors"
                  >
                    🎯 Struggling
                  </button>
                  <button
                    onClick={() => { dummyDataService.seedAdvancedProfile(); window.location.reload(); }}
                    className="py-2 px-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium text-green-600 transition-colors"
                  >
                    🌟 Advanced
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{ recommendation: Recommendation; index: number }> = ({ 
  recommendation: rec, 
  index 
}) => {
  const priorityColors = {
    high: 'border-l-red-400 bg-red-50',
    medium: 'border-l-yellow-400 bg-yellow-50',
    low: 'border-l-blue-400 bg-blue-50',
  };

  const typeIcons = {
    struggling: '🎯',
    'ready-to-advance': '🚀',
    'needs-review': '🔄',
    'maintain-streak': '🔥',
    'new-area': '🗺️',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl shadow-sm border-l-4 p-4 ${priorityColors[rec.priority]}`}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: rec.island.color + '40' }}
        >
          {typeIcons[rec.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800">{rec.title}</h3>
            {rec.priority === 'high' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                Priority
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
          <p className="text-xs text-gray-500">{rec.reason}</p>
        </div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: rec.island.color }}
          title={rec.island.name}
        />
      </div>
    </motion.div>
  );
};

export default ParentHub;
