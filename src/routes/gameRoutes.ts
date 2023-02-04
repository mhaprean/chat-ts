import express from 'express';
import { createGame, getAllGames, getCurrentGame } from '../controllers/gameController';

import { isAuth, isHost } from '../middleware/authMiddleware';

const router = express.Router();


router.get('/', [isAuth], getAllGames);


router.get('/:id', [isAuth], getCurrentGame);

// add game
router.post('/create', [isAuth, isHost], createGame);

export default router;
