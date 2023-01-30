import express from 'express';
import { createGame } from '../controllers/gameController';

import { isAuth, isHost } from '../middleware/authMiddleware';

const router = express.Router();

// add game
router.post('/create', [isAuth, isHost], createGame);

export default router;
