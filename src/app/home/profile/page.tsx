'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';
import ProfileViewModal from '../components/ProfileViewModal';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postLoading, setPostLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
            favorites: 0 // Will be updated from favorites data
          },
          recentActivity: [],
          userId: session.user.id
        });
        
        // Now fetch user's posts using session user ID
        await fetchUserPosts(session.user.id);
        
        // Fetch user's favorites
        await fetchUserFavorites();
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

  async function fetchUserFavorites() {
    setFavoritesLoading(true);
    try {
      const res = await fetch('/api/users/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
        
        // Update stats with favorites count
        setEditedData((prev: any) => ({
          ...prev,
          stats: {
            ...prev.stats,
            favorites: data.favorites?.length || 0
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  }

  // Profile view handlers
  const handleProfileClick = (userId: string) => {
    setSelectedProfile(userId);
    setShowProfileModal(true);
  };

  const handleStartChat = (userId: string) => {
    // Navigate to messaging with this user
    window.location.href = `/home/messages?userId=${userId}`;
  };

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
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 1.2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
              className="w-20 h-20 rounded-full border-t-4 border-l-4 border-r-4 border-b-transparent mx-auto mb-4"
              style={{ borderTopColor: '#2563EB', borderLeftColor: '#7C3AED', borderRightColor: '#9333EA', borderBottomColor: 'transparent', boxShadow: '0 8px 30px rgba(59,130,246,0.12)' }}
            />
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent font-medium"
            >
              Loading your profile...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Enhanced error state with dark theme
  if (!editedData) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto p-8 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">Profile Not Available</h2>
            <p className="text-gray-300 mb-6">User profile could not be loaded. You may not be logged in or the profile doesn't exist.</p>
            <motion.a
              href="/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-xl border border-gray-600"
            >
              Return to Login
            </motion.a>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Dark gradient background matching system theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>

      {/* Subtle floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
            style={{ left: `${20 + i * 20}%`, top: `${10 + i * 15}%` }}
          />
        ))}
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
            fetchUserFavorites();
          }}
        />
      )}
      <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
        {/* Profile Header - Dark theme with glass morphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900/60 backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl mb-6 md:mb-8 mt-4 md:mt-6 mx-4 md:mx-6 lg:mx-8 overflow-hidden lg:max-w-[76rem] xl:max-w-[76rem] xl:mx-auto"
        >
          {/* Background elements with dark theme */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
              {/* Avatar Container with glow effect */}
              <motion.div 
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-32 w-32 md:h-44 md:w-44 rounded-2xl bg-gray-800/80 backdrop-blur-md border border-gray-600/50 p-1 shadow-2xl relative overflow-hidden group">
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-gray-600/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  
                  {/* Glow effect matching landing theme */}
                  <div className="absolute -inset-0.5 bg-gray-700/40 rounded-2xl opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <div className="relative h-full w-full rounded-xl bg-gray-800/50 backdrop-blur-sm p-1 border border-gray-600 overflow-hidden">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-800/60 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-gray-200 text-sm font-medium">Change Photo</p>
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
                    whileHover={{ scale: 1.1, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 md:p-3 rounded-full shadow-xl border border-gray-600"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>
              
              {/* User information with animated elements */}
              <div className="flex-1 text-center md:text-left space-y-3 md:space-y-4 w-full">
                <div className="space-y-1">
                  {isEditing ? (
                    <input
                      className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-white font-medium"
                      value={editedData.name}
                      onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                    />
                  ) : (
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                    >
                      {editedData.name}
                    </motion.h1>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 items-center justify-center md:justify-start"
                  >
                    <div className="flex items-center">
                      <span className="bg-gray-700/60 backdrop-blur-sm border border-gray-600/40 h-5 w-5 rounded-full flex items-center justify-center mr-2">
                        <span className="bg-white/80 h-1.5 w-1.5 rounded-full"></span>
                      </span>
                      <p className="text-gray-300 font-medium">
                        <span className="text-gray-400">Role: </span>
                        <span className="text-white">{editedData.role}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="bg-gray-700/60 backdrop-blur-sm border border-gray-600/40 h-5 w-5 rounded-full flex items-center justify-center mr-2">
                        <span className="bg-white/80 h-1.5 w-1.5 rounded-full"></span>
                      </span>
                      <p className="text-gray-300 font-medium">
                        <span className="text-gray-400">University: </span>
                        <span className="text-white">{editedData.university}</span>
                      </p>
                    </div>
                  </motion.div>
                  {/* Communities joined badge - visible near header info */}
                  <div className="mt-3 flex items-center gap-3 justify-center md:justify-start">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/80 backdrop-blur-md border border-gray-600/50 text-white font-medium shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-6a4 4 0 10-8 0v6" />
                      </svg>
                      <span className="text-sm md:text-base">{editedData.stats?.communities ?? 0} communities</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 hidden md:block">Member since { /* optionally show join date if available */ }</p>
                  </div>
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
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-6 md:px-7 py-3 bg-gray-900/80 backdrop-blur-md border border-white/10 text-white rounded-xl font-semibold shadow-2xl flex items-center gap-2 text-sm md:text-base hover:bg-gray-800/80 hover:border-white/20 transition-all duration-300"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Profile Cards */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
              {/* Stats Card with animated counters - Dark theme */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 overflow-hidden relative"
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-10 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
                
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Activity Stats
                </h2>
                
                <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 mx-auto rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center bg-gray-800/80 backdrop-blur-md border border-gray-600/50 shadow-lg mb-1 md:mb-2 hover:shadow-gray-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-base md:text-lg lg:text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.posts}
                      </motion.p>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-300">Posts</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 mx-auto rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center bg-gray-800/80 backdrop-blur-md border border-gray-600/50 shadow-lg mb-1 md:mb-2 hover:shadow-gray-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-lg md:text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.communities}
                      </motion.p>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-300">Communities</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 mx-auto rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center bg-gray-800/80 backdrop-blur-md border border-gray-600/50 shadow-lg mb-1 md:mb-2 hover:shadow-gray-500/30 transition-all duration-300">
                      <motion.p 
                        className="text-base md:text-lg lg:text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      >
                        {editedData.stats.favorites}
                      </motion.p>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-300">Favourites</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Interests with interactive tags - Dark theme */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 overflow-hidden relative"
              >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Interests
                </h2>
                
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {(editedData.interests as string[]).length > 0 ? (
                    (editedData.interests as string[]).map((interest: string, index: number) => (
                      <motion.span
                        key={interest}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 text-white rounded-lg md:rounded-xl text-xs md:text-sm shadow-lg hover:shadow-gray-500/30 transition-all duration-300"
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
                      <p className="text-gray-300 mb-3 text-sm md:text-base">No interests added yet</p>
                      {isEditing && (
                        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 text-white rounded-lg md:rounded-xl text-xs md:text-sm hover:shadow-gray-500/30 transition-all duration-300">
                          Add interests
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Create New Post Button (Mobile-visible) - Dark theme */}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreatePost(true)}
                className="lg:hidden w-full py-3 md:py-4 px-4 md:px-6 bg-gray-900/80 backdrop-blur-md border border-white/10 text-white rounded-xl md:rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2 text-sm md:text-base hover:bg-gray-800/80 hover:border-white/20 transition-all duration-300"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Post
              </motion.button>
            </div>

            {/* Right Column - Bio and User Posts */}
            <div className="md:col-span-2 space-y-8">
              {/* Bio with sleek design - Dark theme */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About Me
                </h2>
                
                {isEditing ? (
                  <textarea
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    rows={4}
                    value={editedData.bio || ''}
                    placeholder="Share a bit about yourself..."
                    onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                  />
                ) : (
                  <div className="text-gray-200 leading-relaxed backdrop-blur-sm bg-gray-800/30 p-4 rounded-xl border border-gray-600">
                    {editedData.bio ? editedData.bio : (
                      <div className="text-gray-400 italic">No bio information added yet.</div>
                    )}
                  </div>
                )}
                
                {/* Quick actions */}
                {!isEditing && (
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreatePost(true)}
                      className="hidden md:flex items-center gap-2 py-2 px-4 bg-gray-900/80 backdrop-blur-md border border-white/10 text-white rounded-xl text-sm font-medium shadow-2xl hover:bg-gray-800/80 hover:border-white/20 transition-all duration-300"
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Post
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Favorites List - Only visible to profile owner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  My Favourites
                </h2>
                
                {favoritesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-8 px-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-gray-300 text-sm">No favourite users yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Visit profiles and add users to your favourites!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                        className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-600 p-4 hover:bg-gray-800/60 transition-all duration-300 group cursor-pointer"
                        onClick={() => handleProfileClick(user._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500 to-orange-500">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.fullName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm truncate group-hover:text-yellow-300 transition-colors">
                              {user.fullName}
                            </h3>
                            <p className="text-gray-400 text-xs truncate">{user.university}</p>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                                user.role === 'moderator' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {user.role === 'admin' ? 'Admin' :
                                 user.role === 'moderator' ? 'Mod' :
                                 'Student'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* User Posts with animations - Dark theme */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 p-6 overflow-hidden relative"
              >
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="text-center py-12 px-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <p className="text-gray-300 mb-6 text-lg">You haven't created any posts yet.</p>
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0, 0, 0, 0.6)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreatePost(true)}
                        className="py-3 px-8 bg-gray-900/80 backdrop-blur-md border border-white/10 text-white rounded-xl font-medium shadow-2xl hover:bg-gray-800/80 hover:border-white/20 transition-all duration-300"
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(16px)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
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

          {/* Edit Mode Actions - Dark theme glassmorphism */}
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-700 p-5 shadow-[0_-15px_30px_rgba(0,0,0,0.3)] z-40"
            >
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-300 hidden md:block">
                  <span className="bg-gray-700/60 p-1.5 rounded-full inline-block mr-2">
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
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex-1 sm:flex-initial px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium border border-white/20 shadow-lg flex items-center justify-center gap-2"
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
      
      {/* Profile View Modal - now uses createPortal internally */}
      {selectedProfile && showProfileModal && (
        <ProfileViewModal
          userId={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}