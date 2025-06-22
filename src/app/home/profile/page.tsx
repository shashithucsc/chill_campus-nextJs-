'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setEditedData({
          name: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
          university: data.user.university || '',
          avatar: data.user.avatar || '/default-avatar.png',
          bio: '',
          interests: [],
          stats: { posts: 0, communities: 0, events: 0 },
          recentActivity: [],
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('fullName', editedData.name);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const res = await fetch('/api/user', {
      method: 'PUT',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setEditedData((prev: any) => ({
        ...prev,
        name: data.user.fullName,
        avatar: data.user.avatar || prev.avatar,
      }));
      setIsEditing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!editedData) return <div className="min-h-screen flex items-center justify-center text-red-500">User not found or not logged in.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCreatePost={() => setShowCreatePost(true)} />
      <Sidebar />
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
      <div className="pl-64 pt-16">
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
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer h-full"
                      title="Choose new profile picture"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setAvatarFile(e.target.files[0]);
                          setEditedData((prev: any) => ({ ...prev, avatar: URL.createObjectURL(e.target.files![0]) }));
                        }
                      }}
                    />
                  )}
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
                {isEditing ? (
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    value={editedData.name}
                    onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{editedData.name}</h1>
                )}
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
                  {(editedData.interests as string[]).map((interest: string) => (
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
                  {(editedData.recentActivity as any[]).map((activity: any, index: number) => (
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
    </div>
  );
}