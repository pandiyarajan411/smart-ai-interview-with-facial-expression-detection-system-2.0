# Smart AI Interview System

A premium, full-stack AI-powered interview practice platform with real-time facial expression analysis, confidence scoring, speech-to-text, and personalized AI feedback.

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Three.js** (3D background)
- **GSAP** (scroll animations)
- **Shadcn UI** (components)
- **Recharts** (analytics)
- **Face-api.js** (facial detection)
- **TensorFlow.js**
- **MediaPipe**

### Backend
- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Multer** (file uploads)
- **Bcrypt** (password hashing)
- **Nodemailer** (email)
- **Express-rate-limit**

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourname/smart-interview.git
cd smart-interview

# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

### 2. Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smartinterview
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

Default admin: `admin@smartinterview.ai` / `Admin@1234`

## Project Structure

```
smart-interview/
├── frontend/                    # Next.js application
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── auth/            # Login / Register / Reset
│       │   ├── dashboard/       # Main dashboard
│       │   ├── interview/       # Interview sessions
│       │   ├── history/         # Past interviews
│       │   ├── profile/         # User profile
│       │   └── admin/           # Admin panel
│       ├── components/
│       │   ├── ui/              # Reusable UI atoms
│       │   ├── layout/          # Sidebar, Navbar, etc.
│       │   ├── webcam/          # Camera + face detection
│       │   ├── charts/          # Analytics charts
│       │   └── interview/       # Question cards, timer
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # API client, utils
│       ├── store/               # Zustand global state
│       └── types/               # TypeScript types
│
└── backend/                     # Express API
    └── src/
        ├── controllers/         # Route handlers
        ├── models/              # Mongoose schemas
        ├── routes/              # API endpoints
        ├── middleware/          # Auth, validation, etc.
        ├── utils/               # Helpers, email, jwt
        └── config/              # DB, cloudinary config
```

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/forgot-password | Send reset email |
| POST | /api/auth/reset-password/:token | Reset password |
| GET | /api/auth/me | Get current user |

### Interviews
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/interviews | Get user's interviews |
| POST | /api/interviews | Start new interview |
| GET | /api/interviews/:id | Get interview details |
| PUT | /api/interviews/:id | Update interview |
| POST | /api/interviews/:id/complete | Complete interview |
| GET | /api/interviews/:id/report | Get full report |

### Questions
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/questions | Get questions (filtered) |
| POST | /api/questions | Create question (admin) |
| PUT | /api/questions/:id | Update question (admin) |
| DELETE | /api/questions/:id | Delete question (admin) |
| POST | /api/questions/ai-followup | Generate AI follow-up |

### Users (Admin)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/users | List all users |
| PUT | /api/admin/users/:id/ban | Ban user |
| GET | /api/admin/stats | System statistics |

## Deployment

### Docker

```bash
docker-compose up --build
```

### Manual (Vercel + Railway)

1. Push `frontend/` to Vercel
2. Push `backend/` to Railway
3. Set env vars on both platforms
4. Point `NEXT_PUBLIC_API_URL` to Railway URL

## Features Overview

- ✅ JWT Auth with refresh tokens
- ✅ Real-time webcam facial analysis (7 emotions)
- ✅ Confidence scoring algorithm
- ✅ Speech-to-text via Web Speech API
- ✅ Claude AI question generation & evaluation
- ✅ 3 difficulty levels × 100+ questions
- ✅ Session recording (MediaRecorder API)
- ✅ PDF report generation
- ✅ Admin panel with user management
- ✅ Leaderboard & achievement badges
- ✅ Fully responsive + dark mode
- ✅ Docker-ready
