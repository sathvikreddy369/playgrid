import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth, requireFirebaseUser } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { syncBodySchema, updateProfileSchema } from '../validators';

const router = Router();

// Protected sync route: Requires valid Firebase JWT
router.post('/sync', requireFirebaseUser, validate(syncBodySchema), AuthController.sync);

// Protected me route: Fetch user profile
router.get('/me', requireAuth, AuthController.me);

// Update Profile
router.put('/profile', requireAuth, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
