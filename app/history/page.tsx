'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ level: '', status: 'completed' });

  useEffect(() => {
    api.getInterviews({ ...filter, limit: 50 } as any)
      .then((d: any) => setInterviews(d.interviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const getScoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (s: number) => s >= 80 ? '🏆' : s >= 70 ? '✅' : s >= 60 ? '⚠️' : '❌';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Interview History</h1>
          <p className="text-gray-500 text-sm mt-1">{interviews.length} sessions recorded</p>
        </div>
        <button onClick={() => router.push('/interview')}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-display text-sm font-semibold
                     hover:from-violet-500 hover:to-purple-500 transition-all btn-glow">
          + New Interview
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'beginner', 'intermediate', 'advanced'].map(l => (
          <button key={l} onClick={() => setFilter(f => ({ ...f, level: l }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter.level === l
                ? 'bg-violet-600 text-white'
                : 'glass border border-white/10 text-gray-400 hover:text-white'
            }`}>{l || 'All Levels'}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-xl font-display font-bold mb-2">No interviews yet</h2>
          <p className="text-gray-500 mb-6">Start your first interview to track your progress</p>
          <button onClick={() => router.push('/interview')}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-all">
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((iv: any, i: number) => (
            <motion.button key={iv._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/history/${iv._id}`)}
              className="w-full glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 transition-all text-left group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">
                    {getScoreLabel(iv.scores?.overall || 0)}
                  </div>
                  <div>
                    <div className="font-display font-semibold capitalize">
                      {iv.level} · {iv.category}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {new Date(iv.completedAt || iv.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                      })}
                      {iv.duration && ` · ${Math.round(iv.duration / 60)} min`}
                      {iv.questionCount && ` · ${iv.questionCount} questions`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: 'Technical', v: iv.scores?.technical },
                      { label: 'Confidence', v: iv.scores?.confidence },
                      { label: 'Overall', v: iv.scores?.overall },
                    ].map(({ label, v }) => (
                      <div key={label}>
                        <div className="text-lg font-bold" style={{ color: getScoreColor(v || 0) }}>
                          {v || 0}%
                        </div>
                        <div className="text-xs text-gray-600">{label}</div>
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-600 group-hover:text-white transition-all">→</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
