import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  type: 'Post' | 'User' | 'Comment';
  status: 'Pending' | 'Resolved' | 'Ignored';
  reason: string;
  description: string;
  reportedBy: {
    userId: mongoose.Types.ObjectId;
    name: string;
    avatar: string;
  };
  reportedContent: {
    postId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    content: string;
    communityId: mongoose.Types.ObjectId;
    communityName: string;
  };
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  adminNotes?: string;
}

const ReportSchema: Schema = new Schema({
  type: { 
    type: String, 
    enum: ['Post', 'User', 'Comment'], 
    required: true,
    default: 'Post'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Resolved', 'Ignored'], 
    required: true,
    default: 'Pending'
  },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  reportedBy: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  reportedContent: {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: false },
    communityName: { type: String, required: false }
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  adminNotes: { type: String }
}, {
  timestamps: true
});

// Indexes for efficient querying
ReportSchema.index({ 'reportedContent.postId': 1 });
ReportSchema.index({ 'reportedBy.userId': 1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ type: 1, status: 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
