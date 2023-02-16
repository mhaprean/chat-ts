import mongoose, { Document, Model } from 'mongoose';

interface DocumentResult<T> {
  _doc?: T;
}

export interface IResult extends DocumentResult<IResult> {
  user: string;
  game: string;
  results: {
    answer: number;
    question_id: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResultModel extends IResult, Document {}

const ResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    game: {
      type: mongoose.Types.ObjectId,
      ref: 'Game',
    },
    results: [
      {
        answer: {
          type: String,
        },
        question_id: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IResultModel>('Result', ResultSchema);
