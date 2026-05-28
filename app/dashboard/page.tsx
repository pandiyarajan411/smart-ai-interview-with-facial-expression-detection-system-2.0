'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

const BADGE_INFO: Record<string, { emoji: string; label: string }> = {
  first_interview: { emoji: '🎯', label: 'First Interview' },
  dedicated: { emoji: '🔥', label: 'Dedicated' },
  high_achiever: { emoji: '🏆', label: 'High Achiever' },
  confident: { emoji: '💪', label: 'Confident' },
  streak_7: { emoji: '⚡', label: '7-Day Streak' },
};

const MOCK_HISTORY = [
  { date: 'Mon', score: 65, confidence: 58 },
  { date: 'Tue', score: 71, confidence: 67 },
  { date: 'Wed', score: 68, confidence: 72 },
  { date: 'Thu', score: 79, confidence: 74 },
  { date: 'Fri', score: 83, confidence: 80 },
  { date: 'Sat', score: 88, confidence: 85 },
  { date: 'Today', score: 92, confidence: 89 },
];

const RADAR_DATA = [
  { subject: 'Technical', value: 82 },
  { subject: 'Communication', value: 76 },
  { subject: 'Confidence', value: 89 },
  { subject: 'HR', value: 74 },
  { subject: 'Aptitude', value: 68 },
  { subject: 'Behavioral', value: 85 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInterviews({ limit: 5, status: 'completed' })
      .then((d: any) => setInterviews(d.interviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, suffix = '', icon, color }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400`}>+12%</span>
      </div>
      <div className="text-3xl font-display font-bold text-white mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Track your interview progress and improve your performance</p>
        </div>
        <button onClick={() => router.push('/interview')}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-display font-semibold
                     hover:from-violet-500 hover:to-purple-500 transition-all btn-glow neon-violet">
          ⚡ Start Interview
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Interviews" value={user?.totalInterviews || 0} icon="🎤" color="violet" />
        <StatCard label="Average Score" value={user?.averageScore || 0} suffix="%" icon="📊" color="cyan" />
        <StatCard label="Best Score" value={user?.bestScore || 0} suffix="%" icon="🏆" color="emerald" />
        <StatCard label="Points Earned" value={user?.points || 0} icon="⭐" color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score history */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-display text-gray-400 mb-4">SCORE PROGRESSION</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_HISTORY}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#e5e7eb' }} />
              <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} fill="url(#scoreGrad)" name="Score" />
              <Area type="monotone" dataKey="confidence" stroke="#00f5ff" strokeWidth={2} fill="url(#confGrad)" name="Confidence" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-display text-gray-400 mb-4">SKILL RADAR</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges + Recent interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Badges */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-display text-gray-400 mb-4">ACHIEVEMENTS</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(BADGE_INFO).map(([key, info]) => {
              const earned = user?.badges?.includes(key);
              return (
                <motion.div key={key} whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    earned
                      ? 'border-violet-500/30 bg-violet-500/10'
                      : 'border-white/5 opacity-40 grayscale'
                  }`}>
                  <div className="text-2xl mb-1">{info.emoji}</div>
                  <div className="text-xs text-gray-400 leading-tight">{info.label}</div>
                </motion.div>
              );
            })}
            <div className="p-3 rounded-xl text-center border border-dashed border-white/10 opacity-30">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-400">More badges</div>
            </div>
          </div>
        </div>

        {/* Recent interviews */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-display text-gray-400">RECENT SESSIONS</h2>
            <button onClick={() => router.push('/history')} className="text-xs text-violet-400 hover:text-violet-300">
              View all →
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 shimmer rounded-lg" />)}
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <div className="text-3xl mb-2">🎤</div>
              <p className="text-sm">No interviews yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {interviews.map((iv: any) => (
                <button key={iv._id} onClick={() => router.push(`/history/${iv._id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎯</span>
                    <div className="text-left">
                      <div className="text-sm font-medium capitalize">{iv.level} · {iv.category}</div>
                      <div className="text-xs text-gray-500">{new Date(iv.completedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      iv.scores.overall >= 80 ? 'text-emerald-400' :
                      iv.scores.overall >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>{iv.scores.overall}%</div>
                    <div className="text-xs text-gray-500">Overall</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick tips */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h2 className="text-sm font-display text-gray-400 mb-4">💡 AI IMPROVEMENT TIPS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: '👁', title: 'Improve Eye Contact', desc: 'Look directly at the camera lens, not the screen', color: 'cyan' },
            { icon: '🗣', title: 'Speak Clearly', desc: 'Slow down and enunciate — aim for 130-150 words/min', color: 'violet' },
            { icon: '😊', title: 'Stay Confident', desc: 'Take a breath before answering. Pause is not weakness', color: 'emerald' },
          ].map(tip => (
            <div key={tip.title} className={`p-4 rounded-xl bg-${tip.color}-500/5 border border-${tip.color}-500/10`}>
              <span className="text-2xl">{tip.icon}</span>
              <div className="text-sm font-medium mt-2 mb-1">{tip.title}</div>
              <div className="text-xs text-gray-500">{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
