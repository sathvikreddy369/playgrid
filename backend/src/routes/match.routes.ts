import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public discovery
router.get('/', apiLimiter, matchController.getMatches);
router.get('/:id', apiLimiter, matchController.getMatchById);

// Protected actions
router.get('/recommendations', requireAuth, apiLimiter, matchController.getRecommendations);
router.post('/', requireAuth, apiLimiter, matchController.createMatch);
router.post('/:id/join', requireAuth, apiLimiter, matchController.requestToJoin);
router.put('/:id/cancel', requireAuth, apiLimiter, matchController.cancelMatch);

// Organizer actions
router.put('/:id/players/:userId/approve', requireAuth, apiLimiter, matchController.approvePlayer);
router.put('/:id/players/:userId/reject', requireAuth, apiLimiter, matchController.rejectPlayer);
router.post('/:id/players/:userId/attend', requireAuth, apiLimiter, matchController.markAttendance);

export default router;
