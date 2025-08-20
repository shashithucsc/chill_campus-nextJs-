import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'community_admin' | 'community_moderator' | 'admin';
  fullName: string;
  university: string;
  createdAt: Date;
  avatar?: string; // Optional avatar field
  bio?: string; // User bio/description
  interests?: string[]; // User interests
  followers?: mongoose.Types.ObjectId[]; // Users following this user
  following?: mongoose.Types.ObjectId[]; // Users this user is following
  favorites?: mongoose.Types.ObjectId[]; // Users this user has favorited
  isActive: boolean; // Indicates if the user's email is confirmed
  activationToken: string; // Token for email confirmation
  status: 'Active' | 'Suspended'; // User status for admin management
  isSuspended?: boolean; // Suspension status
  suspendedAt?: Date; // Suspension date
  suspendedBy?: mongoose.Types.ObjectId; // Admin who suspended
  suspensionReason?: string; // Reason for suspension
  suspensionEnd?: Date; // When suspension ends
  isBlocked?: boolean; // Block status
  blockedAt?: Date; // Block date
  blockedBy?: mongoose.Types.ObjectId; // Admin who blocked
  blockReason?: string; // Reason for blocking
  warnings?: Array<{
    reason: string;
    warnedBy: mongoose.Types.ObjectId;
    warnedAt: Date;
    postId?: mongoose.Types.ObjectId;
  }>; // Warning history
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

export default models.User || model<IUser>('User', UserSchema);
