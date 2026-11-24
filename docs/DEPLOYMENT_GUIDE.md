# Production Deployment Guide: Render, Vercel & Aiven PostgreSQL

This guide walks you through deploying **SkillBridge AI** into production for zero cost using **Render** for the backend, **Vercel** for the frontend, and **Aiven** for the PostgreSQL database.

---

## 1. Deployment Architecture Summary

| Component | Platform | Free Tier Feasibility | Artifact / Command |
|---|---|---|---|
| **Frontend** | Vercel | 100% Free | SPA via Vite (`frontend/dist`) |
| **Backend** | Render | 100% Free Web Service | Node.js Express (`dist/server.js`) |
| **Database** | Aiven | 100% Free PostgreSQL | Cloud Managed PostgreSQL with SSL |

---

## 2. Deploying Backend to Render

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub.

### Step 2: Create a Web Service on Render
1. Log in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name:** `skillbridge-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Region:** Pick the region closest to your Aiven database.
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`

### Step 3: Configure Render Environment Variables
Under the **Environment** tab, add the following variables:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode |
| `DATABASE_URL` | `postgres://avnadmin:...@...aivencloud.com:12345/defaultdb?sslmode=require` | Aiven PostgreSQL connection URI |
| `JWT_SECRET` | `generate-a-strong-random-32-char-secret-string` | Used to sign auth tokens |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Comma-separated allowed frontend URLs |
| `MAX_FILE_SIZE` | `5242880` | 5MB upload limit |

*(Render automatically injects the `PORT` variable, and the backend dynamically reads `process.env.PORT`)*

### Step 4: Run Migrations on Render
To apply the database schema to your Aiven PostgreSQL:
1. In Render, navigate to your backend web service.
2. In the top right, click **Manual Deploy** $\rightarrow$ **Clear build cache & deploy**, or use the Render Shell:
   ```bash
   npx prisma migrate deploy
   ```
3. Verify your backend is running by opening:
   `https://skillbridge-backend.onrender.com/api/health`

---

## 3. Deploying Frontend to Vercel

### Step 1: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your GitHub repository.

### Step 2: Configure Project Settings
- **Framework Preset:** `Vite`
- **Root Directory:** Click **Edit** and choose `frontend`.
- **Build Command:** `npm run build` (or `tsc && vite build`)
- **Output Directory:** `dist`

### Step 3: Set Environment Variables
Add the environment variable connecting to your deployed Render backend:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://skillbridge-backend.onrender.com/api` |

*(Note: replace with your actual Render backend URL, including the `/api` prefix).*

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy your application in under a minute!  
Single-page application (SPA) routing is pre-configured via `frontend/vercel.json`.

---

## 4. Connecting Frontend and Backend

1. Copy your Vercel production domain (e.g., `https://skillbridge-ai.vercel.app`).
2. Go back to Render $\rightarrow$ **Environment Variables**.
3. Update `ALLOWED_ORIGINS`:
   ```env
   ALLOWED_ORIGINS=https://skillbridge-ai.vercel.app,http://localhost:5173
   ```
4. Save changes.

---

## 5. Free-Tier Nuances & Best Practices

- **Render Inactivity Spindown:** On Render's free tier, backend instances spin down after 15 minutes of inactivity. The first request after spindown may take ~30–45 seconds to wake up. This is normal.
- **Aiven Inactivity:** Check your Aiven project dashboard to ensure your free tier service remains active and within quota.
- **Gemini Free Tier:** Google Gemini offers free daily rate limits that are more than sufficient for portfolio and hackathon usage. If exhausted, SkillBridge AI automatically falls back to its deterministic parsing and evaluation engines.
