import mongoose, { Document, Schema, models, model } from 'mongoose';

export interface IConversation extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  unreadCount: Map<string, number>; // userId -> unread count
  isArchived: Map<string, boolean>; // userId -> archived status
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    lastMessage: {
      type: Schema.Types.ObjectId
      // Temporarily removed ref to break circular dependency
      // ref: 'DirectMessage'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    isArchived: {
      type: Map,
      of: Boolean,
      default: new Map()
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Ensure unique conversations between two users
ConversationSchema.index({ participants: 1 }, { unique: true });
ConversationSchema.index({ lastMessageAt: -1 });

export default models.Conversation || model<IConversation>('Conversation', ConversationSchema);
