import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', requireAuth, userController.getUserProfile);
router.get('/:id/posts', requireAuth, userController.getUserPosts);
router.get('/:id/likes', requireAuth, userController.getUserLikes);
router.get('/:id/replies', requireAuth, userController.getUserReplies);
router.get('/:id/matches', requireAuth, userController.getUserMatches);
router.get('/:id/activities', requireAuth, userController.getUserActivities);
router.get('/:id/feed', requireAuth, userController.getFeedActivities);
router.get('/:id/connections', requireAuth, userController.getConnections);
router.post('/:id/connect', requireAuth, userController.connectUser);
router.put('/:id/accept', requireAuth, userController.acceptConnection);
router.put('/:id/reject', requireAuth, userController.rejectConnection);
router.delete('/:id/connection', requireAuth, userController.removeConnection);

export default router;
