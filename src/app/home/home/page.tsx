'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as any
      }
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95"></div>
        
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
                duration: 6,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1] as any,
                delay: Math.random() * 3
              }}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* Glass particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <Navbar onCreatePost={() => setIsCreatePostOpen(true)} />
      <Sidebar />
      
      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pt-16 pl-64"
      >
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
              Welcome to Your Feed
            </h1>
            <p className="text-xl text-white/80">Stay connected with your university community</p>
          </motion.div>

          {/* Quick Create Post Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -2, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)" }}
            className="mb-10 p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 cursor-pointer transition-all duration-300"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+</span>
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-xl font-medium">What's on your mind?</p>
                <p className="text-white/60 text-sm mt-1">Share your thoughts with the community</p>
              </div>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
            id="posts-feed"
          >
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center space-x-4">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-white/90 font-medium text-xl">Loading your feed...</span>
                </div>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
                  <span className="text-5xl">📝</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No posts yet</h3>
                <p className="text-white/70 text-lg mb-8">Be the first to share something with your community!</p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg rounded-xl font-semibold shadow-2xl hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  Create Your First Post
                </motion.button>
              </motion.div>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -6, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)" }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:border-white/30"
                >
                  <Post
                    id={post._id}
                    author={{
                      id: post.user?._id || post.user?.id || '',
                      name: post.user?.fullName || 'Unknown',
                      avatar: post.user?.avatar && post.user?.avatar !== '' ? post.user.avatar : '/default-avatar.png',
                      role: post.user?.role || '',
                    }}
                    content={post.content}
                    image={post.media && post.media.length > 0 ? (post.media[0].startsWith('/') ? post.media[0] : `/uploads/${post.media[0]}`) : undefined}
                    media={post.media}
                    mediaType={post.mediaType}
                    likes={0}
                    comments={0}
                    timestamp={new Date(post.createdAt).toLocaleString()}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </motion.main>

      {/* Create Post Modal with blurred background posts */}
      <CreatePostModal 
        open={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onPostCreated={handlePostCreated}
      >
        {/* Pass the posts feed as children to show in blurred background */}
        <div className="min-h-screen pt-16 pl-64">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
                Welcome to Your Feed
              </h1>
              <p className="text-xl text-white/80">Stay connected with your university community</p>
            </div>

            {/* Quick Create Post Card */}
            <div className="mb-10 p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">+</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-xl font-medium">What's on your mind?</p>
                  <p className="text-white/60 text-sm mt-1">Share your thoughts with the community</p>
                </div>
              </div>
            </div>

            {/* Posts Feed for background */}
            <div className="space-y-10">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                >
                  <Post
                    id={post._id}
                    author={{
                      id: post.user?._id || post.user?.id || '',
                      name: post.user?.fullName || 'Unknown',
                      avatar: post.user?.avatar && post.user?.avatar !== '' ? post.user.avatar : '/default-avatar.png',
                      role: post.user?.role || '',
                    }}
                    content={post.content}
                    image={post.media && post.media.length > 0 ? (post.media[0].startsWith('/') ? post.media[0] : `/uploads/${post.media[0]}`) : undefined}
                    media={post.media}
                    mediaType={post.mediaType}
                    likes={0}
                    comments={0}
                    timestamp={new Date(post.createdAt).toLocaleString()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CreatePostModal>
    </div>
  );
}