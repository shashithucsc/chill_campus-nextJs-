import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'event',
    title: 'New Event: Tech Workshop',
    message: 'A new tech workshop has been scheduled for tomorrow',
    time: '5 minutes ago',
    read: false,
    icon: '🎓',
  },
  {
    id: 2,
    type: 'community',
    title: 'New Community Member',
    message: 'John Doe joined the Programming Community',
    time: '1 hour ago',
    read: false,
    icon: '👥',
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message',
    message: 'You have a new message from Jane Smith',
    time: '2 hours ago',
    read: true,
    icon: '💬',
  },
  {
    id: 4,
    type: 'system',
    title: 'Profile Update',
    message: 'Your profile has been successfully updated',
    time: '1 day ago',
    read: true,
    icon: '⚙️',
  },
];

export default function Notifications() {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <Layout>
      <Head>
        <title>Notifications - ChillCampus</title>
        <meta name="description" content="View your notifications" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('event')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'event'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setFilter('community')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filter === 'community'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Communities
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-2xl">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 