import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { communityController } from '../controllers/community.controller';

const router = Router();

// Only ADMIN can access these routes
router.use(requireAuth, requireRole(['ADMIN']));

// Community Verification
router.put('/communities/:id/verify', communityController.verifyCommunity);

// Ground Verification
import { groundController } from '../controllers/ground.controller';
router.put('/grounds/:id/verify', groundController.verifyGround);

export default router;
