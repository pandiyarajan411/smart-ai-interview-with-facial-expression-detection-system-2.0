require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');

const QUESTIONS = [
  // ── BEGINNER – HR ──
  { text: "Tell me about yourself.", type: "hr", level: "beginner", timeLimit: 120, keywords: ["experience", "skills", "background"] },
  { text: "Why do you want to work here?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "What are your greatest strengths?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "What is your greatest weakness?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "Where do you see yourself in 5 years?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "Why are you leaving your current job?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "What motivates you?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "How do you handle stress and pressure?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "Describe your ideal work environment.", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "What are your salary expectations?", type: "hr", level: "beginner", timeLimit: 60 },
  { text: "Are you a team player or prefer working independently?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "How do you prioritize your work?", type: "hr", level: "beginner", timeLimit: 90 },
  { text: "What do you know about our company?", type: "hr", level: "beginner", timeLimit: 120 },
  { text: "Do you have any questions for us?", type: "hr", level: "beginner", timeLimit: 60 },
  { text: "How did you hear about this position?", type: "hr", level: "beginner", timeLimit: 60 },

  // ── BEGINNER – Communication ──
  { text: "Describe yourself in three words.", type: "communication", level: "beginner", timeLimit: 60 },
  { text: "How would your colleagues describe you?", type: "communication", level: "beginner", timeLimit: 90 },
  { text: "Tell me about a time you had to communicate a complex idea simply.", type: "communication", level: "beginner", timeLimit: 120 },
  { text: "How do you ensure effective communication in a team?", type: "communication", level: "beginner", timeLimit: 90 },
  { text: "Describe a situation where communication broke down and how you resolved it.", type: "communication", level: "beginner", timeLimit: 120 },

  // ── BEGINNER – Behavioral ──
  { text: "Tell me about a time you showed leadership.", type: "behavioral", level: "beginner", timeLimit: 120 },
  { text: "Describe a challenge you overcame.", type: "behavioral", level: "beginner", timeLimit: 120 },
  { text: "Tell me about a time you made a mistake and what you learned.", type: "behavioral", level: "beginner", timeLimit: 120 },
  { text: "Describe a time you worked under a tight deadline.", type: "behavioral", level: "beginner", timeLimit: 120 },
  { text: "Tell me about a time you disagreed with a colleague.", type: "behavioral", level: "beginner", timeLimit: 120 },

  // ── BEGINNER – Aptitude ──
  { text: "If you have 3 apples and give away 1, what fraction do you have left?", type: "aptitude", level: "beginner", timeLimit: 60 },
  { text: "A train travels 60 km/h for 2 hours. How far does it travel?", type: "aptitude", level: "beginner", timeLimit: 60 },
  { text: "What comes next in the series: 2, 4, 8, 16, ___?", type: "aptitude", level: "beginner", timeLimit: 60 },
  { text: "If a shirt costs $40 and is 25% off, what is the sale price?", type: "aptitude", level: "beginner", timeLimit: 60 },
  { text: "Arrange these words to form a sentence: quickly / fox / the / brown / jumped.", type: "aptitude", level: "beginner", timeLimit: 60 },

  // ── BEGINNER – Situational ──
  { text: "What would you do if you disagreed with your manager's decision?", type: "situational", level: "beginner", timeLimit: 120 },
  { text: "How would you handle a situation where you were given unclear instructions?", type: "situational", level: "beginner", timeLimit: 90 },
  { text: "If a customer complained about your service, how would you respond?", type: "situational", level: "beginner", timeLimit: 120 },
  { text: "What would you do if you had two urgent tasks due at the same time?", type: "situational", level: "beginner", timeLimit: 90 },
  { text: "How would you handle a new team member who was struggling?", type: "situational", level: "beginner", timeLimit: 90 },

  // ── INTERMEDIATE – Technical ──
  { text: "Explain the concept of OOP and its four pillars.", type: "technical", level: "intermediate", timeLimit: 150, keywords: ["encapsulation", "inheritance", "polymorphism", "abstraction"] },
  { text: "What is the difference between REST and GraphQL?", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "Explain the CAP theorem in distributed systems.", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "What are the SOLID principles in software engineering?", type: "technical", level: "intermediate", timeLimit: 150 },
  { text: "Describe the difference between SQL and NoSQL databases.", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "What is a microservices architecture and its trade-offs?", type: "technical", level: "intermediate", timeLimit: 150 },
  { text: "Explain the concept of a closure in JavaScript.", type: "technical", level: "intermediate", timeLimit: 90 },
  { text: "What is the event loop in Node.js?", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "Explain React's virtual DOM and reconciliation.", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "What are HTTP status codes and what does each range signify?", type: "technical", level: "intermediate", timeLimit: 90 },
  { text: "Describe the difference between synchronous and asynchronous programming.", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "What is Docker and how does containerization work?", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "Explain indexing in databases and when to use it.", type: "technical", level: "intermediate", timeLimit: 120 },
  { text: "What is CI/CD and why is it important?", type: "technical", level: "intermediate", timeLimit: 90 },
  { text: "Describe common web security vulnerabilities (OWASP Top 10).", type: "technical", level: "intermediate", timeLimit: 150 },

  // ── INTERMEDIATE – HR ──
  { text: "How do you handle multiple competing priorities at once?", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "Tell me about a time you influenced someone without authority.", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "How do you deal with ambiguity in your work?", type: "hr", level: "intermediate", timeLimit: 90 },
  { text: "Describe a time you received critical feedback. How did you respond?", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "Tell me about a project that failed and what you learned.", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "How have you contributed to improving a team process?", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "Describe your approach to mentoring junior team members.", type: "hr", level: "intermediate", timeLimit: 90 },
  { text: "How do you stay updated with industry trends?", type: "hr", level: "intermediate", timeLimit: 90 },
  { text: "Tell me about a time you had to adapt quickly to change.", type: "hr", level: "intermediate", timeLimit: 120 },
  { text: "What strategies do you use to meet tight deadlines?", type: "hr", level: "intermediate", timeLimit: 90 },

  // ── INTERMEDIATE – Behavioral ──
  { text: "Describe a time you led a team through a difficult project.", type: "behavioral", level: "intermediate", timeLimit: 150 },
  { text: "Tell me about a time you had to make a decision with incomplete information.", type: "behavioral", level: "intermediate", timeLimit: 120 },
  { text: "Describe a situation where you had to negotiate a compromise.", type: "behavioral", level: "intermediate", timeLimit: 120 },
  { text: "Tell me about a time you exceeded expectations.", type: "behavioral", level: "intermediate", timeLimit: 120 },
  { text: "Describe a conflict between two team members and how you handled it.", type: "behavioral", level: "intermediate", timeLimit: 120 },

  // ── ADVANCED – Technical ──
  { text: "Design a URL shortener system like bit.ly. Walk me through the architecture.", type: "technical", level: "advanced", timeLimit: 300 },
  { text: "How would you design a real-time chat application that scales to millions of users?", type: "technical", level: "advanced", timeLimit: 300 },
  { text: "Explain consensus algorithms in distributed systems (Raft, Paxos).", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "How do you prevent and handle race conditions in a concurrent system?", type: "technical", level: "advanced", timeLimit: 150 },
  { text: "Explain the differences between L1, L2, and L3 caching strategies.", type: "technical", level: "advanced", timeLimit: 150 },
  { text: "How would you optimize a database query that is taking 30+ seconds?", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "Design a rate-limiting system for an API gateway.", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "Explain event sourcing and CQRS patterns.", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "How would you implement distributed tracing in a microservices system?", type: "technical", level: "advanced", timeLimit: 150 },
  { text: "Design a notification system that handles 1 million push notifications per minute.", type: "technical", level: "advanced", timeLimit: 300 },
  { text: "What are the trade-offs between strong consistency and eventual consistency?", type: "technical", level: "advanced", timeLimit: 150 },
  { text: "Explain the internals of a JavaScript engine (V8) and how JIT compilation works.", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "How do you design an idempotent API?", type: "technical", level: "advanced", timeLimit: 150 },
  { text: "Describe a zero-downtime deployment strategy for a large production system.", type: "technical", level: "advanced", timeLimit: 180 },
  { text: "How would you handle data migration in a live system without downtime?", type: "technical", level: "advanced", timeLimit: 180 },

  // ── ADVANCED – HR / Leadership ──
  { text: "Describe a time you drove organizational change. What was your strategy?", type: "hr", level: "advanced", timeLimit: 180 },
  { text: "How do you build and maintain high-performing engineering teams?", type: "hr", level: "advanced", timeLimit: 150 },
  { text: "Tell me about a time you had to make an unpopular decision.", type: "hr", level: "advanced", timeLimit: 150 },
  { text: "How do you approach hiring decisions and what signals do you look for?", type: "hr", level: "advanced", timeLimit: 150 },
  { text: "Describe how you've handled a critical production incident.", type: "hr", level: "advanced", timeLimit: 180 },
  { text: "How do you set and communicate technical vision to non-technical stakeholders?", type: "hr", level: "advanced", timeLimit: 150 },
  { text: "Describe your approach to technical debt management.", type: "hr", level: "advanced", timeLimit: 150 },
  { text: "Tell me about a time you had to pivot a major technical strategy.", type: "behavioral", level: "advanced", timeLimit: 180 },
  { text: "How do you evaluate build vs buy decisions?", type: "hr", level: "advanced", timeLimit: 120 },
  { text: "Describe a time you mentored someone into a leadership role.", type: "behavioral", level: "advanced", timeLimit: 150 },

  // ── ADVANCED – Situational ──
  { text: "Your team is 3 sprints behind. Stakeholders want the original deadline. What do you do?", type: "situational", level: "advanced", timeLimit: 180 },
  { text: "A senior engineer is resistant to a new architectural decision. How do you handle it?", type: "situational", level: "advanced", timeLimit: 150 },
  { text: "Production is down. You don't know the cause. Walk me through your response.", type: "situational", level: "advanced", timeLimit: 180 },
  { text: "You discover a major security vulnerability in a system you shipped 6 months ago. What do you do?", type: "situational", level: "advanced", timeLimit: 180 },
  { text: "A key team member just resigned 2 weeks before a major release. How do you manage this?", type: "situational", level: "advanced", timeLimit: 150 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartinterview');
    console.log('Connected to MongoDB');

    // Clear existing
    await Question.deleteMany({});
    await User.deleteMany({ email: 'admin@smartinterview.ai' });

    // Insert questions
    await Question.insertMany(QUESTIONS);
    console.log(`✅ Seeded ${QUESTIONS.length} questions`);

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@smartinterview.ai',
      password: 'Admin@1234',
      role: 'admin',
      emailVerified: true
    });
    console.log('✅ Admin user created: admin@smartinterview.ai / Admin@1234');

    // Create demo user
    await User.create({
      name: 'Demo User',
      email: 'demo@smartinterview.ai',
      password: 'Demo@1234',
      role: 'user',
      emailVerified: true,
      totalInterviews: 5,
      averageScore: 78,
      points: 450,
      badges: ['first_interview', 'dedicated']
    });
    console.log('✅ Demo user created: demo@smartinterview.ai / Demo@1234');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
