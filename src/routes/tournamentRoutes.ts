import express from 'express';
import {
  createTournament,
  deleteTournament,
  getMyTournaments,
  getMyTournamentsAsHost,
  getTournament,
} from '../controllers/tournamentController';

import { isAuth, isHost } from '../middleware/authMiddleware';

const router = express.Router();

// add game
router.post('/create', [isAuth, isHost], createTournament);

router.get('/mytournaments', [isAuth], getMyTournaments);

router.get('/hostedbyme', [isAuth, isHost], getMyTournamentsAsHost);

router.get('/:id', [isAuth], getTournament);

router.delete('/:id', [isAuth, isHost], deleteTournament);

export default router;
