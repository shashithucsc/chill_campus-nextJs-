'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, NotificationData } from '../hooks/useNotifications';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    loadMore,
    getTimeAgo,
    getNotificationIcon
  } = useNotifications();

  const router = useRouter();

  const handleNotificationClick = async (notification: NotificationData) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleArchive = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveNotification(notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-pink-500';
      case 'high': return 'from-orange-500 to-yellow-500';
      case 'medium': return 'from-blue-500 to-cyan-500';
      case 'low': return 'from-gray-500 to-slate-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-96 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${getPriorityColor('high')}`}
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllRead}
              className="text-xs text-blue-300 hover:text-blue-200 font-medium transition-colors"
            >
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="px-6 py-4 text-center">
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {loading && notifications.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-2"
              />
              <p className="text-sm text-white/60">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm text-white/60">No notifications yet</p>
              <p className="text-xs text-white/40 mt-1">
                You'll see notifications here when something happens
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 cursor-pointer transition-all duration-200 border-l-4 ${
                    notification.isRead
                      ? 'border-transparent'
                      : `border-gradient-to-b ${getPriorityColor(notification.priority)}`
                  } ${!notification.isRead ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.sender?.profilePicture || notification.relatedUser?.profilePicture ? (
                        <img
                          src={notification.sender?.profilePicture || notification.relatedUser?.profilePicture}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.isRead ? 'text-white/70' : 'text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            notification.isRead ? 'text-white/50' : 'text-white/70'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-white/40 mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleArchive(notification._id, e)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <svg className="w-3 h-3 text-white/40 hover:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More */}
              {hasMore && (
                <motion.div
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  onClick={loadMore}
                  className="px-6 py-4 cursor-pointer text-center border-t border-white/10"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full mx-auto"
                    />
                  ) : (
                    <p className="text-sm text-blue-300 hover:text-blue-200 font-medium">
                      Load more notifications
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/20">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="w-full text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold hover:from-blue-300 hover:to-purple-300 text-center py-2"
          >
            View all notifications
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;
