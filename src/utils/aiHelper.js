/**
 * AI Helper — Anthropic Claude API integration
 * Used server-side for answer evaluation and feedback generation
 */

const evaluateAnswer = async (question, answer, questionType) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are an expert interview evaluator. Evaluate this ${questionType} interview answer.

Question: "${question}"
Answer: "${answer}"

Return ONLY valid JSON (no markdown, no explanation):
{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentences of specific, constructive feedback>"
}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{"score":60,"feedback":"Answer received."}';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('AI evaluate error:', err.message);
    return { score: 65, feedback: 'Your answer showed some understanding of the topic.' };
  }
};

const generateAIFeedback = async (interview) => {
  try {
    const scores = interview.scores;
    const answers = interview.answers.slice(0, 5); // send first 5 for context

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an expert career coach. Generate a comprehensive interview feedback report.

Interview Level: ${interview.level}
Scores: Technical=${scores.technical}, Communication=${scores.communication}, HR=${scores.hr}, Confidence=${scores.confidence}
Dominant Emotion: ${interview.facialAnalysis?.dominantEmotion}
Eye Contact Score: ${interview.scores.eyeContact}%

Sample Q&As:
${answers.map(a => `Q: ${a.questionText}\nA: ${a.userAnswer || '(no answer)'}`).join('\n\n')}

Return ONLY valid JSON:
{
  "summary": "<3-4 sentence overall summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "nextSteps": "<1-2 sentence action plan>"
}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('AI feedback error:', err.message);
    return {
      summary: 'You completed the interview session. Review your scores below for detailed insights.',
      strengths: ['Completed the interview', 'Showed effort'],
      weaknesses: ['Could improve answer depth'],
      improvements: ['Practice more technical questions', 'Work on eye contact', 'Structure answers with STAR method'],
      nextSteps: 'Review the question bank and schedule another session tomorrow.'
    };
  }
};

const generateFollowUp = async (question, answer) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `As an interviewer, generate ONE natural follow-up question based on this exchange.
Question: "${question}"
Candidate's answer: "${answer}"
Reply with ONLY the follow-up question text, nothing else.`
        }]
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text?.trim() || 'Can you elaborate more on that?';
  } catch (err) {
    return 'Can you give a specific example of that from your experience?';
  }
};

const generateInterviewQuestion = async (level, category, previousQuestions = []) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Generate a unique ${level} level ${category} interview question.
Previously asked: ${previousQuestions.slice(-3).join(' | ')}
Return ONLY the question text.`
        }]
      })
    });

    const data = await response.json();
    return data.content?.[0]?.text?.trim();
  } catch (err) {
    return null;
  }
};

module.exports = { evaluateAnswer, generateAIFeedback, generateFollowUp, generateInterviewQuestion };
