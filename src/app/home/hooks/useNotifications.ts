'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface NotificationData {
  _id: string;
  sender?: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  relatedUser?: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: NotificationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 1, unreadOnly = false) => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        ...(unreadOnly && { unreadOnly: 'true' })
      });

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationsResponse = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setNotifications(data.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.data.notifications]);
        }
        
        setUnreadCount(data.data.unreadCount);
        setHasMore(pageNum < data.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications/unread-count');
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data: UnreadCountResponse = await response.json();
      
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }

      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );

      // Update unread count if the notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  }, [notifications]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications(1);
      
      // Set up periodic refresh for unread count
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, fetchNotifications, fetchUnreadCount]);

  // Helper function to get time ago
  const getTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }, []);

  // Helper function to get notification icon
  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'post_like': return '❤️';
      case 'post_comment': return '💬';
      case 'post_share': return '🔄';
      case 'comment_reply': return '↩️';
      case 'follow': return '👤';
      case 'message': return '✉️';
      case 'community_join': return '🏠';
      case 'community_invite': return '📩';
      case 'community_post': return '📝';
      case 'admin_warning': return '⚠️';
      case 'admin_suspension': return '🚫';
      case 'system_announcement': return '📢';
      case 'event_reminder': return '📅';
      default: return '🔔';
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    loadMore,
    getTimeAgo,
    getNotificationIcon,
    refresh: () => fetchNotifications(1)
  };
}
