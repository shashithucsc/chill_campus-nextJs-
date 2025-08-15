import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IDirectMessage extends Document {
  _id: string;
  content: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: Date;
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

const DirectMessageSchema = new Schema<IDirectMessage>(
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
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
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
      ref: 'DirectMessage'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
DirectMessageSchema.index({ sender: 1, recipient: 1, timestamp: -1 });
DirectMessageSchema.index({ recipient: 1, isRead: 1 });
DirectMessageSchema.index({ timestamp: -1 });

// Compound index for conversation queries (reverse order for bidirectional search)
DirectMessageSchema.index({ recipient: 1, sender: 1, timestamp: -1 });

export default models.DirectMessage || model<IDirectMessage>('DirectMessage', DirectMessageSchema);
