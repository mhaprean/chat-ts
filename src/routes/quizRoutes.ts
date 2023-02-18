import express from 'express';
import { createQuiz, getAllQuizes, getQuizById, getMyQuizes, deleteQuiz } from '../controllers/quizController';

import { isAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/myquizes', [isAuth], getMyQuizes);

// get single quiz
// comment this route for now, as we don't need it.
// router.get('/:id', getQuizById);

router.delete('/:id', deleteQuiz);

// get all public quizes
router.get('/all', getAllQuizes);

// add quzi
router.post('/create', isAuth, createQuiz);

export default router;
