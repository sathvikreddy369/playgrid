import { Router } from 'express';
import { getProfile, upsertProfile, updateRole, getNotifications, markNotificationsRead } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upsertProfileSchema, updateRoleSchema } from '../schemas/userSchemas';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.post('/profile', validate(upsertProfileSchema), upsertProfile);
router.post('/role', validate(updateRoleSchema), updateRole);
router.get('/notifications', getNotifications);
router.post('/notifications/read', markNotificationsRead);

export default router;


