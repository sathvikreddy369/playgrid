import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.use(requireAuth, apiLimiter);

router.get('/conversations', messageController.getConversations);
router.get('/:otherUserId', messageController.getMessages);
router.put('/:otherUserId/read', messageController.markAsRead);

export default router;
