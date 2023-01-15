import mongoose, { Document, Model } from 'mongoose';

interface DocumentResult<T> {
  _doc?: T;
}

export interface IQuiz extends DocumentResult<IQuiz> {
  title: string;
  questions: {
    question: string;
    answers: string[];
    correct_answer: string;
  }[];
  difficulty: string;
  category: string;
  type: string;
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
          required: true,
          unique: true,
        },
        answers: [
          {
            type: String,
          },
        ],
        correct_answer: {
          type: String,
          required: true,
        },
      },
    ],
    difficulty: {
      type: String,
    },

    type: {
      type: String,
    },
    category: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuizModel>('Quiz', QuizSchema);
