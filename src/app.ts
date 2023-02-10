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
  questionIdx: number;
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
}

interface IStartGamePayload {
  gameId: string;
  userId: string;
  question: IQuestion;
  questionIdx: number;
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
      currentQuestion: null,
    });
    gameLogic.joinGame({ gameId: data.gameId, userId: data.userId, username: data.username });

    const users = gameLogic.getGameUsers(data.gameId);

    const countUsers = Object.values(users).length;

    socket.broadcast.to(data.gameId).emit('USER_JOINED', { countUsers });

    try {
      const gameDB = await Game.findById(data.gameId);

      if (gameDB && !gameDB.participats.includes(data.userId)) {
        const addUser = await gameDB.updateOne({ $push: { participats: data.userId } });
      }
    } catch (error) {
      console.log('error adding user to game (in db)');
    }
  });

  socket.on('leave_room', async (data: IJoinRoomPayload) => {

    const users = gameLogic.getGameUsers(data.gameId);

    const countUsers = Object.values(users).length;

    socket.broadcast.to(data.gameId).emit('USER_LEFT', { countUsers });

  });



  socket.on('SUBMIT_ANSWER', (data: ISubmitAnswerPayload) => {
    gameLogic.addAnswer({ gameId: data.gameId, userId: data.userId, answerValue: data.answer });

    const users = gameLogic.getGameUsers(data.gameId);
    console.log('SUBMIT_ANSWER. users: ', users);
  });

  socket.on('GET_RESULTS', async (data: IGetGameResultsPayload) => {
    const users = gameLogic.getGameUsers(data.gameId);

    console.log('results: ', users);

    try {
      const gameDB = await Game.findById(data.gameId);

      if (gameDB) {
        const results = Object.values(users)
          .filter((user) => user.id !== gameDB.host)
          .sort((a, b) => b.points - a.points)
          .map((user) => {
            return {
              username: user.name,
              points: user.points,
            };
          });
        const updateResults = await gameDB.updateOne({ results: results, active: false });

        gameLogic.deleteGame({ gameId: data.gameId });

        socket.broadcast.to(data.gameId).emit('QUIZ_ENDED', { results });
      }
    } catch (error) {
      console.log('error getting game results.');
    }
  });

  socket.on('game_started', (data: IStartGamePayload) => {
    console.log('game started', data);
    gameLogic.startGame({
      gameId: data.gameId,
      expectedAnswer: data.question.correct_answer,
      question: data.question,
    });

    const users = gameLogic.getGameUsers(data.gameId);

    socket.broadcast.to(data.gameId).emit('QUIZ_STARTED', data);
  });

  socket.on('next_question', (data: INextQuestionPayload) => {
    gameLogic.onNextQuestion({
      gameId: data.gameId,
      expectedAnswer: data.question.correct_answer,
      question: data.question,
    });

    socket.broadcast.to(data.gameId).emit('NEXT_QUESTION', data);
  });

  socket.on('ROOM_CREATED', () => {
    socket.broadcast.emit('SHOULD_REFETCH_ROOMS');
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

export default server;
