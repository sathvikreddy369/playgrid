import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth, requireFirebaseUser } from '../middlewares/auth.middleware';

const router = Router();

// Protected sync route: Requires valid Firebase JWT
router.post('/sync', requireFirebaseUser, AuthController.sync);

// Protected me route: Fetch user profile
router.get('/me', requireAuth, AuthController.me);

// Upgrade to Organizer
router.post('/upgrade-organizer', requireAuth, AuthController.upgradeToOrganizer);

// Upgrade to Admin (for local testing)
router.post('/make-me-admin', requireAuth, AuthController.makeMeAdmin);

// Update Profile
router.put('/profile', requireAuth, AuthController.updateProfile);

export default router;
