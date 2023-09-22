import mongoose, { Document, Model } from 'mongoose';

interface DocumentResult<T> {
  _doc?: T;
}

export interface IQuizQuestion {
  question: string;
  answers: string[];
  correct_answer: string;
  _id: string;
  image: string;
  song: string;
  video: string;
}

export interface IQuiz extends DocumentResult<IQuiz> {
  title: string;
  questions: IQuizQuestion[];
  difficulty: string;
  category: string;
  type: string;
  total: number;
  creator: string;
  public: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuizModel extends IQuiz, Document {}

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    questions: [
      {
        question: {
          type: String,
        },
        answers: [
          {
            type: String,
          },
        ],
        correct_answer: {
          type: String,
        },
        image: {
          type: String,
        },
        song: {
          type: String,
        },
        video: {
          type: String,
        },
      },
    ],
    creator: {
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
    total: {
      type: Number,
      default: 0,
    },
    public: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuizModel>('Quiz', QuizSchema);
