import { Router } from 'express';
import { submitReview, markAttendance } from '../controllers/reviewController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/:matchId', submitReview);
router.post('/attendance/:matchId', markAttendance);

export default router;
