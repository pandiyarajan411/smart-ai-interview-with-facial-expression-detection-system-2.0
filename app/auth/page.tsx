'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api.login(form.email, form.password) as any;
        setUser(data.user, data.token);
        router.push('/dashboard');
      } else if (mode === 'register') {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
        const data = await api.register(form.name, form.email, form.password) as any;
        setUser(data.user, data.token);
        router.push('/dashboard');
      } else {
        await api.forgotPassword(form.email);
        setSuccess('Reset link sent! Check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-radial from-violet-900/30 via-transparent to-transparent" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl animate-float" />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="relative z-10 text-center max-w-md">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-4xl font-display font-black gradient-text mb-4">
            Smart AI Interview
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Practice interviews with real-time AI coaching, facial expression analysis, and personalized feedback.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[['🎯', '100+', 'Questions'], ['🏆', '3', 'Levels'], ['📊', 'Live', 'Analysis']].map(([icon, val, label]) => (
              <div key={label} className="glass rounded-xl p-4">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-lg font-display font-bold text-violet-300">{val}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md">
          <div className="glass-strong rounded-3xl p-8 border border-violet-500/20">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1">
              {(['login', 'register'] as const).map(tab => (
                <button key={tab} onClick={() => { setMode(tab); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    mode === tab ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}>{tab === 'login' ? 'Sign In' : 'Sign Up'}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form key={mode} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit} className="space-y-4">

                {mode === 'register' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                    <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                                 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                    <input type="password" required value={form.password} onChange={e => update('password', e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                                 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Confirm Password</label>
                    <input type="password" required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                                 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all" />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" onClick={() => setMode('forgot')}
                      className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</button>
                  </div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    ⚠ {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
                    ✅ {success}
                  </motion.div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-display font-semibold
                             hover:from-violet-500 hover:to-purple-500 transition-all btn-glow disabled:opacity-50 mt-2">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>

                {mode === 'forgot' && (
                  <button type="button" onClick={() => setMode('login')}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-all">
                    ← Back to Sign In
                  </button>
                )}
              </motion.form>
            </AnimatePresence>

            {/* Demo account hint */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-gray-600 mb-2">Try demo account</p>
              <button onClick={() => { update('email', 'demo@smartinterview.ai'); update('password', 'Demo@1234'); setMode('login'); }}
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4">
                demo@smartinterview.ai / Demo@1234
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
