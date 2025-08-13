import mongoose, { Document, Schema, models, model } from 'mongoose';

// Reaction types like Facebook
export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface IReaction {
  user: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

export interface IReply {
  _id?: string;
  user: mongoose.Types.ObjectId;
  content: string;
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // For nested replies
  replies: IReply[];
  reactions: IReaction[];
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

const ReplySchema = new Schema<IReply>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  reactions: [ReactionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CommentSchema = new Schema<IComment>({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  replies: [ReplySchema],
  reactions: [ReactionSchema],
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ user: 1 });

// Clear any existing model to prevent conflicts
if (models.Comment) {
  delete models.Comment;
}

const Comment = model<IComment>('Comment', CommentSchema);

export default Comment;
