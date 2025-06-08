'use client';

import { useState } from 'react';
import Image from 'next/image';

// Sample data - In a real app, this would come from an API
const stats = {
  totalUsers: 1250,
  activeUsers: 850,
  totalPosts: 3450,
  totalEvents: 120,
  totalCommunities: 45,
  newUsers: 45,
  newPosts: 120,
  newEvents: 8,
};

const recentUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'Student',
    joinDate: '2024-03-01',
    status: 'Active',
    avatar: '/default-avatar.png',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    role: 'Student',
    joinDate: '2024-03-02',
    status: 'Active',
    avatar: '/default-avatar.png',
  },
  // Add more sample users
];

const recentActivity = [
  {
    type: 'user',
    action: 'New user registration',
    details: 'John Doe joined the platform',
    timestamp: '2 hours ago',
  },
  {
    type: 'post',
    action: 'New post reported',
    details: 'Post ID: #1234 in Computer Science community',
    timestamp: '3 hours ago',
  },
  {
    type: 'event',
    action: 'Event created',
    details: 'Tech Workshop: Web Development',
    timestamp: '5 hours ago',
  },
  // Add more sample activities
];

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+{stats.newUsers} new users</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+{stats.newPosts} new posts</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+{stats.newEvents} new events</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Communities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCommunities}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Active communities</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <button className="w-full px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50">
                  View all users
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            activity.type === 'user' ? 'bg-blue-100' :
                            activity.type === 'post' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            <svg className={`h-6 w-6 ${
                              activity.type === 'user' ? 'text-blue-600' :
                              activity.type === 'post' ? 'text-green-600' :
                              'text-purple-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {activity.type === 'user' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              )}
                              {activity.type === 'post' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              )}
                              {activity.type === 'event' && (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-sm text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <button className="w-full px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 