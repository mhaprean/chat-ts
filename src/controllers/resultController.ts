import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Result from '../models/Result';

export const getCurrentGameResults = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  // game id
  const id = req.params.id;

  const userId = req.userId;

  try {
    const result = await Result.findOne({ user: userId, game: id });

    if (!result) {
      return res.status(400).json({ error: 'wrong game id' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json(error);
  }
};
