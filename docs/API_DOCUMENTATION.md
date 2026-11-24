# SkillBridge AI — REST API Documentation

SkillBridge AI provides a predictable RESTful API adhering to standardized response envelopes.

---

## 1. Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ... ]
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Malformed syntax or invalid state.
- `401 Unauthorized`: Missing, expired, or invalid JWT bearer token.
- `404 Not Found`: Resource does not exist or user lacks ownership.
- `422 Unprocessable Entity`: Zod payload validation failure.
- `429 Too Many Requests`: Rate limit exceeded (300 req / 15 min).
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & Authorization

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 3. Endpoints Reference

### 3.1 Health
#### `GET /api/health`
Public health probe for Render, uptime monitors, and database verification.

---

### 3.2 Authentication (`/api/auth`)

#### `POST /api/auth/register`
Create a new user account.
```json
{
  "fullName": "Alex Johnson",
  "email": "alex@example.com",
  "password": "Password123!",
  "targetRole": "Full Stack Software Engineer",
  "experienceLevel": "ENTRY"
}
```

#### `POST /api/auth/login`
Authenticate and obtain JWT.
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

#### `GET /api/auth/me` *(Protected)*
Retrieve authenticated user profile.

#### `PATCH /api/auth/profile` *(Protected)*
Update personal profile details.

#### `POST /api/auth/reset-password`
Change password.

---

### 3.3 Resume Intelligence (`/api/resumes`)

#### `POST /api/resumes` *(Protected, multipart/form-data)*
Upload resume file (`resume`: PDF or DOCX file, max 5MB).
Returns extracted structured profile and automatically synchronizes detected skills into catalog.

#### `GET /api/resumes` *(Protected)*
Get all resumes owned by authenticated user.

#### `GET /api/resumes/:id` *(Protected)*
Get specific resume details and parsed profile.

#### `PATCH /api/resumes/:id` *(Protected)*
Update resume title, set as primary, or edit parsed skills.

#### `DELETE /api/resumes/:id` *(Protected)*
Delete resume record.

---

### 3.4 Job Analyzer (`/api/jobs`)

#### `POST /api/jobs` *(Protected)*
Analyze and store a job description.
```json
{
  "title": "Senior Backend Engineer",
  "company": "Stripe",
  "experienceLevel": "Senior",
  "rawText": "Paste complete job posting here..."
}
```

#### `GET /api/jobs` *(Protected)*
List all previous job analyses.

#### `GET /api/jobs/:id` *(Protected)*
Get parsed requirements breakdown.

#### `DELETE /api/jobs/:id` *(Protected)*
Delete job description.

---

### 3.5 Intelligent Job Matching (`/api/matches`)

#### `POST /api/matches/analyze` *(Protected)*
Run deterministic match calculation between a user resume and a job description.
```json
{
  "resumeId": "uuid-here",
  "jobDescriptionId": "uuid-here"
}
```
**Response Sample:**
```json
{
  "success": true,
  "message": "Match analysis completed successfully",
  "data": {
    "matchReport": {
      "overallMatchScore": 84,
      "skillMatchScore": 88,
      "experienceMatchScore": 80,
      "educationMatchScore": 90,
      "matchedSkills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
      "partialSkills": ["Docker"],
      "missingSkills": ["Kubernetes", "AWS"],
      "breakdown": {
        "formulaExplanation": "Final Score = (Skills: 88% × 60%) + (Experience: 80% × 25%) + (Education: 90% × 15%) = 84%"
      },
      "recommendations": [ ... ]
    }
  }
}
```

#### `GET /api/matches` *(Protected)*
Get previous match reports.

#### `GET /api/matches/:id` *(Protected)*
Get detailed match report by ID.

---

### 3.6 Skill Gap Matrix (`/api/skills`)

#### `GET /api/skills` *(Protected)*
List all skills for user with proficiency and verification source (`SELF_REPORTED`, `RESUME_EXTRACTED`, `PROJECT_VERIFIED`, `ASSESSMENT_VERIFIED`).

#### `POST /api/skills` *(Protected)*
Add self-reported skill.

#### `PATCH /api/skills/:id` *(Protected)*
Update skill proficiency level.

#### `GET /api/skills/gaps` *(Protected)*
Calculate aggregate market skill gaps across all analyzed jobs vs user profile.

---

### 3.7 Learning Roadmaps (`/api/roadmaps`)

#### `POST /api/roadmaps/generate` *(Protected)*
Generate personalized 30, 60, or 90-day learning roadmap.
```json
{
  "targetRole": "Full Stack Software Engineer",
  "durationDays": 60,
  "focusSkills": ["Docker", "PostgreSQL", "System Design"]
}
```

#### `GET /api/roadmaps` *(Protected)*
List user roadmaps.

#### `PATCH /api/roadmaps/:id/milestones/:milestoneId` *(Protected)*
Toggle milestone completion status (`isCompleted: boolean`).

---

### 3.8 Practical Project Studio (`/api/projects`)

#### `POST /api/projects/recommend` *(Protected)*
Recommend targeted practical portfolio projects designed around missing skills.

#### `GET /api/projects` *(Protected)*
List saved user projects.

#### `PATCH /api/projects/:id` *(Protected)*
Update project status (`SAVED`, `IN_PROGRESS`, `COMPLETED`). Marking completed automatically upgrades associated skills to `PROJECT_VERIFIED`.

---

### 3.9 AI Mock Interview Studio (`/api/interviews`)

#### `POST /api/interviews` *(Protected)*
Initialize a mock interview session and generate questions.
```json
{
  "category": "TECHNICAL",
  "difficulty": "MID",
  "targetRole": "Full Stack Engineer",
  "questionCount": 5
}
```

#### `GET /api/interviews` *(Protected)*
List past interview sessions.

#### `GET /api/interviews/:id` *(Protected)*
Get session details with questions and evaluation history.

#### `POST /api/interviews/:id/answers` *(Protected)*
Submit answer for rubric evaluation (relevance, correctness, clarity, depth).

---

### 3.10 Career Analytics (`/api/analytics`)

#### `GET /api/analytics/overview` *(Protected)*
Get aggregated dashboard KPIs, active roadmap, and audit trail.

#### `GET /api/analytics/progress` *(Protected)*
Get time-series trends and domain distributions for Recharts visualizations.
