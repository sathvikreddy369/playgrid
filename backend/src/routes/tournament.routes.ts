import { Router } from 'express';
import { tournamentController } from '../controllers/tournament.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { createTournamentSchema } from '../validators';

const router = Router();

router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.post('/', requireAuth, validate(createTournamentSchema), tournamentController.createTournament);
router.post('/:id/join', requireAuth, tournamentController.joinTournament);

export default router;
