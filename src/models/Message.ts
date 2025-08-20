import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  content: string;
  sender: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  timestamp: Date;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'pdf';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isEdited: boolean;
  editedAt?: Date;
  reactions: Array<{
    userId: mongoose.Types.ObjectId;
    emoji: string;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Message content cannot exceed 2000 characters']
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'file', 'pdf'],
      default: 'text'
    },
    fileUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileSize: {
      type: Number
    },
    fileType: {
      type: String
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    reactions: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: {
        type: String,
        required: true
      }
    }],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
MessageSchema.index({ community: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, timestamp: -1 });

export default models.Message || model<IMessage>('Message', MessageSchema);
