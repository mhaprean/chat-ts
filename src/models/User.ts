import mongoose, { Document, Model } from 'mongoose';

interface DocumentResult<T> {
  _doc?: T;
}

export interface IUser extends DocumentResult<IUser> {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: string;
  confirmation_token: string;
  reset_password_token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends IUser, Document {}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
    },
    confirmation_token: {
      type: String,
    },
    reset_password_token: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserModel>('User', UserSchema);
