import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { reportController } from '../controllers/report.controller';

const router = Router();

router.post('/', requireAuth, reportController.createReport);

export default router;
