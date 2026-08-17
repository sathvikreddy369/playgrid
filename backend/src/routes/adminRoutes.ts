import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  getAdminOverview,
  getPendingOwners,
  approveOwner,
  rejectOwner,
  getAllOwners,
  suspendOwner,
  reinstateOwner,
  getAdminReports,
  handleReportAction,
  getAdminReviews,
  deleteAdminReview
} from '../controllers/adminController';

const router = Router();

// Protect ALL admin routes with requireAuth AND requireAdmin
router.use(requireAuth, requireAdmin);

router.get('/overview', getAdminOverview);
router.get('/owners/pending', getPendingOwners);
router.post('/owners/:id/approve', approveOwner);
router.post('/owners/:id/reject', rejectOwner);
router.get('/owners', getAllOwners);
router.post('/owners/:id/suspend', suspendOwner);
router.post('/owners/:id/reinstate', reinstateOwner);
router.get('/reports', getAdminReports);
router.post('/reports/:id/action', handleReportAction);
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteAdminReview);

export default router;
