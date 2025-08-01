import Notification, { NotificationType } from '@/models/Notification';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

interface CreateNotificationParams {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  relatedPost?: string;
  relatedComment?: string;
  relatedCommunity?: string;
  relatedUser?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  deliveryMethods?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
  };
}

export class NotificationService {
  // Create a new notification
  static async createNotification(params: CreateNotificationParams) {
    try {
      await dbConnect();

      const notification = await Notification.createNotification({
        recipient: new mongoose.Types.ObjectId(params.recipientId),
        sender: params.senderId ? new mongoose.Types.ObjectId(params.senderId) : undefined,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        priority: params.priority || 'medium',
        relatedPost: params.relatedPost ? new mongoose.Types.ObjectId(params.relatedPost) : undefined,
        relatedComment: params.relatedComment ? new mongoose.Types.ObjectId(params.relatedComment) : undefined,
        relatedCommunity: params.relatedCommunity ? new mongoose.Types.ObjectId(params.relatedCommunity) : undefined,
        relatedUser: params.relatedUser ? new mongoose.Types.ObjectId(params.relatedUser) : undefined,
        metadata: params.metadata || {},
        expiresAt: params.expiresAt,
        deliveryMethods: {
          inApp: true,
          email: params.deliveryMethods?.email || false,
          push: params.deliveryMethods?.push || false,
          ...params.deliveryMethods
        }
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Post-related notifications
  static async notifyPostLike(recipientId: string, senderId: string, postId: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.POST_LIKE,
      title: 'New like on your post',
      message: `${senderName} liked your post`,
      actionUrl: `/post/${postId}`,
      priority: 'low',
      relatedPost: postId,
      relatedUser: senderId
    });
  }

  static async notifyPostComment(recipientId: string, senderId: string, postId: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.POST_COMMENT,
      title: 'New comment on your post',
      message: `${senderName} commented on your post`,
      actionUrl: `/post/${postId}`,
      priority: 'medium',
      relatedPost: postId,
      relatedUser: senderId
    });
  }

  static async notifyPostShare(recipientId: string, senderId: string, postId: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.POST_SHARE,
      title: 'Your post was shared',
      message: `${senderName} shared your post`,
      actionUrl: `/post/${postId}`,
      priority: 'medium',
      relatedPost: postId,
      relatedUser: senderId
    });
  }

  static async notifyCommentReply(recipientId: string, senderId: string, commentId: string, postId: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.COMMENT_REPLY,
      title: 'New reply to your comment',
      message: `${senderName} replied to your comment`,
      actionUrl: `/post/${postId}#comment-${commentId}`,
      priority: 'medium',
      relatedComment: commentId,
      relatedPost: postId,
      relatedUser: senderId
    });
  }

  // Follow notifications
  static async notifyFollow(recipientId: string, senderId: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.FOLLOW,
      title: 'New follower',
      message: `${senderName} started following you`,
      actionUrl: `/profile/${senderId}`,
      priority: 'medium',
      relatedUser: senderId
    });
  }

  // Message notifications
  static async notifyMessage(recipientId: string, senderId: string, senderName: string, messagePreview: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.MESSAGE,
      title: 'New message',
      message: `${senderName}: ${messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview}`,
      actionUrl: `/messages/${senderId}`,
      priority: 'high',
      relatedUser: senderId
    });
  }

  // Community notifications
  static async notifyCommunityJoin(recipientId: string, senderId: string, communityId: string, communityName: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.COMMUNITY_JOIN,
      title: 'New community member',
      message: `${senderName} joined ${communityName}`,
      actionUrl: `/community/${communityId}`,
      priority: 'low',
      relatedCommunity: communityId,
      relatedUser: senderId
    });
  }

  static async notifyCommunityInvite(recipientId: string, senderId: string, communityId: string, communityName: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.COMMUNITY_INVITE,
      title: 'Community invitation',
      message: `${senderName} invited you to join ${communityName}`,
      actionUrl: `/community/${communityId}/invite`,
      priority: 'high',
      relatedCommunity: communityId,
      relatedUser: senderId
    });
  }

  static async notifyCommunityPost(recipientId: string, senderId: string, postId: string, communityId: string, communityName: string, senderName: string) {
    return this.createNotification({
      recipientId,
      senderId,
      type: NotificationType.COMMUNITY_POST,
      title: 'New post in community',
      message: `${senderName} posted in ${communityName}`,
      actionUrl: `/post/${postId}`,
      priority: 'low',
      relatedPost: postId,
      relatedCommunity: communityId,
      relatedUser: senderId
    });
  }

  // Admin notifications
  static async notifyAdminWarning(recipientId: string, reason: string, details?: string) {
    return this.createNotification({
      recipientId,
      type: NotificationType.ADMIN_WARNING,
      title: 'Warning from moderators',
      message: `You received a warning: ${reason}`,
      actionUrl: '/support/warnings',
      priority: 'urgent',
      metadata: { reason, details }
    });
  }

  static async notifyAdminSuspension(recipientId: string, reason: string, duration: string) {
    return this.createNotification({
      recipientId,
      type: NotificationType.ADMIN_SUSPENSION,
      title: 'Account suspended',
      message: `Your account has been suspended for ${duration}. Reason: ${reason}`,
      actionUrl: '/support/suspension',
      priority: 'urgent',
      metadata: { reason, duration }
    });
  }

  // System notifications
  static async notifySystemAnnouncement(recipientId: string, title: string, message: string, actionUrl?: string) {
    return this.createNotification({
      recipientId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title,
      message,
      actionUrl,
      priority: 'medium'
    });
  }

  static async notifyEventReminder(recipientId: string, eventTitle: string, eventDate: Date, eventId?: string) {
    return this.createNotification({
      recipientId,
      type: NotificationType.EVENT_REMINDER,
      title: 'Event reminder',
      message: `Reminder: ${eventTitle} is coming up on ${eventDate.toLocaleDateString()}`,
      actionUrl: eventId ? `/events/${eventId}` : undefined,
      priority: 'medium',
      metadata: { eventTitle, eventDate: eventDate.toISOString() }
    });
  }

  // Bulk notifications
  static async createBulkNotifications(notifications: CreateNotificationParams[]) {
    try {
      await dbConnect();
      
      const notificationDocs = notifications.map(params => ({
        recipient: new mongoose.Types.ObjectId(params.recipientId),
        sender: params.senderId ? new mongoose.Types.ObjectId(params.senderId) : undefined,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        priority: params.priority || 'medium',
        relatedPost: params.relatedPost ? new mongoose.Types.ObjectId(params.relatedPost) : undefined,
        relatedComment: params.relatedComment ? new mongoose.Types.ObjectId(params.relatedComment) : undefined,
        relatedCommunity: params.relatedCommunity ? new mongoose.Types.ObjectId(params.relatedCommunity) : undefined,
        relatedUser: params.relatedUser ? new mongoose.Types.ObjectId(params.relatedUser) : undefined,
        metadata: params.metadata || {},
        expiresAt: params.expiresAt,
        deliveryMethods: {
          inApp: true,
          email: params.deliveryMethods?.email || false,
          push: params.deliveryMethods?.push || false,
          ...params.deliveryMethods
        }
      }));

      return await Notification.insertMany(notificationDocs);
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;
