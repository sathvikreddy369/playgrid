import { Router } from 'express';
import { venueController } from '../controllers/venue.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createVenueSchema, updateVenueSchema, reviewSchema } from '../validators';

const router = Router();

// Public routes
router.get('/', venueController.getVenues);
router.get('/:id', venueController.getVenueById);

// Protected routes
router.use(requireAuth);
router.post('/', validate(createVenueSchema), venueController.createVenue);
router.put('/:id', validate(updateVenueSchema), venueController.updateVenue);
router.post('/:id/reviews', validate(reviewSchema), venueController.addReview);
router.delete('/:id/reviews/:reviewId', venueController.deleteReview);

export default router;
