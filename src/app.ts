import express, { Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

import { isAuth } from './middleware/authMiddleware';
import quizRoutes from './routes/quizRoutes';
import userRoutes from './routes/userRoutes';
import gameRoutes from './routes/gameRoutes';

import http from 'http';
import { Server } from 'socket.io';
import Game from './models/Game';
import gameLogic from './gameLogic';
import Result from './models/Result';
import resultRoutes from './routes/resultRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import Tournament from './models/Tournament';
import { IQuiz } from './models/Quiz';

const app = express();
dotenv.config();

// app middlewares
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// routes
app.use('/api/auth', authRoutes);

app.use('/api/quiz', quizRoutes);

app.use('/api/games', gameRoutes);

app.use('/api/users', userRoutes);

app.use('/api/results', resultRoutes);

app.use('/api/tournaments', tournamentRoutes);

app.get('/', (req, res) => {
  return res.send('welcome to our chat rest api.');
});

app.get('/protected', isAuth, (req, res) => {
  return res.status(200).json({ sucess: 'this is a protected route' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
  },
});

interface ISubmitAnswerPayload {
  gameId: string;
  userId: string;
  answer: string;
}

export interface IQuestion {
  question: string;
  answers: string[];
  correct_answer: string;
  _id: string;
}

interface IJoinRoomPayload {
  gameId: string;
  username: string;
  userId: string;
  isHost: boolean;
  quiz: IQuiz;
}

interface IStartGamePayload {
  gameId: string;
  userId: string;
}

interface INextQuestionPayload extends IStartGamePayload {}

interface IGetGameResultsPayload {
  gameId: string;
}

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', async (data: IJoinRoomPayload) => {
    socket.join(data.gameId);
    console.log(
      `User with ID: ${socket.id} joined room: ${data.gameId}. user db is: ${data.userId}`
    );

    gameLogic.createGame({
      gameId: data.gameId,
      userId: data.userId,
      username: data.username,
      isHost: data.isHost,
      quiz: data.quiz,
    });

    gameLogic.joinGame({
      gameId: data.gameId,
      userId: data.userId,
      username: data.username,
      isHost: data.isHost,
    });

    const game = gameLogic.getCurrentGame(data.gameId);

    // Send message to the user who just joined
    socket.emit('WELCOME_BACK', {
      message: `Welcome to room ${data.gameId}`,
      game: { ...game, quiz: null, expectedAnswer: '?' },
    });

    if (game) {
      const totalUsers = Object.keys(game.users);
      socket.broadcast.to(data.gameId).emit('USER_JOINED', { totalUsers: totalUsers.length });
    }
  });

  socket.on('SUBMIT_ANSWER', (data: ISubmitAnswerPayload) => {
    gameLogic.addAnswer({ gameId: data.gameId, userId: data.userId, answerValue: data.answer });

    // Send message to participant
    socket.emit('ANSWER_SUBMITED', {
      message: `answer submited: ${data.gameId}`,
    });
  });

  socket.on('GET_RESULTS', async (data: IGetGameResultsPayload) => {
    const users = gameLogic.getGameUsers(data.gameId);

    try {
      const gameDB = await Game.findById(data.gameId);

      if (gameDB) {
        const gameUsers = Object.values(users)
          .filter((user) => user.id !== gameDB.host.toString())
          .sort((a, b) => b.points - a.points);

        const gameResults = gameUsers.map((user) => {
          return {
            username: user.name,
            points: user.points,
            user_id: user.id,
          };
        });
        const updateResults = await gameDB.updateOne({
          results: gameResults,
          active: false,
          ended: true,
        });

        gameLogic.deleteGame({ gameId: data.gameId });

        const resultsData = gameUsers.map((gameUser, idx) => {
          const userResults = Object.values(gameUser.answers);

          return {
            user: gameUser.id,
            game: data.gameId,
            results: userResults,
          };
        });

        for (let i = 0; i < resultsData.length; i++) {
          const newResult = resultsData[i];

          const insertResult = await Result.create(newResult);
        }

        const newParticipants = gameResults.map((user) => user.user_id);

        if (gameDB.tournament) {
          const updateTournament = await Tournament.updateOne(
            { _id: gameDB.tournament },
            { $addToSet: { participants: { $each: newParticipants } } }
          );
        }

        const updateGame = await Game.updateOne(
          { _id: data.gameId },
          { $addToSet: { participants: { $each: newParticipants } } }
        );

        socket.broadcast.to(data.gameId).emit('QUIZ_ENDED', { results: gameResults });
      }
    } catch (error) {
      console.log('error getting game results.');
    }
  });

  socket.on('game_started', (data: IStartGamePayload) => {
    gameLogic.startGame({
      gameId: data.gameId,
    });

    const game = gameLogic.getCurrentGame(data.gameId);

    const gameStartedPayload = {
      question: game?.currentQuestion,
      questionIdx: game?.questionIdx,
    };

    socket.broadcast.to(data.gameId).emit('QUIZ_STARTED', gameStartedPayload);

    // Send message to the host
    socket.emit('QUIZ_STARTED', gameStartedPayload);
  });

  socket.on('next_question', (data: INextQuestionPayload) => {
    gameLogic.onNextQuestion({
      gameId: data.gameId,
    });

    const game = gameLogic.getCurrentGame(data.gameId);

    const nextQuestionPayload = {
      question: game?.currentQuestion,
      questionIdx: game?.questionIdx,
    };

    socket.broadcast.to(data.gameId).emit('NEXT_QUESTION', nextQuestionPayload);

    // Send message to the host
    socket.emit('NEXT_QUESTION', nextQuestionPayload);
  });

  socket.on('ROOM_CREATED', () => {
    socket.broadcast.emit('SHOULD_REFETCH_ROOMS');
    socket.emit('SHOULD_REFETCH_ROOMS');
  });

  socket.on('disconnect', (reason) => {
    console.log('User Disconnected', socket.id);
    console.log('reason of disconnect: ', reason); // "ping timeout"
  });
});

export default server;
