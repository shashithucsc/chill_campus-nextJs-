'use client';

import { useState } from 'react';
import Image from 'next/image';

// Sample user data - In a real app, this would come from an API
const userData = {
  name: 'John Doe',
  email: 'john.doe@university.edu',
  role: 'Computer Science Student',
  university: 'University of Technology',
  avatar: '/default-avatar.png',
  bio: 'Passionate about web development and artificial intelligence. Always eager to learn new technologies and solve complex problems.',
  interests: ['Web Development', 'AI/ML', 'Data Science', 'Cloud Computing'],
  stats: {
    posts: 42,
    communities: 8,
    events: 15,
  },
  recentActivity: [
    {
      type: 'post',
      content: 'Just finished my final project for the semester!',
      timestamp: '2 hours ago',
    },
    {
      type: 'event',
      content: 'Registered for Tech Workshop: Web Development',
      timestamp: '1 day ago',
    },
    {
      type: 'community',
      content: 'Joined Computer Science Community',
      timestamp: '3 days ago',
    },
  ],
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden">
                <Image
                  src={editedData.avatar}
                  alt={editedData.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{editedData.name}</h1>
              <p className="text-gray-600">{editedData.role}</p>
              <p className="text-gray-500">{editedData.university}</p>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Stats and Interests */}
          <div className="md:col-span-1 space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{editedData.stats.posts}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{editedData.stats.communities}</p>
                  <p className="text-sm text-gray-500">Communities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{editedData.stats.events}</p>
                  <p className="text-sm text-gray-500">Events</p>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {editedData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Bio and Recent Activity */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              {isEditing ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={editedData.bio}
                  onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                />
              ) : (
                <p className="text-gray-600">{editedData.bio}</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {editedData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {activity.type === 'post' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          )}
                          {activity.type === 'event' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          )}
                          {activity.type === 'community' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          )}
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-900">{activity.content}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Actions */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex justify-end space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 