import { Router } from 'express';
import { createRequest, getHostRequests, handleRequestAction } from '../controllers/requestController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/:matchId', createRequest);
router.get('/host/:matchId', getHostRequests);
router.post('/action/:requestId', handleRequestAction);

export default router;
