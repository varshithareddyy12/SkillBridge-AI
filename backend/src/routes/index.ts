import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import jobRoutes from './job.routes.js';
import matchRoutes from './match.routes.js';
import skillRoutes from './skill.routes.js';
import roadmapRoutes from './roadmap.routes.js';
import projectRoutes from './project.routes.js';
import interviewRoutes from './interview.routes.js';
import analyticsRoutes from './analytics.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/matches', matchRoutes);
router.use('/skills', skillRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/projects', projectRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
