import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  targetRole: z.string().optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR']).default('ENTRY'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  targetRole: z.string().optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR']).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateResumeSchema = z.object({
  title: z.string().min(1).optional(),
  isPrimary: z.boolean().optional(),
  parsedData: z.record(z.any()).optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().optional().default('Undisclosed Company'),
  experienceLevel: z.string().default('Mid-Level'),
  rawText: z.string().min(20, 'Please provide the job description text (min 20 characters)'),
});

export const runMatchSchema = z.object({
  resumeId: z.string().uuid('Valid Resume ID is required'),
  jobDescriptionId: z.string().uuid('Valid Job Description ID is required'),
});

export const updateSkillProficiencySchema = z.object({
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  verificationSource: z.enum(['SELF_REPORTED', 'RESUME_EXTRACTED', 'PROJECT_VERIFIED', 'ASSESSMENT_VERIFIED']).optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
});

export const addCustomSkillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters'),
  category: z.string().default('Technical'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  yearsExperience: z.number().min(0).default(1),
});

export const createRoadmapSchema = z.object({
  targetRole: z.string().min(2, 'Target role is required'),
  durationDays: z.number().refine(val => [30, 60, 90].includes(val), {
    message: 'Duration must be 30, 60, or 90 days',
  }).default(60),
  focusSkills: z.array(z.string()).optional(),
});

export const updateMilestoneSchema = z.object({
  isCompleted: z.boolean(),
});

export const createProjectRecommendationSchema = z.object({
  targetRole: z.string().min(2, 'Target role is required'),
  missingSkills: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(['SAVED', 'IN_PROGRESS', 'COMPLETED']),
});

export const startInterviewSessionSchema = z.object({
  title: z.string().default('AI Mock Interview'),
  category: z.enum(['TECHNICAL', 'HR', 'BEHAVIORAL', 'ROLE_SPECIFIC', 'PROJECT_BASED']).default('TECHNICAL'),
  targetRole: z.string().min(2, 'Target role is required'),
  difficulty: z.enum(['ENTRY', 'MID', 'SENIOR']).default('MID'),
  questionCount: z.number().min(3).max(10).default(5),
});

export const submitInterviewAnswerSchema = z.object({
  questionId: z.string().uuid('Question ID is required'),
  userText: z.string().min(5, 'Answer must contain at least 5 characters'),
});
