import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  submitVenueApplication,
  getMyVenue,
  getApprovedVenues,
  getVenueById,
  submitVenueReview
} from '../controllers/venueController';

const router = Router();

// Public routes
router.get('/', requireAuth, getApprovedVenues);
router.get('/my-venue', requireAuth, getMyVenue);
router.get('/:id', requireAuth, getVenueById);

// Protected owner & player routes
router.post('/application', requireAuth, submitVenueApplication);
router.post('/:id/reviews', requireAuth, submitVenueReview);

export default router;
