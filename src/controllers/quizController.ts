import { Request, Response, NextFunction } from 'express';
import Quiz, { IQuiz } from '../models/Quiz';
import Joi from 'joi';

export const getAllQuizes = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizes = await Quiz.find().select('-questions');

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

    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(60).required(),
      category: Joi.string(),
      type: Joi.string(),
      difficulty: Joi.string(),
      questions: Joi.array(),
    });

    const { error } = joiSchema.validate(req.body);

    if (error) {
      console.log('!!!!!!!! joiSchema error', error);
      return res.status(400).send(error);
    }

    const newQuiz: IQuiz = {
      title: req.body.title,
      category: req.body.category,
      type: req.body.type,
      difficulty: req.body.difficulty,
      questions: req.body.questions,
    };

    const quiz = await Quiz.create(newQuiz);

    return res.status(201).json(quiz);
  } catch (error) {
    console.log('!!!!!!!! error', error);
    return res.status(400).json(error);
  }
};

interface IQuest {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// helper function used to transform quizes from https://opentdb.com/api_config.php  to our desired format
// https://opentdb.com/api.php?amount=20&category=21&difficulty=easy&type=multiple
// this means category  sport and difficulty  easy
const transformQuiz = (questions: IQuest[]): IQuiz => {
  let questionsResult = questions.map((q) => {
    let answers = [q.correct_answer, ...q.incorrect_answers];

    let shuffled = answers
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    return { question: q.question, answers: shuffled, correct_answer: q.correct_answer };
  });

  return {
    category: questions[0].category,
    difficulty: questions[0].difficulty,
    title: `${questions[0].category} ${questions[0].difficulty} TITLE !!!! ${Date.now()}`,
    type: questions[0].type,
    questions: questionsResult,
  };
};
