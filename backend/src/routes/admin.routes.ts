import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { communityController } from '../controllers/community.controller';
import { groundController } from '../controllers/ground.controller';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middlewares/validate';
import { verifyCommunitySchema, verifyGroundSchema, resolveReportSchema } from '../validators';

const router = Router();

// Only ADMIN can access these routes
router.use(requireAuth, requireRole(['ADMIN']));

// Dashboard Data
router.get('/stats', adminController.getStats);
router.get('/queue', adminController.getModerationQueue);
router.get('/users', adminController.getUsers);
router.get('/matches', adminController.getMatches);

// Community Verification
router.put('/communities/:id/verify', validate(verifyCommunitySchema), communityController.verifyCommunity);

// Ground Verification
router.put('/grounds/:id/verify', validate(verifyGroundSchema), groundController.verifyGround);

// Moderation & Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', validate(resolveReportSchema), adminController.resolveReport);
router.put('/users/:id/block', adminController.toggleBlockUser);
router.delete('/posts/:id', adminController.deletePost);

export default router;
