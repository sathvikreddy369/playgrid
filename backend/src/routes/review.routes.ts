import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createReviewSchema } from '../validators';

const router = Router();

router.use(requireAuth);

router.post('/:targetId/match/:matchId', validate(createReviewSchema), reviewController.createReview.bind(reviewController));

export default router;
