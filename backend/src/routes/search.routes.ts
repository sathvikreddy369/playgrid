import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { apiLimiter } from '../middlewares/rateLimiter';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { aiSearchSchema } from '../validators';

const router = Router();

router.get('/', apiLimiter, searchController.search);

// AI search might be expensive, protect it heavily
router.post('/ai', requireAuth, apiLimiter, validate(aiSearchSchema), searchController.aiSearch);

export default router;
