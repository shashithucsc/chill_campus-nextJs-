'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postLoading, setPostLoading] = useState(false);

  // Debug session data
  console.log("Session in profile page:", session);
  console.log("Session status:", status);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        if (status === 'loading') {
          return; // Wait for session to be loaded
        }
        
        if (!session?.user?.id) {
          throw new Error("No authenticated user found");
        }
        
        console.log("Fetching user data using session ID:", session.user.id);
        const res = await fetch(`/api/user?userId=${session.user.id}`);
        if (!res.ok) {
          throw new Error(`Error fetching user: ${res.status}`);
        }
        const data = await res.json();
        console.log("User data received:", data);
        
        if (!data.user) {
          throw new Error("No user data returned from API");
        }
        
        setEditedData({
          name: data.user.fullName || session.user.name || '',
          email: data.user.email || session.user.email || '',
          role: data.user.role || 'user',
          university: data.user.university || '',
          avatar: data.user.avatar || session.user.image || '/default-avatar.png',
          bio: data.user.bio || '',
          interests: data.user.interests || [],
          stats: { 
            posts: 0,  // Will be updated from posts data
            communities: data.user.communityCount || 0,
            events: 0 
          },
          recentActivity: [],
          userId: session.user.id
        });
        
        // Now fetch user's posts using session user ID
        await fetchUserPosts(session.user.id);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [session, status]);
  
  async function fetchUserPosts(userId: string) {
    if (!userId) return;
    
    setPostLoading(true);
    try {
      const res = await fetch(`/api/posts?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("User posts:", data);
        setUserPosts(data.posts || []);
        
        // Update stats with post count
        setEditedData((prev: any) => ({
          ...prev,
          stats: {
            ...prev.stats,
            posts: data.posts?.length || 0
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostLoading(false);
    }
  }

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1],
                delay: i * 0.5
              }}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              style={{
                left: `${15 + i * 10}%`,
                top: `${10 + i * 8}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      <Navbar onCreatePost={() => setShowCreatePost(true)} />
      <Sidebar />
      {showCreatePost && (
        <CreatePostModal 
          open={showCreatePost}
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={() => {
            setShowCreatePost(false);
            // Refresh posts after creating a new post
            fetchUserPosts(editedData?.userId);
          }}
        />
      )}
      <div className="pl-64 pt-16 relative z-10">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-xl mb-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-40 w-40 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 shadow-2xl">
                  <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm p-1 border border-white/20 overflow-hidden">
                    <Image
                      src={editedData.avatar}
                      alt={editedData.name}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover rounded-full"
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
                </div>
                {isEditing && (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-xl border border-white/20"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <input
                    className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3 text-white"
                    value={editedData.name}
                    onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                  />
                ) : (
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">{editedData.name}</h1>
                )}
                <p className="text-white/90 text-lg mt-2">{editedData.role}</p>
                <p className="text-white/70 mt-1">{editedData.university}</p>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-blue-500/25 font-semibold shadow-xl border border-white/20"
                  >
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Stats and Interests */}
            <div className="md:col-span-1 space-y-6">
              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors duration-300"
              >
                <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/20 mb-2">
                      <p className="text-2xl font-bold text-white">{editedData.stats.posts}</p>
                    </div>
                    <p className="text-sm text-white/80">Posts</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/20 mb-2">
                      <p className="text-2xl font-bold text-white">{editedData.stats.communities}</p>
                    </div>
                    <p className="text-sm text-white/80">Communities</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-white/20 mb-2">
                      <p className="text-2xl font-bold text-white">{editedData.stats.events}</p>
                    </div>
                    <p className="text-sm text-white/80">Events</p>
                  </div>
                </div>
              </motion.div>

              {/* Interests */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 hover:bg-white/15 transition-colors duration-300"
              >
                <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {(editedData.interests as string[]).length > 0 ? (
                    (editedData.interests as string[]).map((interest: string) => (
                      <motion.span
                        key={interest}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white rounded-full text-sm border border-white/20 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                      >
                        {interest}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-white/70">No interests added yet</p>
                  )}
                </div>
              </motion.div>
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

              {/* User Posts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Posts</h2>
                <div className="space-y-4">
                  {postLoading && <p className="text-gray-500">Loading posts...</p>}
                  
                  {!postLoading && userPosts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't created any posts yet.</p>
                      <button 
                        onClick={() => setShowCreatePost(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Your First Post
                      </button>
                    </div>
                  )}
                  
                  {!postLoading && userPosts.map((post) => (
                    <Post 
                      key={post._id}
                      id={post._id}
                      author={{
                        id: post.user?._id || session?.user?.id || '',
                        name: post.user?.fullName || session?.user?.name || 'Unknown',
                        avatar: post.user?.avatar || session?.user?.image || '/default-avatar.png',
                        role: post.user?.role || 'user'
                      }}
                      content={post.content}
                      media={post.media}
                      mediaType={post.mediaType}
                      likes={0}
                      comments={post.comments?.length || 0}
                      timestamp={new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    />
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