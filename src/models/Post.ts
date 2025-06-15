import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  media?: string[]; // URLs to images/videos
  mediaType?: 'image' | 'video' | null;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
  },
  { timestamps: true }
);

export default models.Post || model<IPost>('Post', PostSchema);
