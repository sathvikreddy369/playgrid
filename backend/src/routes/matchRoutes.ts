import { Router } from 'express';
import { createMatch, getMatches, getMatchById, getMyMatches, cancelMatch } from '../controllers/matchController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMatchSchema, getMatchesSchema } from '../schemas/matchSchemas';

const router = Router();

// Publicly accessible routes (viewing matches)
router.get('/', validate(getMatchesSchema), getMatches);
router.get('/:id', getMatchById);

// Protected routes
router.use(requireAuth);
router.get('/me/matches', getMyMatches);
router.post('/', validate(createMatchSchema), createMatch);
router.post('/:id/cancel', cancelMatch);

export default router;

