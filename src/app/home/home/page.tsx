'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Post from '../components/Post';
import { 
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

function CreatePostModal({ open, onClose, onPostCreated }: { open: boolean; onClose: () => void; onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      const type = e.target.files[0].type.startsWith('video') ? 'video' : 'image';
      setMediaType(type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        formData.append('media', media);
        formData.append('mediaType', mediaType || '');
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
        setLoading(false);
        return;
      }
      setContent('');
      setMedia(null);
      setMediaType(null);
      setLoading(false);
      onPostCreated();
      onClose();
    } catch (err) {
      setError('Failed to create post');
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
        aria-hidden="true" 
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100/20 p-8 w-full max-w-md relative pointer-events-auto"
        >
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.button>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Post
            </h2>
            <p className="text-gray-500 text-sm mt-1">Share what's on your mind with your community</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                className="w-full border-2 border-blue-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 text-gray-800 placeholder-gray-400 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
                rows={4}
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
                required={!media}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-300 transition-colors bg-blue-50/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <PhotoIcon className="w-5 h-5 text-blue-500" />
                    <VideoCameraIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Add photo or video</span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>
              
              {media && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-50 border border-green-200 rounded-xl"
                >
                  <p className="text-sm text-green-700 font-medium">
                    📎 {media.name} ({mediaType}) ready to upload
                  </p>
                </motion.div>
              )}
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="text-red-600 text-sm font-medium">{error}</div>
              </motion.div>
            )}
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Share Post</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1] as any,
                delay: Math.random() * 2
              }}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
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
      <CreatePostModal 
        open={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onPostCreated={handlePostCreated} 
      />
      
      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 pt-16 pl-64"
      >
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Welcome to Your Feed
            </h1>
            <p className="text-gray-600">Stay connected with your university community</p>
          </motion.div>

          {/* Quick Create Post Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -2, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)" }}
            className="mb-8 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/20 cursor-pointer"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-lg">What's on your mind?</p>
              </div>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center space-x-3">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Loading your feed...</span>
                </div>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share something with your community!</p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)" }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/20 overflow-hidden transition-all duration-300"
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
    </div>
  );
}