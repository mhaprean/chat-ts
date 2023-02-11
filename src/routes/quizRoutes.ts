import express from 'express';
import { createQuiz, getAllQuizes, getQuizById } from '../controllers/quizController';

import { isAuth } from '../middleware/authMiddleware';

const router = express.Router();

// get single quiz
router.get('/:id', getQuizById);

router.get('/', getAllQuizes);

// add quzi
router.post('/create', isAuth, createQuiz);

export default router;
