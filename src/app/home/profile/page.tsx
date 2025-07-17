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

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }} 
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 rounded-full border-t-4 border-l-4 border-r-4 border-b-transparent border-white/30 mx-auto mb-4"
          />
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium"
          >
            Loading your profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }
  
  // Enhanced error state
  if (!editedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8 rounded-2xl bg-gradient-to-br from-red-900/30 to-purple-900/30 backdrop-blur-xl border border-white/20 shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500/80 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent mb-2">Profile Not Available</h2>
          <p className="text-white/80 mb-6">User profile could not be loaded. You may not be logged in or the profile doesn't exist.</p>
          <motion.a
            href="/auth/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-xl border border-white/20"
          >
            Return to Login
          </motion.a>
        </motion.div>
      </div>
    );
  };

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
        {/* Profile Header - Enhanced with modern glassmorphism design */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl mb-8 overflow-hidden"
        >
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Avatar Container with glow effect */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-44 w-44 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-1 shadow-2xl relative overflow-hidden group">
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-600/50 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm p-1 border border-white/20 overflow-hidden">
                    <div className="h-full w-full rounded-lg overflow-hidden">
                      <Image
                        src={editedData.avatar}
                        alt={editedData.name}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>
                    
                    {isEditing && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white/90 text-sm font-medium">Change Photo</p>
                        </div>
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
                      </>
                    )}
                  </div>
                </div>
                
                {/* Camera icon for editing mode */}
                {isEditing && (
                  <motion.button 
                    whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(147, 51, 234, 0.3)" }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-xl border border-white/30"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>
              
              {/* User information with animated elements */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  {isEditing ? (
                    <input
                      className="w-full px-4 py-3 border border-white/30 rounded-xl bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 text-white font-medium"
                      value={editedData.name}
                      onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                    />
                  ) : (
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
                    >
                      {editedData.name}
                    </motion.h1>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center sm:items-start justify-center md:justify-start"
                  >
                    <div className="flex items-center">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 h-5 w-5 rounded-full flex items-center justify-center mr-2">
                        <span className="bg-white/80 h-1.5 w-1.5 rounded-full"></span>
                      </span>
                      <p className="text-white/90 font-medium">
                        <span className="text-white/70">Role: </span>
                        <span className="text-white">{editedData.role}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 h-5 w-5 rounded-full flex items-center justify-center mr-2">
                        <span className="bg-white/80 h-1.5 w-1.5 rounded-full"></span>
                      </span>
                      <p className="text-white/90 font-medium">
                        <span className="text-white/70">University: </span>
                        <span className="text-white">{editedData.university}</span>
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                {/* Action buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start"
                >
                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(79, 70, 229, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl border border-white/20 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </motion.button>
                  ) : null}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Profile Cards */}
            <div className="md:col-span-1 space-y-8">
              {/* Stats Card with animated counters */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-blue-800/40 to-purple-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 overflow-hidden relative"
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Activity Stats
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600/40 to-blue-800/40 border border-white/30 shadow-lg shadow-blue-900/20 mb-2 hover:shadow-blue-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.posts}
                      </motion.p>
                    </div>
                    <p className="text-sm font-medium text-blue-100">Posts</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-600/40 to-indigo-800/40 border border-white/30 shadow-lg shadow-blue-900/20 mb-2 hover:shadow-indigo-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.communities}
                      </motion.p>
                    </div>
                    <p className="text-sm font-medium text-blue-100">Communities</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-purple-800/40 border border-white/30 shadow-lg shadow-blue-900/20 mb-2 hover:shadow-purple-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.events}
                      </motion.p>
                    </div>
                    <p className="text-sm font-medium text-blue-100">Events</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Interests with interactive tags */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-800/40 to-purple-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 overflow-hidden relative"
              >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Interests
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  {(editedData.interests as string[]).length > 0 ? (
                    (editedData.interests as string[]).map((interest: string, index: number) => (
                      <motion.span
                        key={interest}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(147, 51, 234, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 text-white rounded-xl text-sm border border-white/30 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 backdrop-blur-sm"
                      >
                        {interest}
                      </motion.span>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-full py-8 text-center"
                    >
                      <p className="text-white/70 mb-3">No interests added yet</p>
                      {isEditing && (
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-500/50 to-purple-500/50 text-white rounded-xl text-sm border border-white/30 hover:shadow-purple-500/30 transition-all duration-300">
                          Add interests
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Create New Post Button (Mobile-visible) */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreatePost(true)}
                className="md:hidden w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl border border-white/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Post
              </motion.button>
            </div>

            {/* Right Column - Bio and User Posts */}
            <div className="md:col-span-2 space-y-8">
              {/* Bio with sleek design */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-blue-800/40 to-purple-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About Me
                </h2>
                
                {isEditing ? (
                  <textarea
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50"
                    rows={4}
                    value={editedData.bio || ''}
                    placeholder="Share a bit about yourself..."
                    onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  />
                ) : (
                  <div className="text-white/90 leading-relaxed backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
                    {editedData.bio ? editedData.bio : (
                      <div className="text-white/60 italic">No bio information added yet.</div>
                    )}
                  </div>
                )}
                
                {/* Quick actions */}
                {!isEditing && (
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(79, 70, 229, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreatePost(true)}
                      className="hidden md:flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-xl border border-white/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Post
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* User Posts with animations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-br from-blue-800/40 to-purple-800/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 overflow-hidden relative"
              >
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Posts
                </h2>
                
                <div className="space-y-6">
                  {postLoading && (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {!postLoading && userPosts.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12 px-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300/70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <p className="text-white/70 mb-6 text-lg">You haven't created any posts yet.</p>
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreatePost(true)}
                        className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-xl border border-white/20"
                      >
                        Create Your First Post
                      </motion.button>
                    </motion.div>
                  )}
                  
                  <div className="space-y-6">
                    {!postLoading && userPosts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                      >
                        <Post 
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
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Edit Mode Actions - with glassmorphism design */}
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-lg border-t border-white/20 p-5 shadow-[0_-15px_30px_rgba(0,0,0,0.3)] z-40"
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-white/80 hidden md:block">
                  <span className="bg-white/20 p-1.5 rounded-full inline-block mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Don't forget to save your changes
                </p>
                
                <div className="flex gap-4 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsEditing(false)}
                    className="flex-1 sm:flex-initial px-6 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors duration-300 font-medium"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium border border-white/20 shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}