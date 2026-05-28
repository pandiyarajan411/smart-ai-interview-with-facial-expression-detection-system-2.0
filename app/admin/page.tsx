'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'questions'>('overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminStats().then((d: any) => setStats(d.stats)),
      api.getAdminUsers().then((d: any) => setUsers(d.users || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleBan = async (id: string, ban: boolean) => {
    await api.banUser(id, ban);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: ban } : u));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold gradient-text">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, questions, and system analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'users', 'questions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-violet-600 text-white' : 'glass text-gray-400 hover:text-white border border-white/10'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'violet' },
              { label: 'Interviews Done', value: stats.totalInterviews, icon: '🎤', color: 'cyan' },
              { label: 'Questions', value: stats.totalQuestions, icon: '❓', color: 'emerald' },
              { label: 'Avg Score', value: `${stats.avgScore}%`, icon: '📊', color: 'amber' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5 border border-white/5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-3xl font-display font-bold">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-display text-gray-400 mb-4">RECENT SESSIONS</h2>
            <div className="space-y-2">
              {(stats.recentInterviews || []).map((iv: any) => (
                <div key={iv._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all">
                  <div>
                    <div className="text-sm font-medium">{iv.user?.name}</div>
                    <div className="text-xs text-gray-500">{iv.user?.email} · {iv.level} · {new Date(iv.completedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm font-bold text-violet-400">{iv.scores?.overall || 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                       placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Email', 'Interviews', 'Avg Score', 'Points', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-sm">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.totalInterviews}</td>
                    <td className="px-4 py-3 text-sm">{user.averageScore}%</td>
                    <td className="px-4 py-3 text-sm">{user.points}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>{user.isBanned ? 'Banned' : 'Active'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleBan(user._id, !user.isBanned)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                          user.isBanned
                            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        }`}>
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">No users found</div>
            )}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-display text-gray-400">QUESTION BANK</h2>
            <button className="px-3 py-1.5 bg-violet-600 rounded-lg text-xs font-medium hover:bg-violet-500 transition-all">
              + Add Question
            </button>
          </div>
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">❓</div>
            <p className="text-sm">Question management coming soon.</p>
            <p className="text-xs text-gray-700 mt-1">Use the seed script to populate the question bank.</p>
          </div>
        </div>
      )}
    </div>
  );
}
