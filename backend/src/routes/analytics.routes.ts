import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', AnalyticsController.getOverview);
router.get('/progress', AnalyticsController.getProgress);

export default router;
