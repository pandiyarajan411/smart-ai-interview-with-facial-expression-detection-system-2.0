const express = require('express');
const router = express.Router();
const {
  getInterviews, startInterview, getInterview,
  submitAnswer, completeInterview, getFollowUp
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getInterviews).post(startInterview);
router.route('/:id').get(getInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.post('/ai-followup', getFollowUp);

module.exports = router;
