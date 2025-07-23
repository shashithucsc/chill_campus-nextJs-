import mongoose, { Schema, models, model } from 'mongoose';

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  content: String,
  createdAt: { type: Date, default: Date.now },
  // Add other fields as needed
});

export default models.Comment || model('Comment', CommentSchema);
