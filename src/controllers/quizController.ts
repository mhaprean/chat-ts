import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz, IQuizQuestion } from '../models/Quiz';
import Joi from 'joi';
import Game from '../models/Game';
import Result from '../models/Result';

export const getAllQuizes = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizes = await Quiz.find({ public: true }).select('-questions');

    return res.status(200).json(quizes);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getMyQuizes = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).send({ message: 'You are not authenticated' });
  }

  try {
    const quizes = await Quiz.find({ creator: userId, public: false }).select('-questions');

    return res.status(200).json(quizes);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getQuizById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const quiz = await Quiz.findById(id);

    if (quiz) {
      const ques = quiz.questions.map((question) => {
        return { question: question.question, answers: question.answers, correct_answer: '?' };
      });

      return res.status(200).json({ ...quiz._doc, questions: ques });
    }

    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const createQuiz = async (
  req: Request<{}, {}, IQuiz>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).send({ message: 'You are not authenticated' });
    }

    const joiSchema = Joi.object({
      title: Joi.string().min(1).max(60).required(),
      category: Joi.string(),
      type: Joi.string(),
      difficulty: Joi.string(),
      questions: Joi.array(),
    });

    const { error } = joiSchema.validate(req.body);

    if (error) {
      return res.status(400).send(error);
    }

    const newQuiz: IQuiz = {
      title: req.body.title,
      category: req.body.category,
      type: req.body.type || '',
      difficulty: req.body.difficulty,
      questions: req.body.questions,
      creator: userId,
      public: false,
      total: req.body.questions.length,
    };

    const quiz = await Quiz.create(newQuiz);

    return res.status(201).json(quiz);
  } catch (error) {
    console.log('!!!!!!!! error', error);
    return res.status(400).json({ error: error });
  }
};

export const deleteQuiz = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const gamesToDelete = await Game.find({ quiz: id });

    const ids = gamesToDelete.map((game) => game._id);

    const deleteResults = await Result.deleteMany({ game: { $in: ids } });

    const deleteGames = await Game.deleteMany({ quiz: id });

    const result = await Quiz.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting quiz', error });
  }
};
