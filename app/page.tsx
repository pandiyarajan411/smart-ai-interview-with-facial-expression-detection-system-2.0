'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) router.push('/dashboard');
  }, []);

  return (
    <main className="min-h-screen bg-[#030712] relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-700/15 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-700/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 text-center max-w-3xl px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-sm text-violet-300 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          AI-Powered Interview Training Platform
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-black leading-tight mb-6">
          <span className="gradient-text">Smart AI</span>
          <br />
          <span className="text-white">Interview System</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Practice interviews with real-time facial expression analysis, AI feedback, 
          confidence scoring, and personalized improvement plans.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => router.push('/auth')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-display font-semibold text-lg
                       hover:from-violet-500 hover:to-purple-500 transition-all btn-glow neon-violet">
            ⚡ Get Started Free
          </button>
          <button onClick={() => router.push('/auth')}
            className="px-8 py-4 glass rounded-2xl font-display font-semibold text-lg border border-white/10
                       hover:border-violet-500/50 hover:bg-white/5 transition-all">
            Watch Demo →
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: '🎭', label: 'Facial Analysis', desc: 'Real-time emotion & confidence detection' },
            { icon: '🤖', label: 'AI Feedback', desc: 'Personalized tips powered by Claude AI' },
            { icon: '📊', label: 'Deep Analytics', desc: 'Track your progress over time' },
          ].map(f => (
            <div key={f.label} className="glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/20 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="text-sm font-display font-semibold mb-1">{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
