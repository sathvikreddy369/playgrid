import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Publicly accessible discovery (or authenticated if we prefer)
router.get('/', apiLimiter, communityController.getCommunities);
router.get('/:id', apiLimiter, communityController.getCommunityById);

// Protected Actions
router.post('/', requireAuth, apiLimiter, communityController.createCommunity);
router.post('/:id/join', requireAuth, apiLimiter, communityController.joinCommunity);
router.delete('/:id/leave', requireAuth, apiLimiter, communityController.leaveCommunity);

// Moderation
router.delete('/:id/members/:userId', requireAuth, apiLimiter, communityController.kickMember);

export default router;
