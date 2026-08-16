import { Router } from 'express';
import { getProfile, upsertProfile, updateRole } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.post('/profile', upsertProfile);
router.post('/role', updateRole);

export default router;
