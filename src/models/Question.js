const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'hr', 'aptitude', 'behavioral', 'situational', 'communication'],
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  expectedAnswer: String,
  keywords: [String],         // Key terms for AI scoring
  timeLimit: {                // seconds
    type: Number,
    default: 120
  },
  followUpEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  avgScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

questionSchema.index({ level: 1, type: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);
