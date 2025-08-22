'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  sender?: string;
  priority: string;
}

interface NotificationToastProps {
  notification: Notification;
  t: {
    visible: boolean;
    id: string;
  };
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-red-500';
    case 'high':
      return 'border-orange-500';
    case 'medium':
      return 'border-blue-500';
    case 'low':
    default:
      return 'border-green-500';
  }
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, t }) => {
  return (
    <div 
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
               max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto 
               flex flex-col border-l-4 ${getPriorityColor(notification.priority)}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {notification.actionUrl && (
          <div className="mt-2 text-right">
            <Link
              href={notification.actionUrl}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
