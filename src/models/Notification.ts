import mongoose, { Document, Schema, models, model } from 'mongoose';

// Notification types enum
export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  POST_SHARE = 'post_share',
  COMMENT_REPLY = 'comment_reply',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
  MESSAGE = 'message',
  COMMUNITY_JOIN = 'community_join',
  COMMUNITY_INVITE = 'community_invite',
  POST_REPORT = 'post_report',
  ADMIN_WARNING = 'admin_warning',
  ADMIN_SUSPENSION = 'admin_suspension',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  COMMUNITY_POST = 'community_post',
  EVENT_REMINDER = 'event_reminder'
}

// Notification interface
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User who receives the notification
  sender?: mongoose.Types.ObjectId; // User who triggered the notification (optional for system notifications)
  type: NotificationType;
  title: string;
  message: string;
  
  // Related content references (optional)
  relatedPost?: mongoose.Types.ObjectId;
  relatedComment?: mongoose.Types.ObjectId;
  relatedCommunity?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  
  // Notification state
  isRead: boolean;
  isArchived: boolean;
  
  // Action URL (optional - where clicking notification leads)
  actionUrl?: string;
  
  // Priority level
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Delivery preferences
  deliveryMethods: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  
  // Email/Push delivery status
  emailSent?: boolean;
  emailSentAt?: Date;
  pushSent?: boolean;
  pushSentAt?: Date;
  
  // Metadata for additional context
  metadata?: Record<string, any>;
  
  // Expiration (optional)
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Index for efficient querying by recipient
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    
    // Related content
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    relatedComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    relatedCommunity: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      default: null
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // State
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Action
    actionUrl: {
      type: String,
      default: null
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    
    // Delivery preferences
    deliveryMethods: {
      inApp: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    
    // Delivery status
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date,
      default: null
    },
    pushSent: {
      type: Boolean,
      default: false
    },
    pushSentAt: {
      type: Date,
      default: null
    },
    
    // Metadata
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    
    // Expiration
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient querying
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired notifications

// Static methods interface
interface NotificationModel extends mongoose.Model<INotification> {
  createNotification(notificationData: Partial<INotification>): Promise<INotification>;
  markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<any>;
  getUnreadCount(userId: string): Promise<number>;
}

// Static methods for common operations
NotificationSchema.statics.createNotification = async function(notificationData: Partial<INotification>) {
  return await this.create(notificationData);
};

NotificationSchema.statics.markAsRead = async function(notificationId: string, userId: string) {
  return await this.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

NotificationSchema.statics.markAllAsRead = async function(userId: string) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

NotificationSchema.statics.getUnreadCount = async function(userId: string) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false
  });
};

export default (models.Notification as NotificationModel) || model<INotification, NotificationModel>('Notification', NotificationSchema);
