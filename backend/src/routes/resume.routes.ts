import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadResumeMiddleware } from '../middleware/upload.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { updateResumeSchema } from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', uploadResumeMiddleware.single('resume'), ResumeController.uploadResume);
router.get('/', ResumeController.getResumes);
router.get('/:id', ResumeController.getResumeById);
router.patch('/:id', validateBody(updateResumeSchema), ResumeController.updateResume);
router.delete('/:id', ResumeController.deleteResume);

export default router;
