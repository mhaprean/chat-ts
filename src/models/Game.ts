import mongoose, { Document, Model } from 'mongoose';
import { IUser } from './User';

interface DocumentResult<T> {
  _doc?: T;
}

export interface IGame extends DocumentResult<IGame> {
  title: string;
  active: boolean;
  password: string;
  host: string;
  difficulty: string;
  category: string;
  type: string;
  quiz_id: string;
  participats: string[];
  results: {
    username: string;
    points: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGameModel extends IGame, Document {}

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    participats: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    host: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    difficulty: {
      type: String,
    },
    type: {
      type: String,
    },
    category: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    quiz: {
      type: mongoose.Types.ObjectId,
      ref: 'Quiz',
    },
    results: [
      {
        username: {
          type: String,
        },
        points: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IGameModel>('Game', GameSchema);
