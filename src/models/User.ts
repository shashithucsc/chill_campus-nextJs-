import mongoose, { Document, Schema, models, model } from 'mongoose';

// User document shape
export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'community_admin' | 'community_moderator' | 'admin';
  fullName: string;
  university: string;
  createdAt: Date;
  avatar?: string; // profile picture URL
  bio?: string; // short about text
  interests?: string[]; // list of interests
  followers?: mongoose.Types.ObjectId[]; // users who follow this user
  following?: mongoose.Types.ObjectId[]; // users this user follows
  favorites?: mongoose.Types.ObjectId[]; // saved users
  blockedUsers?: mongoose.Types.ObjectId[]; // blocked users
  isActive: boolean; // email verified
  activationToken: string; // email verify token
  resetPasswordToken?: string; // password reset token
  resetPasswordExpires?: Date; // password reset token expiry
  status: 'Active' | 'Suspended'; // account state
  isSuspended?: boolean; // suspension flag
  suspendedAt?: Date; // when suspended
  suspendedBy?: mongoose.Types.ObjectId; // admin who suspended
  suspensionReason?: string; // why suspended
  suspensionEnd?: Date; // when it ends
  isBlocked?: boolean; // blocked flag
  blockedAt?: Date; // when blocked
  blockedBy?: mongoose.Types.ObjectId; // admin who blocked
  blockReason?: string; // why blocked
  warnings?: Array<{
    reason: string;
    warnedBy: mongoose.Types.ObjectId;
    warnedAt: Date;
    postId?: mongoose.Types.ObjectId;
  }>; // warning history
}

// MongoDB schema for users
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
      enum: ['student', 'community_admin', 'community_moderator', 'admin'],
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
    bio: {
      type: String,
      default: '',
    },
    interests: [{
      type: String,
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    blockedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    suspensionReason: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    blockReason: {
      type: String,
    },
    suspensionEnd: {
      type: Date,
    },
    warnings: [{
      reason: { type: String, required: true },
      warnedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      warnedAt: { type: Date, default: Date.now },
      postId: { type: Schema.Types.ObjectId, ref: 'Post' }
    }],
  },
  {
    timestamps: true,
  }
);

// Reuse model if already compiled (Next.js hot reload)
export default models.User || model<IUser>('User', UserSchema);
