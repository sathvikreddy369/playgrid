import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { communityController } from '../controllers/community.controller';
import { groundController } from '../controllers/ground.controller';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// Only ADMIN can access these routes
router.use(requireAuth, requireRole(['ADMIN']));

// Dashboard Data
router.get('/stats', adminController.getStats);
router.get('/queue', adminController.getModerationQueue);
router.get('/users', adminController.getUsers);
router.get('/matches', adminController.getMatches);

// Community Verification
router.put('/communities/:id/verify', communityController.verifyCommunity);

// Ground Verification
router.put('/grounds/:id/verify', groundController.verifyGround);

export default router;
