import { Request, Response, NextFunction } from 'express';
import Tournament, { ITournament } from '../models/Tournament';
import Joi from 'joi';

export const createTournament = async (
  req: Request<{}, {}, ITournament>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const joiSchema = Joi.object({
      title: Joi.string().min(3).max(60).required(),
    });

    const { error } = joiSchema.validate(req.body);

    if (error) {
      return res.status(400).send({ message: error });
    }

    const { title } = req.body;
    const newTournament = {
      title,
      host: userId,
    };

    const game = await Tournament.create(newTournament);

    return res.status(201).json(game);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getMyTournaments = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;

  try {
    const tournaments = await Tournament.find({ participants: { $in: [userId] } });

    return res.status(200).json(tournaments);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getMyTournamentsAsHost = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;

  try {
    const games = await Tournament.find({ host: userId });

    return res.status(200).json(games);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getTournament = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  // tournament id
  const id = req.params.id;

  const userId = req.userId;

  try {
    const tournament = await Tournament.findById(id).populate(['games', 'participants', 'host']);

    if (!tournament) {
      return res.status(400).json({ error: 'wrong tournament id' });
    }

    return res.status(200).json(tournament);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const updateTournament = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  // tournament id
  const id = req.params.id;

  const userId = req.userId;

  const { password } = req.body;

  try {
    const tournament = await Tournament.findById(id);

    if (tournament && userId && !tournament.participants.includes(userId)) {
      tournament.participants.push(userId);
      const result = await tournament.save();

      return res.status(200).json(tournament);
    }
    return res.status(200).json({ tournament });
  } catch (error) {
    return res.status(400).json(error);
  }
};
