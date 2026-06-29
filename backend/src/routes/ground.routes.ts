import { Router } from 'express';
import { groundController } from '../controllers/ground.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public discovery
router.get('/', apiLimiter, groundController.getGrounds);
router.get('/:id', apiLimiter, groundController.getGroundById);

// Protected Ground Owner Actions
router.post('/', requireAuth, apiLimiter, groundController.createGround);
router.put('/:id', requireAuth, apiLimiter, groundController.updateGround);

// Reviews
router.post('/:id/reviews', requireAuth, apiLimiter, groundController.addReview);
router.delete('/:id/reviews/:reviewId', requireAuth, apiLimiter, groundController.deleteReview);

export default router;
