const Interview = require('../models/Interview');
const Question = require('../models/Question');
const User = require('../models/User');
const { generateAIFeedback, evaluateAnswer, generateFollowUp } = require('../utils/aiHelper');

// GET /api/interviews
exports.getInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, level } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (level) filter.level = level;

    const interviews = await Interview.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-answers -expressionTimeline');

    const total = await Interview.countDocuments(filter);

    res.json({ success: true, interviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews
exports.startInterview = async (req, res, next) => {
  try {
    const { level = 'beginner', category = 'mixed', questionCount = 10 } = req.body;

    // Fetch random questions for this level
    const questions = await Question.aggregate([
      { $match: { level, isActive: true, ...(category !== 'mixed' ? { type: category } : {}) } },
      { $sample: { size: Math.min(questionCount, 20) } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this configuration' });
    }

    const interview = await Interview.create({
      user: req.user.id,
      level,
      category,
      questionCount: questions.length,
      status: 'in_progress'
    });

    res.status(201).json({ success: true, interview, questions });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/:id/answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, questionText, questionType, userAnswer, confidenceSnapshot, timeTaken } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // AI score the answer
    const { score, feedback } = await evaluateAnswer(questionText, userAnswer, questionType);

    interview.answers.push({
      questionId, questionText, questionType,
      userAnswer, aiScore: score, aiFeedback: feedback,
      timeTaken, confidenceSnapshot
    });

    await interview.save();
    res.json({ success: true, score, feedback });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/:id/complete
exports.completeInterview = async (req, res, next) => {
  try {
    const { expressionTimeline, speechAnalysis, duration, recordingUrl } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Calculate scores
    const answers = interview.answers;
    const avgAnswerScore = answers.reduce((s, a) => s + a.aiScore, 0) / (answers.length || 1);

    // Facial analysis aggregation
    let facialAnalysis = { avgConfidence: 75, avgEyeContact: 70, avgNervousness: 30, dominantEmotion: 'neutral' };
    if (expressionTimeline && expressionTimeline.length > 0) {
      facialAnalysis.avgConfidence = Math.round(expressionTimeline.reduce((s, t) => s + t.confidence, 0) / expressionTimeline.length);
      facialAnalysis.avgEyeContact = Math.round(expressionTimeline.reduce((s, t) => s + t.eyeContact, 0) / expressionTimeline.length);
      facialAnalysis.avgNervousness = Math.round(expressionTimeline.reduce((s, t) => s + t.nervousness, 0) / expressionTimeline.length);
      const emotionCounts = {};
      expressionTimeline.forEach(t => { emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1; });
      facialAnalysis.dominantEmotion = Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0];
    }

    // Set scores
    interview.scores.technical = Math.round(avgAnswerScore);
    interview.scores.communication = speechAnalysis?.clarityScore || 72;
    interview.scores.hr = Math.round(avgAnswerScore * 0.9 + 10);
    interview.scores.confidence = facialAnalysis.avgConfidence;
    interview.scores.eyeContact = facialAnalysis.avgEyeContact;
    interview.scores.overall = Math.round(
      (interview.scores.technical + interview.scores.communication +
       interview.scores.hr + interview.scores.confidence) / 4
    );

    interview.facialAnalysis = facialAnalysis;
    interview.speechAnalysis = speechAnalysis || {};
    interview.expressionTimeline = expressionTimeline || [];
    interview.duration = duration;
    interview.recordingUrl = recordingUrl;
    interview.status = 'completed';
    interview.completedAt = new Date();

    // Generate AI feedback summary
    interview.aiFeedback = await generateAIFeedback(interview);

    await interview.save();

    // Update user stats
    await updateUserStats(req.user.id, interview.scores.overall, interview.scores.confidence);

    res.json({ success: true, interview });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/ai-followup
exports.getFollowUp = async (req, res, next) => {
  try {
    const { question, answer } = req.body;
    const followUp = await generateFollowUp(question, answer);
    res.json({ success: true, followUp });
  } catch (err) {
    next(err);
  }
};

async function updateUserStats(userId, overallScore, confidenceScore) {
  const user = await User.findById(userId);
  const n = user.totalInterviews;
  user.totalInterviews += 1;
  user.averageScore = Math.round((user.averageScore * n + overallScore) / (n + 1));
  user.averageConfidence = Math.round((user.averageConfidence * n + confidenceScore) / (n + 1));
  if (overallScore > user.bestScore) user.bestScore = overallScore;
  user.points += Math.round(overallScore / 10) * 10;

  // Award badges
  if (user.totalInterviews === 1 && !user.badges.includes('first_interview')) user.badges.push('first_interview');
  if (user.totalInterviews >= 10 && !user.badges.includes('dedicated')) user.badges.push('dedicated');
  if (user.bestScore >= 90 && !user.badges.includes('high_achiever')) user.badges.push('high_achiever');
  if (confidenceScore >= 85 && !user.badges.includes('confident')) user.badges.push('confident');

  await user.save({ validateBeforeSave: false });
}
