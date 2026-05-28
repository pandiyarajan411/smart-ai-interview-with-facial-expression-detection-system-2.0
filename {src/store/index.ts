import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  totalInterviews: number;
  averageScore: number;
  points: number;
  badges: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user, token) => set({ user, token }),

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token && !!get().user,

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Interview store
interface InterviewState {
  currentInterview: any | null;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  expressionData: any[];
  speechTranscript: string;
  isRecording: boolean;

  setInterview: (interview: any, questions: any[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  saveAnswer: (index: number, answer: string) => void;
  addExpressionData: (data: any) => void;
  appendTranscript: (text: string) => void;
  setRecording: (val: boolean) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  currentInterview: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  expressionData: [],
  speechTranscript: '',
  isRecording: false,

  setInterview: (interview, questions) =>
    set({ currentInterview: interview, questions, currentQuestionIndex: 0, answers: {} }),

  nextQuestion: () =>
    set((s) => ({ currentQuestionIndex: Math.min(s.currentQuestionIndex + 1, s.questions.length - 1) })),

  prevQuestion: () =>
    set((s) => ({ currentQuestionIndex: Math.max(s.currentQuestionIndex - 1, 0) })),

  saveAnswer: (index, answer) =>
    set((s) => ({ answers: { ...s.answers, [index]: answer } })),

  addExpressionData: (data) =>
    set((s) => ({ expressionData: [...s.expressionData, data] })),

  appendTranscript: (text) =>
    set((s) => ({ speechTranscript: s.speechTranscript + ' ' + text })),

  setRecording: (val) => set({ isRecording: val }),

  reset: () => set({
    currentInterview: null, questions: [], currentQuestionIndex: 0,
    answers: {}, expressionData: [], speechTranscript: '', isRecording: false
  }),
}));
