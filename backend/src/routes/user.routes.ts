import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', requireAuth, userController.getUserProfile);
router.get('/:id/posts', requireAuth, userController.getUserPosts);
router.get('/:id/likes', requireAuth, userController.getUserLikes);
router.get('/:id/replies', requireAuth, userController.getUserReplies);
router.get('/:id/matches', requireAuth, userController.getUserMatches);

export default router;
