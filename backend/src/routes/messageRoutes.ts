import { Router } from 'express';
import { getMatchMessages } from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/:matchId', getMatchMessages);

export default router;
