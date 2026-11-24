import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  createProjectRecommendationSchema,
  updateProjectStatusSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/recommend', validateBody(createProjectRecommendationSchema), ProjectController.recommendProjects);
router.get('/', ProjectController.getProjects);
router.patch('/:id', validateBody(updateProjectStatusSchema), ProjectController.updateProject);

export default router;
