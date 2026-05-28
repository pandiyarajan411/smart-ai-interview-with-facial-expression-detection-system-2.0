'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '@/lib/api';

function CircularScore({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="90" height="90" className="progress-ring">
        <circle cx="45" cy="45" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
        <circle cx="45" cy="45" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        <text x="45" y="45" textAnchor="middle" dy="5" fill="white" fontSize="14" fontWeight="bold">{value}%</text>
      </svg>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

export default function InterviewResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getInterview(id as string)
      .then((d: any) => setInterview(d.interview))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Smart AI Interview Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(interview.completedAt).toLocaleDateString()}`, 20, 35);
    doc.text(`Level: ${interview.level}`, 20, 45);
    doc.text(`Overall Score: ${interview.scores.overall}%`, 20, 55);
    doc.text(`Technical: ${interview.scores.technical}%`, 20, 65);
    doc.text(`Communication: ${interview.scores.communication}%`, 20, 75);
    doc.text(`Confidence: ${interview.scores.confidence}%`, 20, 85);
    if (interview.aiFeedback?.summary) {
      doc.setFontSize(11);
      doc.text('AI Feedback:', 20, 100);
      const lines = doc.splitTextToSize(interview.aiFeedback.summary, 170);
      doc.text(lines, 20, 110);
    }
    doc.save(`interview-report-${id}.pdf`);
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
    </div>
  );

  if (!interview) return (
    <div className="p-6 text-center text-gray-400">Interview not found.</div>
  );

  const scores = interview.scores || {};
  const ai = interview.aiFeedback || {};
  const timeline = (interview.expressionTimeline || []).map((t: any, i: number) => ({
    t: Math.round(t.timestamp / 1000) + 's',
    confidence: t.confidence,
    nervousness: t.nervousness,
  }));

  const barData = [
    { name: 'Technical', score: scores.technical || 0 },
    { name: 'Communication', score: scores.communication || 0 },
    { name: 'HR', score: scores.hr || 0 },
    { name: 'Confidence', score: scores.confidence || 0 },
    { name: 'Eye Contact', score: scores.eyeContact || 0 },
  ];

  const getScoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (s: number) => s >= 80 ? 'Excellent' : s >= 70 ? 'Good' : s >= 60 ? 'Average' : 'Needs Work';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/history')} className="text-sm text-gray-400 hover:text-white mb-2 block">
            ← Back to History
          </button>
          <h1 className="text-2xl font-display font-bold">
            Interview Report · <span className="gradient-text capitalize">{interview.level}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(interview.completedAt).toLocaleString()} · {Math.round(interview.duration / 60)} min
          </p>
        </div>
        <button onClick={downloadPDF}
          className="px-4 py-2.5 glass rounded-xl border border-violet-500/20 text-violet-400 hover:bg-violet-500/10
                     text-sm font-medium transition-all flex items-center gap-2">
          📄 Download PDF
        </button>
      </motion.div>

      {/* Overall score hero */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl p-8 border border-violet-500/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-violet-900/20 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="text-7xl font-display font-black mb-2" style={{ color: getScoreColor(scores.overall) }}>
            {scores.overall}%
          </div>
          <div className="text-xl font-display mb-1" style={{ color: getScoreColor(scores.overall) }}>
            {getScoreLabel(scores.overall)}
          </div>
          <div className="text-gray-400">Overall Performance</div>

          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <CircularScore value={scores.technical || 0} label="Technical" color="#7c3aed" />
            <CircularScore value={scores.communication || 0} label="Communication" color="#00f5ff" />
            <CircularScore value={scores.hr || 0} label="HR" color="#10b981" />
            <CircularScore value={scores.confidence || 0} label="Confidence" color="#f59e0b" />
            <CircularScore value={scores.eyeContact || 0} label="Eye Contact" color="#ec4899" />
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-display text-gray-400 mb-4">SCORE BREAKDOWN</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {timeline.length > 0 ? (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-display text-gray-400 mb-4">CONFIDENCE TIMELINE</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} fill="url(#cg)" name="Confidence" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 flex items-center justify-center text-gray-600 text-sm">
            No expression timeline data
          </div>
        )}
      </div>

      {/* AI Feedback */}
      {ai.summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-violet-500/10">
          <h2 className="text-sm font-display text-gray-400 mb-4">🤖 AI FEEDBACK</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{ai.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-xs font-medium text-emerald-400 mb-2">✅ STRENGTHS</h3>
              <ul className="space-y-1.5">
                {(ai.strengths || []).map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-emerald-500 shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-red-400 mb-2">⚠ AREAS TO IMPROVE</h3>
              <ul className="space-y-1.5">
                {(ai.weaknesses || []).map((w: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-red-500 shrink-0">→</span>{w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium text-cyan-400 mb-2">💡 ACTION PLAN</h3>
              <ul className="space-y-1.5">
                {(ai.improvements || []).map((tip: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-cyan-500 shrink-0">→</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {ai.nextSteps && (
            <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <span className="text-xs font-medium text-violet-400">NEXT STEPS: </span>
              <span className="text-sm text-gray-300">{ai.nextSteps}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Q&A Transcript */}
      {interview.answers?.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-display text-gray-400 mb-4">📝 Q&A TRANSCRIPT</h2>
          <div className="space-y-4">
            {interview.answers.map((a: any, i: number) => (
              <div key={i} className="border-l-2 border-violet-500/30 pl-4 py-1">
                <div className="text-sm text-gray-400 mb-1">Q{i + 1}: {a.questionText}</div>
                <div className="text-sm text-gray-200 mb-2">{a.userAnswer || <em className="text-gray-600">No answer recorded</em>}</div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${a.aiScore >= 70 ? 'text-emerald-400' : a.aiScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    Score: {a.aiScore || 0}%
                  </span>
                  {a.aiFeedback && <span className="text-xs text-gray-500">{a.aiFeedback}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={() => router.push('/interview')}
          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-display font-semibold
                     hover:from-violet-500 hover:to-purple-500 transition-all btn-glow">
          ⚡ Practice Again
        </button>
        <button onClick={() => router.push('/dashboard')}
          className="px-6 py-3 glass rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all">
          Dashboard
        </button>
      </div>
    </div>
  );
}
