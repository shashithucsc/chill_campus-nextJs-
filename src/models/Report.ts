import mongoose, { Schema, models, model } from 'mongoose';

const ReportSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  reason: String,
  createdAt: { type: Date, default: Date.now },
  // Add other fields as needed
});

export default models.Report || model('Report', ReportSchema);
