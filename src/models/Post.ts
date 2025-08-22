import mongoose, { Document, Schema, models, model } from 'mongoose';

// Import models to ensure they're registered before being referenced
import './User'; // This ensures User model is registered
import './Community'; // This ensures Community model is registered

export interface IComment {
  _id: string;
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  community?: mongoose.Types.ObjectId;  // Reference to community
  media?: string[]; // URLs to images/videos
  mediaType?: 'image' | 'video' | null;
  comments?: IComment[];
  likes?: mongoose.Types.ObjectId[]; // Array of user IDs who liked the post
  disabled?: boolean; // Admin can disable posts
  disabledBy?: mongoose.Types.ObjectId; // Admin who disabled
  disabledAt?: Date; // When it was disabled
  disableReason?: string; // Reason for disabling
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
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    media: [{ type: String }],
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
    comments: { type: [CommentSchema], default: [] },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the post
    disabled: { type: Boolean, default: false },
    disabledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disabledAt: { type: Date },
    disableReason: { type: String }
  },
  { timestamps: true }
);

export default models.Post || model<IPost>('Post', PostSchema);
