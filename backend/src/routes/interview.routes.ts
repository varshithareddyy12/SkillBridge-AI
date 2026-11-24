import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  startInterviewSessionSchema,
  submitInterviewAnswerSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(startInterviewSessionSchema), InterviewController.startSession);
router.get('/', InterviewController.getSessions);
router.get('/:id', InterviewController.getSessionById);
router.post('/:id/answers', validateBody(submitInterviewAnswerSchema), InterviewController.submitAnswer);

export default router;
