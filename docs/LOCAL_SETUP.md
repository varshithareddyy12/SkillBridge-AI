# Local Development & Setup Guide

This guide walks you through setting up and running **SkillBridge AI** locally on your machine.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node v20+ and v26+)
- **npm**: v9.0.0 or higher
- **PostgreSQL Database**: Free Aiven Cloud PostgreSQL instance or local PostgreSQL.

---

## 2. Project Layout

The repository is organized into independent frontend and backend workspaces:

```text
skillbridge-ai/
├── backend/          # Node.js + Express + Prisma + TypeScript API
├── frontend/         # React 18 + Vite + TypeScript + Tailwind SPA
├── docs/             # Architecture, Database, API, and Deployment Guides
├── package.json      # Convenience root scripts
└── README.md
```

---

## 3. Backend Setup

### Step 1: Navigate to Backend & Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` folder based on `.env.example`:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On Linux/macOS
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@your-aiven-pg-host.aivencloud.com:12345/defaultdb?sslmode=require
JWT_SECRET=your-secure-jwt-secret-here
GEMINI_API_KEY=your_gemini_api_key_here # Optional: Platform works with fallback engine if omitted
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_FILE_SIZE=5242880
```

### Step 3: Generate Prisma Client & Run Migrations
```bash
# Generate Prisma Client types
npm run prisma:generate

# Deploy migrations to your database
npm run prisma:deploy
```

### Step 4: Run Backend Tests
Ensure all unit and integration tests pass:
```bash
npm test
```

### Step 5: Start Backend Development Server
```bash
npm run dev
```
The backend API will run on `http://localhost:5000`.  
Verify health by visiting `http://localhost:5000/api/health`.

---

## 4. Frontend Setup

### Step 1: Open a New Terminal & Navigate to Frontend
```bash
cd frontend
npm install
```

### Step 2: Configure Frontend Environment Variables (Optional in Dev)
By default, the Vite dev server proxies `/api` requests to `http://localhost:5000`.  
If you want to explicitly define the API URL, copy `.env.example`:
```bash
Copy-Item .env.example .env
```
Inside `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Start Frontend Development Server
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`. Open this URL in your web browser.

---

## 5. Convenient Root Scripts

From the root project directory, you can also manage both workspaces:

```bash
# Install dependencies across both workspaces
npm run install:all

# Run backend tests
npm run test:backend

# Build both applications
npm run build:all

# Run servers
npm run dev:backend
npm run dev:frontend
```

---

## 6. Testing the Application Features

1. **Register:** Go to `http://localhost:5173/register` and create an account.
2. **Upload Resume:** Go to **Resume Intelligence**, drag-and-drop or select any PDF or DOCX resume. Watch the structured profile, skills, and experience parse automatically.
3. **Analyze Job:** Go to **Job Analyzer**, paste any software engineering job description (e.g. from LinkedIn or Indeed).
4. **Run Job Match:** Go to **Job Matching Engine**, select your resume and the job, and click **Compute Explainable Match**. Inspect the deterministic score and breakdown.
5. **Explore Roadmaps:** Go to **Learning Roadmap** to view 30, 60, or 90-day milestone curriculums.
6. **Practice Interviews:** Go to **AI Mock Interview Studio**, choose Technical or Behavioral, and test submitting answers evaluated by the engineering rubric.
