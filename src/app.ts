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


app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  return res.send('welcome to our chat rest api.');
});

app.get('/protected', isAuth, (req, res) => {

  return res.status(200).json({sucess: 'this is a protected route'});
})

export default app;
