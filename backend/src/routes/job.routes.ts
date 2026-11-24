import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createJobSchema } from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createJobSchema), JobController.createJob);
router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);
router.delete('/:id', JobController.deleteJob);

export default router;
