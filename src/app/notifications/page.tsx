'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../home/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
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
    getNotificationIcon,
    refresh
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
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

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-white/60 text-sm mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllRead}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 rounded-xl text-green-300 text-sm font-medium transition-all duration-300"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Mark all read</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refresh}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300 transition-all duration-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              filter === 'all'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            All Notifications
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
              filter === 'unread'
                ? 'bg-white/20 text-white border border-white/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {loading && filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-4"
              />
              <p className="text-white/60">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-white/80 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-white/60">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for updates.'
                  : 'You\'ll see notifications here when something happens.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 cursor-pointer transition-all duration-200 border-l-4 ${
                    notification.isRead
                      ? 'border-transparent'
                      : `border-gradient-to-b ${getPriorityColor(notification.priority)}`
                  } ${!notification.isRead ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                      {notification.sender?.profilePicture || notification.relatedUser?.profilePicture ? (
                        <img
                          src={notification.sender?.profilePicture || notification.relatedUser?.profilePicture}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg border-2 border-white/20">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-base font-medium ${
                            notification.isRead ? 'text-white/70' : 'text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-2 ${
                            notification.isRead ? 'text-white/50' : 'text-white/70'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <p className="text-xs text-white/40">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getPriorityColor(notification.priority)} text-white font-medium`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleArchive(notification._id, e)}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors group"
                          >
                            <TrashIcon className="w-4 h-4 text-white/40 group-hover:text-red-400" />
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
                  className="p-6 cursor-pointer text-center border-t border-white/10"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full mx-auto"
                    />
                  ) : (
                    <p className="text-blue-300 hover:text-blue-200 font-medium">
                      Load more notifications
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
