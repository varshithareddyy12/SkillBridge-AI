import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createRoadmapSchema, updateMilestoneSchema } from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', validateBody(createRoadmapSchema), RoadmapController.generateRoadmap);
router.get('/', RoadmapController.getRoadmaps);
router.get('/:id', RoadmapController.getRoadmapById);
router.patch('/:id/milestones/:milestoneId', validateBody(updateMilestoneSchema), RoadmapController.updateMilestone);

export default router;
