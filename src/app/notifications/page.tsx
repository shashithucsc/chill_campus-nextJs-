'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../home/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import Navbar from '../home/navbar/Navbar';
import Sidebar from '../home/sidebar/Sidebar';

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
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Dark gradient background matching home theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>

      {/* Subtle floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
            style={{ 
              left: `${15 + i * 15}%`, 
              top: `${5 + i * 12}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}
      </div>

      <Navbar />
      <Sidebar />
      
      <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Notifications
            </h1>
            <p className="text-lg text-gray-300">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'Stay updated with your latest activities'}
            </p>
          </motion.div>

          <div className="flex items-center justify-between mb-6">
            {/* Filter Tabs */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                All Notifications
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  filter === 'unread'
                    ? 'bg-gray-800 text-white border border-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </div>

            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl text-gray-300 text-sm font-medium transition-all duration-300"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Mark all read</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refresh}
                className="p-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-xl text-gray-300 transition-all duration-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
          >
            {error && (
              <div className="p-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {loading && filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full mx-auto mb-4"
                />
                <p className="text-gray-400">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-gray-400">
                  {filter === 'unread' 
                    ? 'All caught up! Check back later for updates.'
                    : 'You\'ll see notifications here when something happens.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 cursor-pointer transition-all duration-200 border-l-4 ${
                      notification.isRead
                        ? 'border-transparent'
                        : `border-gradient-to-b ${getPriorityColor(notification.priority)}`
                    } ${!notification.isRead ? 'bg-gray-800/30' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar/Icon */}
                      <div className="flex-shrink-0">
                        {notification.sender?.profilePicture || notification.relatedUser?.profilePicture ? (
                          <img
                            src={notification.sender?.profilePicture || notification.relatedUser?.profilePicture}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-lg border-2 border-gray-700">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-base font-medium ${
                              notification.isRead ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-2 ${
                              notification.isRead ? 'text-gray-400' : 'text-gray-300'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <p className="text-xs text-gray-500">
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
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleArchive(notification._id, e)}
                              className="p-2 hover:bg-red-500/20 rounded-full transition-colors group"
                            >
                              <TrashIcon className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
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
                    whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.3)" }}
                    onClick={loadMore}
                    className="p-6 cursor-pointer text-center border-t border-gray-800"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-4 border-gray-600 border-t-white rounded-full mx-auto"
                      />
                    ) : (
                      <p className="text-blue-400 hover:text-blue-300 font-medium">
                        Load more notifications
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
