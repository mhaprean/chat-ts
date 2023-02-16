import express from 'express';
import { getCurrentGameResults } from '../controllers/resultController';


import { isAuth, isHost } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/game/:id', [isAuth], getCurrentGameResults);


export default router;
