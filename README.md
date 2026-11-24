# SkillBridge AI 🚀
### Complete Full-Stack AI Career Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **"Don't just discover whether you're job-ready. Discover exactly how to become job-ready."**

---

## 🌟 Overview

**SkillBridge AI** is an enterprise-grade, full-stack career intelligence platform built from the ground up for students, new graduates, and developers transitioning into tech. 

Unlike basic landing pages or generic LLM prototypes, SkillBridge AI delivers:
1. **Resume Intelligence**: Parses PDF and DOCX documents into structured ATS profiles.
2. **Deterministic Job Matching**: Replaces opaque AI hallucinations with an explainable mathematical formula (60% Skills, 25% Experience, 15% Education alignment).
3. **Skill Gap Matrix & Verification**: Differentiates self-reported skills from resume-extracted and project-verified competencies.
4. **Personalized 30/60/90 Day Roadmaps**: Sequential milestone tracking persisted in PostgreSQL.
5. **Practical Project Studio**: Recommends architecture-driven portfolio projects designed explicitly to close your missing skills.
6. **AI Mock Interview Studio**: Interactive interview simulator evaluated across 4 rubric dimensions (Relevance, Technical correctness, Clarity, Depth).
7. **Career Telemetry & Analytics**: Visualized with Recharts using live database data.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6, Axios, Framer Motion.
- **Backend:** Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT, bcryptjs, Zod, Multer, `pdf-parse`, `mammoth`.
- **AI Intelligence:** Official Google Gemini SDK (`@google/genai`) with fail-safe deterministic heuristic fallbacks.
- **Database:** Aiven PostgreSQL with SSL connectivity.
- **Testing:** Vitest unit & integration test suites.

---

## 📁 Repository Structure

```text
skillbridge-ai/
├── frontend/                     # React 18 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components (Buttons, Badges, Cards, etc.)
│   │   ├── context/              # Auth & session context
│   │   ├── layouts/              # AppLayout & AuthLayout
│   │   ├── pages/                # Dashboard, Resumes, Jobs, Matches, Skills, Roadmaps, Interviews, Analytics
│   │   ├── services/             # Axios API client services
│   │   ├── styles/               # Tailwind & custom CSS
│   │   └── types/                # TypeScript interface definitions
│   ├── vercel.json               # SPA routing configuration for Vercel
│   └── package.json
│
├── backend/                      # Node.js + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma         # Complete PostgreSQL schema (14 models)
│   │   └── migrations/           # Turnkey SQL migration
│   ├── src/
│   │   ├── config/               # DB, Gemini, and Environment config
│   │   ├── controllers/          # Request handlers
│   │   ├── middleware/           # Auth, Upload, Validation, Error handlers
│   │   ├── routes/               # Modular REST routes
│   │   ├── services/             # Matching, Parsing, Roadmap, and Interview engines
│   │   └── validators/           # Zod payload schemas
│   ├── tests/                    # Vitest unit test suites
│   └── package.json
│
├── docs/                         # In-depth architectural guides
│   ├── ARCHITECTURE.md           # System design & mathematical formula
│   ├── DATABASE_SETUP.md         # Aiven PostgreSQL setup & SSL configuration
│   ├── LOCAL_SETUP.md            # Local developer installation guide
│   ├── API_DOCUMENTATION.md      # REST API endpoint reference
│   └── DEPLOYMENT_GUIDE.md       # Render & Vercel deployment guide
│
├── package.json                  # Root convenience scripts
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your DATABASE_URL (Aiven PostgreSQL or local Postgres)
# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:deploy

# Run test suite
npm test

# Start backend server
npm run dev
```

### 2. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install

# Start Vite dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🧪 Testing Results

All 4 backend test suites (11 tests) run and pass with zero failures:
```text
 ✓ tests/matching.test.ts (3 tests)
 ✓ tests/validation.test.ts (4 tests)
 ✓ tests/roadmap.test.ts (2 tests)
 ✓ tests/interview.test.ts (2 tests)

 Test Files  4 passed (4)
      Tests  11 passed (11)
```

---

## 📚 Documentation Links

- 🏛️ [System Architecture & Matching Formulas](docs/ARCHITECTURE.md)
- 🗄️ [Aiven Cloud Database Setup](docs/DATABASE_SETUP.md)
- 💻 [Local Developer Setup](docs/LOCAL_SETUP.md)
- 🔌 [REST API Documentation](docs/API_DOCUMENTATION.md)
- 🚢 [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

---

## 📄 License
This project is licensed under the MIT License — free for educational, hackathon, and personal portfolio use.
