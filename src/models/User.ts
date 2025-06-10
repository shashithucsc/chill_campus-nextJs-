import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin';
  name?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    name: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


export default models.User || model<IUser>('User', UserSchema);
