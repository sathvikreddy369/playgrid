import { Router } from 'express';
import { groundController } from '../controllers/ground.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { apiLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { createGroundSchema, updateGroundSchema, groundReviewSchema } from '../validators';

const router = Router();

// Public discovery
router.get('/', apiLimiter, groundController.getGrounds);
router.get('/:id', apiLimiter, groundController.getGroundById);

// Protected Ground Owner Actions
router.post('/', requireAuth, apiLimiter, validate(createGroundSchema), groundController.createGround);
router.put('/:id', requireAuth, apiLimiter, validate(updateGroundSchema), groundController.updateGround);

// Reviews
router.post('/:id/reviews', requireAuth, apiLimiter, validate(groundReviewSchema), groundController.addReview);
router.delete('/:id/reviews/:reviewId', requireAuth, apiLimiter, groundController.deleteReview);

export default router;
