import express from 'express';
import {
  createGame,
  getAllGames,
  getCurrentGame,
  getMyGames,
  joinGame,
} from '../controllers/gameController';

import { isAuth, isHost } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', [isAuth], getAllGames);

router.get('/mygames', [isAuth], getMyGames);

// add game
router.post('/create', [isAuth, isHost], createGame);

router.get('/:id', [isAuth], getCurrentGame);

router.post('/join/:id', [isAuth], joinGame);

export default router;
