import { Request, Response, NextFunction } from 'express';
import Game, { IGame } from '../models/Game';
import Joi from 'joi';

export const getAllGames = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const games = await Game.find({ active: true }).select('-password');

    return res.status(200).json(games);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const createGame = async (
  req: Request<{}, {}, IGame>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(60).required(),
      password: Joi.string().min(6).max(6).required(),
      quiz_id: Joi.string(),
    });

    const { error } = joiSchema.validate(req.body);

    if (error) {
      return res.status(400).send({ message: error });
    }

    const { title, password, quiz_id } = req.body;
    const newGame = {
      title,
      password: password,
      active: true,
      quiz: quiz_id,
      host: userId,
    };

    const game = await Game.create(newGame);

    return res.status(201).json(game);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getCurrentGame = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  // game id
  const id = req.params.id;

  const userId = req.userId;

  try {
    const game = await Game.findById(id);

    if (!game) {
      return res.status(400).json({ error: 'wrong game id' });
    }
    if (game.host.toString() === userId) {
      const populatedGame = await Game.findById(id).populate(['quiz', 'host']);
      return res.status(200).json(populatedGame);
    } else {
      const populatedGame = await Game.findById(id).populate(['host']);
      return res.status(200).json(populatedGame);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const joinGame = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  // game id
  const id = req.params.id;

  const userId = req.userId;
  const userRole = req.userRole;

  const { password } = req.body;

  try {
    const game = await Game.findById(id);

    if (game && userId && !game.participants.includes(userId) && password === game.password) {
      game.participants.push(userId);
      const result = await game.save();

      return res.status(200).json(game);
    }
    return res.status(200).json({ message: 'user already in the roon', game });
  } catch (error) {
    return res.status(400).json(error);
  }
};
