import mongoose, { Document, Model } from 'mongoose';

interface DocumentResult<T> {
  _doc?: T;
}

export interface ITournament extends DocumentResult<ITournament> {
  title: string;
  host: string;
  participants: string[];
  games: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITournamentModel extends ITournament, Document {}

const TournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    host: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    games: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Game',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITournamentModel>('Tournament', TournamentSchema);
