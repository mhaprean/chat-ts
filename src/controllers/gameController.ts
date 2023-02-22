import { Request, Response, NextFunction } from 'express';
import Game, { IGame } from '../models/Game';
import Joi from 'joi';
import Tournament from '../models/Tournament';

export const getAllGames = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const games = await Game.find({ active: true })
      .select('-password')
      .populate('quiz', 'total')
      .populate('tournament', '_id title');

    return res.status(200).json(games);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getMyGames = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;

  try {
    const games = await Game.find({ participants: { $in: [userId] } })
      .select('-password')
      .populate(['host'])
      .populate('quiz', 'total')
      .populate('tournament', '_id title')
      .sort({ createdAt: -1 });

    return res.status(200).json(games);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const getMyGamesAsHost = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;

  try {
    const games = await Game.find({ host: userId })
      .select('-password')
      .populate(['host'])
      .populate('quiz', 'total')
      .populate('tournament', '_id title')
      .sort({ createdAt: -1 });

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
      password: Joi.string().min(4).max(4).required(),
      quiz: Joi.string(),
      tournament: Joi.string().allow(''),
    });

    const { error } = joiSchema.validate(req.body);

    if (error) {
      return res.status(400).send({ message: error, ok: 'aa' });
    }

    const { title, password, quiz, tournament } = req.body;
    let newGame: Partial<IGame> = {
      title,
      password: password,
      active: true,
      quiz: quiz,
      host: userId,
    };

    if (tournament) {
      newGame.tournament = tournament;
    }

    const game = await Game.create(newGame);

    if (tournament) {
      const addGameToTournament = await Tournament.findByIdAndUpdate(tournament, {
        $push: { games: game._id },
      });
    }

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
    if (game.host.toString() === userId || game.ended) {
      const populatedGame = await Game.findById(id).populate(['quiz', 'host']);
      return res.status(200).json(populatedGame);
    }

    const populatedGame = await Game.findById(id).populate(['host']).populate('quiz', 'total');
    return res.status(200).json(populatedGame);
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

export const deleteGame = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Remove the game from any tournaments it belongs to
    await Tournament.updateOne({ games: id }, { $pull: { games: id } });

    // Delete the game
    await game.delete();

    return res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting game', error });
  }
};
