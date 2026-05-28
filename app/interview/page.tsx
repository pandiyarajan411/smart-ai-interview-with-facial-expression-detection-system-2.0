'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebcam, useFaceDetection, useSpeech } from '@/hooks/useFaceDetection';
import { useInterviewStore, useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function InterviewPage() {
  const router = useRouter();
  const { videoRef, isActive, hasPermission, startWebcam, stopWebcam } = useWebcam();
  const { metrics, startDetection, stopDetection } = useFaceDetection(videoRef);
  const { transcript, isListening, startListening, stopListening, clearTranscript } = useSpeech();

  const { currentInterview, questions, currentQuestionIndex, answers,
          nextQuestion, prevQuestion, saveAnswer, addExpressionData, reset } = useInterviewStore();

  const [phase, setPhase] = useState<'setup' | 'interview' | 'completing'>('setup');
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [category, setCategory] = useState('mixed');
  const [isStarting, setIsStarting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const expressionCapture = useRef<NodeJS.Timeout>();
  const startTime = useRef<number>(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Capture expression data every 5s
  useEffect(() => {
    if (phase !== 'interview') return;
    expressionCapture.current = setInterval(() => {
      addExpressionData({
        timestamp: Date.now() - startTime.current,
        emotion: metrics.emotion,
        confidence: metrics.confidence,
        eyeContact: metrics.eyeContact,
        nervousness: metrics.nervousness,
      });
    }, 5000);
    return () => clearInterval(expressionCapture.current);
  }, [phase, metrics]);

  // Timer
  useEffect(() => {
    if (phase !== 'interview' || !currentQuestion) return;
    setTimeLeft(currentQuestion.timeLimit || 120);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleNext(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, phase]);

  // Sync transcript to answer
  useEffect(() => {
    if (transcript) setUserAnswer(transcript);
  }, [transcript]);

  const handleStart = async () => {
    if (!isActive) {
      await startWebcam();
    }
    setIsStarting(true);
    try {
      const { interview, questions: qs } = await api.startInterview(level, category, 10) as any;
      useInterviewStore.getState().setInterview(interview, qs);
      startTime.current = Date.now();
      setPhase('interview');
      startDetection();
      startListening();
    } catch (err) {
      console.error(err);
      alert('Failed to start interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleNext = async () => {
    // Save current answer
    if (currentInterview && currentQuestion) {
      saveAnswer(currentQuestionIndex, userAnswer);
      stopListening();
      await api.submitAnswer(currentInterview._id, {
        questionId: currentQuestion._id,
        questionText: currentQuestion.text,
        questionType: currentQuestion.type,
        userAnswer,
        timeTaken: (currentQuestion.timeLimit || 120) - timeLeft,
        confidenceSnapshot: {
          overall: metrics.confidence,
          emotion: metrics.emotion,
          eyeContact: metrics.eyeContact,
          nervousness: metrics.nervousness,
        }
      }).catch(console.error);
    }

    if (currentQuestionIndex < questions.length - 1) {
      clearTranscript();
      setUserAnswer('');
      setFollowUp('');
      nextQuestion();
      startListening();
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setPhase('completing');
    stopDetection();
    stopListening();
    stopWebcam();

    const store = useInterviewStore.getState();
    try {
      const result = await api.completeInterview(currentInterview._id, {
        expressionTimeline: store.expressionData,
        speechAnalysis: {
          clarityScore: 72,
          totalWords: store.speechTranscript.split(' ').length,
          transcription: store.speechTranscript,
        },
        duration: Math.round((Date.now() - startTime.current) / 1000),
      }) as any;

      reset();
      router.push(`/history/${result.interview._id}`);
    } catch (err) {
      console.error(err);
      router.push('/history');
    }
  };

  const speakQuestion = () => {
    if (!currentQuestion || typeof window === 'undefined') return;
    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
  };

  const getEmotionColor = (emotion: string) => {
    const map: Record<string, string> = {
      happy: '#10b981', neutral: '#6366f1', surprised: '#f59e0b',
      fearful: '#ef4444', angry: '#dc2626', disgusted: '#8b5cf6', sad: '#3b82f6',
    };
    return map[emotion] || '#6366f1';
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8 max-w-2xl w-full border border-violet-500/20">
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Start Interview</h1>
          <p className="text-gray-400 mb-8">Configure your AI interview session</p>

          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-3 block">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`p-4 rounded-xl border capitalize font-medium transition-all ${
                      level === l
                        ? 'border-violet-500 bg-violet-500/20 text-violet-300 neon-violet'
                        : 'border-white/10 text-gray-400 hover:border-violet-500/50'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-3 block">Category</label>
              <div className="grid grid-cols-3 gap-3">
                {(['mixed', 'technical', 'hr', 'behavioral', 'aptitude', 'situational']).map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`p-3 rounded-xl border capitalize text-sm transition-all ${
                      category === c
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-white/10 text-gray-400 hover:border-cyan-500/50'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <span className="text-amber-400 text-lg mt-0.5">⚠</span>
              <p className="text-sm text-amber-300">
                This interview will activate your webcam and microphone for facial expression analysis and speech-to-text. 
                Make sure you're in a well-lit, quiet environment.
              </p>
            </div>

            <button onClick={handleStart} disabled={isStarting}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-display font-semibold text-lg
                         hover:from-violet-500 hover:to-purple-500 transition-all btn-glow disabled:opacity-50">
              {isStarting ? 'Initializing...' : '⚡ Begin Interview'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'completing') {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center animate-pulse">
            <span className="text-4xl">🧠</span>
          </div>
          <h2 className="text-2xl font-display font-bold gradient-text">Analyzing your interview...</h2>
          <p className="text-gray-400">AI is processing your responses and facial data</p>
          <div className="flex items-center gap-2 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] bg-grid p-4 lg:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

        {/* Webcam panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-2xl overflow-hidden relative aspect-video">
            <video ref={videoRef} muted playsInline
              className="w-full h-full object-cover" />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-gray-400">Camera loading...</span>
              </div>
            )}
            {isActive && (
              <>
                <div className="scan-line" />
                <div className="corner-tl" /><div className="corner-tr" />
                <div className="corner-bl" /><div className="corner-br" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-mono">REC</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 glass rounded-lg p-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Emotion:</span>
                    <span style={{ color: getEmotionColor(metrics.emotion) }} className="font-medium capitalize">
                      {metrics.emotion}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Metrics */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-display text-gray-400">LIVE ANALYSIS</h3>
            {[
              { label: 'Confidence', value: metrics.confidence, color: '#10b981' },
              { label: 'Eye Contact', value: metrics.eyeContact, color: '#00f5ff' },
              { label: 'Nervousness', value: metrics.nervousness, color: '#ef4444', invert: true },
              { label: 'Smile', value: metrics.smile, color: '#f59e0b' },
            ].map(({ label, value, color, invert }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{label}</span>
                  <span style={{ color }} className="font-mono font-bold">{value}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${value}%`, backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Speech */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <h3 className="text-sm font-display text-gray-400">SPEECH</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {userAnswer || <span className="text-gray-600">Speak your answer...</span>}
            </p>
          </div>
        </div>

        {/* Main question area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-mono">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize
                ${currentQuestion?.type === 'technical' ? 'bg-cyan-500/20 text-cyan-400' :
                  currentQuestion?.type === 'hr' ? 'bg-violet-500/20 text-violet-400' :
                  currentQuestion?.type === 'behavioral' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-orange-500/20 text-orange-400'}`}>
                {currentQuestion?.type}
              </span>
            </div>
            <div className={`font-mono text-xl font-bold ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestionIndex}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="glass-strong rounded-2xl p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <p className="text-xl lg:text-2xl font-display font-semibold leading-relaxed">
                  {currentQuestion?.text}
                </p>
                <button onClick={speakQuestion} title="Read question aloud"
                  className="shrink-0 w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-all">
                  {isSpeaking ? '🔊' : '🔈'}
                </button>
              </div>

              {followUp && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-400 font-medium mb-1">AI FOLLOW-UP</p>
                  <p className="text-sm text-amber-200">{followUp}</p>
                </div>
              )}

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type or speak your answer..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white
                           placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500/50 transition-all"
              />

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={async () => {
                    if (!currentQuestion) return;
                    const { followUp: f } = await api.getAIFollowUp(currentQuestion.text, userAnswer) as any;
                    setFollowUp(f);
                  }}
                  className="flex-1 py-2.5 text-sm glass rounded-xl border border-cyan-500/20 text-cyan-400
                             hover:bg-cyan-500/10 transition-all">
                  🤖 AI Follow-up
                </button>
                <button onClick={prevQuestion} disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 text-sm glass rounded-xl border border-white/10 text-gray-400
                             hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
                  ← Prev
                </button>
                <button onClick={handleNext}
                  className="flex-1 py-2.5 text-sm bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-all btn-glow">
                  {currentQuestionIndex === questions.length - 1 ? '✅ Finish' : 'Next →'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress */}
          <div className="glass rounded-2xl p-4">
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentQuestionIndex ? 'bg-violet-500' :
                  i === currentQuestionIndex ? 'bg-cyan-400' : 'bg-white/10'
                }`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
