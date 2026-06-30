import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { reportController } from '../controllers/report.controller';
import { validate } from '../middlewares/validate';
import { createReportSchema } from '../validators';

const router = Router();

router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);

export default router;
