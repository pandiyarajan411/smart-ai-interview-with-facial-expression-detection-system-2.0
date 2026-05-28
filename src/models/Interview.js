const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: String,
  questionType: String,
  userAnswer: String,
  aiScore: { type: Number, min: 0, max: 100 },
  aiFeedback: String,
  timeTaken: Number, // seconds
  confidenceSnapshot: {
    overall: Number,
    emotion: String,
    eyeContact: Number,
    nervousness: Number,
  }
}, { _id: false });

const expressionTimelineSchema = new mongoose.Schema({
  timestamp: Number,
  emotion: String,
  confidence: Number,
  eyeContact: Number,
  nervousness: Number,
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'hr', 'aptitude', 'behavioral', 'mixed'],
    default: 'mixed'
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  answers: [answerSchema],
  expressionTimeline: [expressionTimelineSchema],
  // Scores
  scores: {
    overall: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    hr: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    eyeContact: { type: Number, default: 0 },
  },
  // Facial analysis summary
  facialAnalysis: {
    dominantEmotion: String,
    avgConfidence: Number,
    avgEyeContact: Number,
    avgNervousness: Number,
    smileFrequency: Number,
    headMovement: String,
  },
  // Speech analysis
  speechAnalysis: {
    avgSpeed: Number, // words per minute
    clarityScore: Number,
    hesitationCount: Number,
    totalWords: Number,
    transcription: String,
  },
  // AI feedback
  aiFeedback: {
    summary: String,
    strengths: [String],
    weaknesses: [String],
    improvements: [String],
    nextSteps: String,
  },
  // Meta
  duration: Number, // seconds
  questionCount: Number,
  completedAt: Date,
  recordingUrl: String,
}, {
  timestamps: true
});

// Compute overall score before save
interviewSchema.pre('save', function (next) {
  if (this.answers.length > 0) {
    const avg = (arr, key) =>
      arr.reduce((s, a) => s + (a[key] || 0), 0) / arr.length;
    this.scores.overall = Math.round(
      (this.scores.technical + this.scores.communication +
       this.scores.hr + this.scores.confidence) / 4
    );
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);
