import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'student';
  fullName: string;
  university: string;
  createdAt: Date;
  avatar?: string; // Optional avatar field
  isActive: boolean; // Indicates if the user's email is confirmed
  activationToken: string; // Token for email confirmation
  status: 'Active' | 'Suspended'; // User status for admin management
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
      enum: ['user', 'admin', 'student'],
      default: 'student',
    },
    fullName: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export default models.User || model<IUser>('User', UserSchema);
