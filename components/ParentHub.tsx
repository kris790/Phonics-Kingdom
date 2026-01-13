
import React, { useState, useEffect } from 'react';
import { SkillNode, UserSettings, DifficultyLevel, GameSession, UserProfile } from '../types';
import { geminiService } from '../services/gemini';
import { audioService } from '../services/audioService';
import { pairingService } from '../services/pairingService';
import AnalyticsDashboard from './AnalyticsDashboard';

interface ParentHubProps {
  nodes: SkillNode[];
  stars: number;
  soundShards: number;
  settings: UserSettings;
  sessions: GameSession[];
  profile: UserProfile;
  onUpdateSettings: (s: UserSettings) => void;
  onDismissNotifications: () => void;
  onBack: () => void;
  onReset: () => void;
}

const ParentHub: React.FC<ParentHubProps> = ({ nodes, stars, soundShards, settings, sessions, profile, onUpdateSettings, onDismissNotifications, onBack, onReset }) => {
  const [learningStory, setLearningStory] = useState<string>('');
  const [scoutInsight, setScoutInsight] = useState<string>('');
  const [offlineQuests, setOfflineQuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIGuidance = async () => {
      setLoading(true);
      try {
        const [story, insight, quests] = await Promise.all([
          geminiService.generateLearningStory(nodes, sessions),
          geminiService.generateScoutInsight(nodes, sessions),
          geminiService.generateOfflineQuests(nodes, sessions)
        ]);
        setLearningStory(story);
        setScoutInsight(insight);
        setOfflineQuests(quests);
      } catch (err) {
        console.error("AI Insight failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIGuidance();
  }, [nodes, sessions]);

  const handlePreviewVoice = () => {
    audioService.speak("Hello Sound Scout! How is my voice speed today?", "BRIO", settings.speechRate);
  };

  const handleGeneratePairing = async () => {
    const code = await pairingService.generateCode();
    setPairingCode(code);
  };

  const masteryThreshold = 85;

  return (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl p-6 md:p-12 border-t-[12px] border-teal-500">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Kingdom Insights</h1>
            <p className="text-teal-600 font-bold uppercase text-xs tracking-widest mt-2">
              Scouting Report for {profile.playerName}
            </p>
          </div>
          <button onClick={onBack} className="bg-slate-100 px-8 py-4 rounded-3xl font-black hover:bg-slate-200 text-slate-600 transition-all border-2 border-slate-200">Close ✕</button>
        </header>

        {/* Device Pairing Section */}
        <section className="mb-10 p-8 bg-indigo-50 rounded-[3rem] border-4 border-indigo-100 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 text-9xl opacity-5 group-hover:rotate-12 transition-transform">📱</div>
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex-1">
                <h3 className="text-xl font-black text-indigo-900 mb-2 uppercase italic tracking-tight">Parent Link</h3>
                <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                  Monitor progress from your own phone. We use anonymous linking to keep {profile.playerName}'s data private and secure.
                </p>
              </div>
              <div className="shrink-0">
                {pairingCode ? (
                  <div className="bg-white px-8 py-4 rounded-2xl border-4 border-indigo-200 text-center animate-pop">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Session Code</p>
                    <p className="text-4xl font-black text-indigo-900 tracking-widest">{pairingCode}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Valid for 15 minutes</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleGeneratePairing}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Pair New Device 🔗
                  </button>
                )}
              </div>
           </div>
        </section>

        {profile.notifications && profile.notifications.length > 0 && (
          <section className="mb-10 animate-pop">
            <div className="bg-emerald-50 border-4 border-emerald-100 rounded-3xl p-6 relative">
              <button onClick={onDismissNotifications} className="absolute top-4 right-6 text-emerald-400 font-black">✕</button>
              <h3 className="text-emerald-800 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span>🔔</span> Recent Achievements
              </h3>
              <ul className="space-y-2">
                {profile.notifications.map((note, i) => (
                  <li key={i} className="text-emerald-700 font-bold italic">"{note}"</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mb-14">
           <AnalyticsDashboard nodes={nodes} stars={stars} soundShards={soundShards} sessions={sessions} />
        </section>

        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[3.5rem] p-10 text-white mb-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl group-hover:rotate-12 transition-transform">📖</div>
          <h3 className="text-2xl font-black mb-6 flex items-center gap-4">
            <span>The Learning Story</span>
            {loading && <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>}
          </h3>
          <p className="text-2xl font-medium leading-relaxed opacity-90 italic relative z-10 mb-8">
            "{loading ? "The Scribes are writing..." : learningStory.replace('[Your Sound Scout]', profile.playerName)}"
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>🧠</span> Scout's Deep Insight (Gemini 3 Pro)
            </h4>
            <p className="text-lg font-bold leading-snug">
              {loading ? "Analyzing phoneme mastery..." : scoutInsight}
            </p>
          </div>
        </div>

        <section className="mb-14">
          <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tight">Recent Quests</h3>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-slate-400 italic font-medium p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                No quests completed yet. Adventure awaits!
              </p>
            ) : (
              sessions.slice(0, 5).map((session, i) => {
                const node = nodes.find(n => n.id === session.skillId);
                return (
                  <div key={session.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 hover:bg-white transition-colors group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${session.accuracy >= 85 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {session.accuracy >= 85 ? '👑' : '⭐'}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-700">{node?.title || 'Unknown Quest'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(session.startTime).toLocaleString()} • {Math.round(session.accuracy)}% Accuracy
                      </p>
                    </div>
                    <div className="text-right px-4">
                       <span className="font-black text-teal-600">+{session.starsEarned} ✨</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Offline Adventures</h3>
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recommended Play</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)
            ) : (
              offlineQuests.map((quest, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border-4 border-amber-50 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
                  <span className="absolute -top-4 -right-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">✨</span>
                  <p className="text-slate-700 font-black text-lg leading-tight relative z-10">{quest}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-slate-50 border-4 border-slate-100 p-10 rounded-[3.5rem] mb-14 shadow-inner">
           <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tight">Kingdom Configuration</h3>
           <div className="mb-10">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Challenge Level</span>
              <div className="grid grid-cols-3 gap-4">
                 {Object.values(DifficultyLevel).map((level) => (
                    <button
                       key={level}
                       onClick={() => onUpdateSettings({ ...settings, difficulty: level })}
                       className={`py-4 rounded-2xl font-black transition-all border-4 ${
                          settings.difficulty === level ? 'bg-teal-500 border-teal-200 text-white shadow-lg' : 'bg-white border-white text-slate-400 hover:border-slate-100'
                       }`}
                    >
                       {level}
                    </button>
                 ))}
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Speech Speed ({settings.speechRate.toFixed(1)}x)</span>
                        <button onClick={handlePreviewVoice} className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-teal-100 hover:bg-teal-100 transition-colors">Preview Voice 🔊</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🐢</span>
                        <input type="range" min="0.5" max="1.5" step="0.1" value={settings.speechRate} onChange={(e) => onUpdateSettings({...settings, speechRate: parseFloat(e.target.value)})} className="flex-1 accent-teal-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                        <span className="text-xl">🐇</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <span className="font-black text-slate-700">Dyslexia-Friendly Font</span>
                    <button onClick={() => onUpdateSettings({...settings, dyslexicFont: !settings.dyslexicFont})} className={`w-16 h-10 rounded-full transition-all relative ${settings.dyslexicFont ? 'bg-teal-500' : 'bg-slate-300'}`}><div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-md ${settings.dyslexicFont ? 'right-1.5' : 'left-1.5'}`} /></button>
                 </div>
              </div>
              <div className="flex flex-col justify-center gap-6">
                <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <span className="font-black text-slate-700">High Contrast Mode</span>
                    <button onClick={() => onUpdateSettings({...settings, highContrast: !settings.highContrast})} className={`w-16 h-10 rounded-full transition-all relative ${settings.highContrast ? 'bg-teal-500' : 'bg-slate-300'}`}><div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-md ${settings.highContrast ? 'right-1.5' : 'left-1.5'}`} /></button>
                 </div>
              </div>
           </div>
        </section>

        <section className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 mb-14 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase italic tracking-tight">Curriculum Roadmap</h3>
            <div className="space-y-8">
              {nodes.map(node => (
                <div key={node.id}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="font-black text-slate-700 text-lg leading-none mb-1">{node.title} {node.isMastered ? '👑' : ''}</p>
                      <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{node.standard}</p>
                    </div>
                    <div className="text-right">
                       <div className="flex gap-1.5">
                          {[1, 2, 3].map(i => <div key={i} className={`w-4 h-4 rounded-full ${node.successivePasses >= i ? 'bg-emerald-400' : 'bg-slate-100'}`} />)}
                       </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200">
                    <div className={`h-full transition-all duration-1000 ${node.accuracy >= masteryThreshold ? 'bg-emerald-500' : 'bg-teal-500'}`} style={{ width: `${node.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
        </section>

        <footer className="bg-rose-50 p-10 rounded-[3.5rem] border-4 border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <p className="text-rose-900 font-black uppercase text-xs tracking-widest mb-1">Warning Realm</p>
            <p className="text-rose-700 text-sm font-medium">Resetting deletes all progress and mastery permanently.</p>
          </div>
          <button onClick={onReset} className="bg-rose-600 text-white px-12 py-5 rounded-3xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">Reset Data</button>
        </footer>
      </div>
    </div>
  );
};

export default ParentHub;
