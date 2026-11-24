import { Router } from 'express';
import { MatchController } from '../controllers/match.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { runMatchSchema } from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/analyze', validateBody(runMatchSchema), MatchController.runMatch);
router.get('/', MatchController.getMatches);
router.get('/:id', MatchController.getMatchById);

export default router;
