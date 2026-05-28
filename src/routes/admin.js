const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalInterviews, totalQuestions, recentInterviews] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Interview.countDocuments({ status: 'completed' }),
      Question.countDocuments({ isActive: true }),
      Interview.find({ status: 'completed' }).sort({ completedAt: -1 }).limit(5)
        .populate('user', 'name email').select('level scores completedAt duration')
    ]);

    const avgScore = await Interview.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$scores.overall' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalInterviews, totalQuestions,
        avgScore: Math.round(avgScore[0]?.avg || 0),
        recentInterviews
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ success: true, users, total });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: req.body.ban },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const leaders = await User.find({ role: 'user', isBanned: false })
      .sort({ points: -1 }).limit(20)
      .select('name avatar points totalInterviews bestScore badges');
    res.json({ success: true, leaders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
