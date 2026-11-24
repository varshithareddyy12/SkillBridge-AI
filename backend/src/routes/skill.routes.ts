import { Router } from 'express';
import { SkillController } from '../controllers/skill.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  updateSkillProficiencySchema,
  addCustomSkillSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', SkillController.getUserSkills);
router.post('/', validateBody(addCustomSkillSchema), SkillController.addSkill);
router.patch('/:id', validateBody(updateSkillProficiencySchema), SkillController.updateSkill);
router.get('/gaps', SkillController.getSkillGaps);

export default router;
