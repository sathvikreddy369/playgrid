import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createReport } from '../controllers/reportController';

const router = Router();

router.post('/', requireAuth, createReport);

export default router;
