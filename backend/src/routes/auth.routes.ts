import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Protected sync route: Requires valid Firebase JWT
router.post('/sync', requireAuth, AuthController.sync);

// Protected me route: Fetch user profile
router.get('/me', requireAuth, AuthController.me);

// Upgrade to Organizer
router.post('/upgrade-organizer', requireAuth, AuthController.upgradeToOrganizer);

export default router;
