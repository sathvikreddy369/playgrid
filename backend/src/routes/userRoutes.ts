import { Router } from 'express';
import { 
  getProfile, getPublicProfile, getUserGameHistory, upsertProfile, 
  updateRole, getNotifications, markNotificationsRead 
} from '../controllers/userController';
import { getMatchAttendance, markAttendance } from '../controllers/attendanceController';
import { sendRequest, getIncomingRequests, handleRequestAction } from '../controllers/messageRequestController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Authentication middleware for all user endpoints
router.use(requireAuth);

router.get('/profile', getProfile);
router.get('/public/:id', getPublicProfile);
router.get('/history', getUserGameHistory);
router.post('/profile', upsertProfile);
router.post('/role', updateRole);
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationsRead);

// Attendance routes
router.get('/attendance/:matchId', getMatchAttendance);
router.post('/attendance/:matchId', markAttendance);

// Message Requests routes
router.post('/message-requests', sendRequest);
router.get('/message-requests', getIncomingRequests);
router.post('/message-requests/:id/action', handleRequestAction);

export default router;
