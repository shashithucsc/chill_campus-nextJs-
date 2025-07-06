import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IComment {
  _id: string;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  media?: string[]; // URLs to images/videos
  mediaType?: 'image' | 'video' | null;
  comments?: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  _id: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Post || model<IPost>('Post', PostSchema);
