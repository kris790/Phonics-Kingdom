
import React from 'react';
import { SkillNode, GameSession } from '../types';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface AnalyticsDashboardProps {
  nodes: SkillNode[];
  stars: number;
  soundShards: number;
  sessions: GameSession[];
}

const StatCard = ({ title, value, total, icon, color }: { title: string, value: string | number, total?: number, icon?: string, color: string }) => (
  <div className={`bg-white p-6 rounded-3xl border-b-8 ${color} shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}>
    {icon && <span className="text-4xl mb-2">{icon}</span>}
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-4xl font-black text-slate-800 tracking-tighter">
      {value}{total ? <span className="text-sm text-slate-300 ml-1">/ {total}</span> : ''}
    </p>
  </div>
);

const getWeeklyProgress = (sessions: GameSession[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    const dateStr = d.toDateString();
    
    const daySessions = sessions.filter(s => {
      const sDate = new Date(s.startTime).toDateString();
      return sDate === dateStr;
    });
    
    const avgAccuracy = daySessions.length > 0 
      ? daySessions.reduce((acc, curr) => acc + curr.accuracy, 0) / daySessions.length
      : 0;
      
    last7Days.push({ day: dayName, accuracy: Math.round(avgAccuracy), count: daySessions.length });
  }
  return last7Days;
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ nodes, stars, soundShards, sessions }) => {
  const masteredCount = nodes.filter(n => n.isMastered).length;
  const totalTime = sessions.reduce((sum, s) => sum + ((s.endTime || s.startTime) - s.startTime), 0);
  const totalHints = sessions.reduce((sum, s) => sum + (s.hintCount || 0), 0);
  const weeklyData = getWeeklyProgress(sessions);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Mastered Skills" value={masteredCount} total={nodes.length} icon="👑" color="border-emerald-500" />
        <StatCard title="Total Stars" value={stars} icon="✨" color="border-yellow-400" />
        <StatCard title="Sound Shards" value={soundShards} icon="💎" color="border-indigo-500" />
        <StatCard title="Learning Time" value={`${Math.round(totalTime / 60000)}m`} icon="⏳" color="border-sky-400" />
        <StatCard title="Hints Used" value={totalHints} icon="💡" color="border-teal-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic tracking-tight">Quest Consistency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 800, fontSize: 10}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800}}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#14b8a6" 
                  strokeWidth={6} 
                  dot={{ r: 6, fill: '#14b8a6', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 10 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 text-center">Avg. Accuracy over last 7 days</p>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic tracking-tight">Biome Mastery</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="title" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800}}
                />
                <Bar dataKey="accuracy" radius={[10, 10, 0, 0]}>
                  {nodes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy >= 85 ? '#10B981' : '#0EA5E9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 text-center">Current accuracy across all biomes</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
