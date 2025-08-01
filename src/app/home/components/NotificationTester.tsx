'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NotificationTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [count, setCount] = useState(5);

  const createTestNotifications = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          count: selectedType !== 'all' ? count : undefined
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to create test notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types (1 of each)' },
    { value: 'mixed', label: 'Mixed Real-world Examples' },
    { value: 'post_like', label: 'Post Likes' },
    { value: 'post_comment', label: 'Post Comments' },
    { value: 'post_share', label: 'Post Shares' },
    { value: 'follow', label: 'New Followers' },
    { value: 'message', label: 'Messages' },
    { value: 'community_invite', label: 'Community Invites' },
    { value: 'system_announcement', label: 'System Announcements' },
    { value: 'admin_warning', label: 'Admin Warnings' },
    { value: 'event_reminder', label: 'Event Reminders' }
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6">Notification Tester</h3>
      
      <div className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Notification Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value} className="bg-gray-800">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Count Input (only for specific types) */}
        {selectedType !== 'all' && selectedType !== 'mixed' && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Count
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Create Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createTestNotifications}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating...</span>
            </div>
          ) : (
            'Create Test Notifications'
          )}
        </motion.button>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-500/20 border border-green-400/30' 
              : 'bg-red-500/20 border border-red-400/30'
          }`}>
            {result.success ? (
              <div>
                <p className="text-green-300 font-medium">
                  ✅ {result.data.message}
                </p>
                {result.data.notifications && (
                  <div className="mt-2 text-xs text-green-200">
                    <p>Created notifications:</p>
                    {result.data.notifications.slice(0, 3).map((notif: any, index: number) => (
                      <p key={index} className="ml-2">• {notif.title}</p>
                    ))}
                    {result.data.notifications.length > 3 && (
                      <p className="ml-2">• ... and {result.data.notifications.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-300">
                ❌ {result.error || 'Failed to create notifications'}
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <p className="text-blue-200 text-sm">
            <strong>Instructions:</strong><br />
            1. Select notification type<br />
            2. Set count (if applicable)<br />
            3. Click create<br />
            4. Check the notification bell in navbar
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
