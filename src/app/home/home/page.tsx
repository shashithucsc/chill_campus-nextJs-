'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import ChatSidebar from '../sidebar/ChatSidebar';
import Post from '../components/Post';
import CreatePostModal from '../components/CreatePostModal';
import MessageInbox from '../components/MessageInbox';
import DirectMessageUI from '../components/DirectMessageUI';
import NewMessageModal from '../components/NewMessageModal';
import { useSidebar } from '../context/SidebarContext';
import { useChat } from '../context/ChatContext';
import { 
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isCollapsed } = useSidebar();
  const { openChat, setSelectedConversation } = useChat();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  // Messaging states
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      console.log('🔄 Fetching posts...');
      const res = await fetch('/api/posts');
      console.log('📡 Posts API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📊 Posts data received:', data);
      console.log('📰 Number of posts:', data.posts?.length || 0);
      
      setPosts(data.posts || []);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('🚀 HomePage useEffect triggered');
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  // Messaging handlers
  const handleProfileClick = (userId: string) => {
    if (userId) {
      // Open the chat sidebar and set the selected conversation
      setSelectedConversation(userId);
      openChat();
      
      // Keep existing mobile functionality for backward compatibility
      if (isMobile) {
        setSelectedRecipientId(userId);
        setShowMessaging(true);
      }
    }
  };

  const handleConversationSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    if (isMobile) {
      setShowMessaging(true);
    }
  };

  const handleNewConversation = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    setShowMessaging(true);
    setShowNewMessageModal(false);
  };

  const handleBackToFeed = () => {
    if (isMobile) {
      setShowMessaging(false);
      setSelectedRecipientId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Dark gradient background matching search page theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>

      {/* Subtle floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
            style={{ 
              left: `${15 + i * 15}%`, 
              top: `${5 + i * 12}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}
      </div>

      <Navbar onCreatePost={() => setIsCreatePostOpen(true)} />
      <Sidebar />
      <ChatSidebar />
      
      {/* Mobile Messaging Overlay */}
      {isMobile && showMessaging && selectedRecipientId && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-0 z-50 bg-gray-950"
        >
          <DirectMessageUI
            recipientId={selectedRecipientId}
            onBack={handleBackToFeed}
          />
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome to Your Feed
            </h1>
            <p className="text-lg text-gray-300">Stay connected with your university community</p>
          </motion.div>

          {/* Quick Create Post Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ y: -2, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)" }}
            className="mb-8 p-6 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-800/60"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-lg">What's on your mind?</p>
                <p className="text-gray-400 text-sm mt-1">Share your thoughts with the community</p>
              </div>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
            id="posts-feed"
          >
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <span className="text-gray-300 font-medium text-lg">Loading your feed...</span>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No posts yet</h3>
                <p className="text-gray-400 text-lg mb-6">Be the first to share something with your community!</p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-6 py-3 bg-gray-800/80 backdrop-blur-md text-white text-lg rounded-xl font-semibold shadow-xl hover:bg-gray-700/80 transition-all duration-300 border border-gray-600"
                >
                  Create Your First Post
                </motion.button>
              </motion.div>
            ) : (
              posts.map((post, index) => {
                if (index === 0) {
                  console.log('📋 Rendering posts, count:', posts.length);
                  console.log('📋 Posts array:', posts);
                }
                return (
                <motion.div
                  key={post._id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -3, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)" }}
                  className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 overflow-hidden transition-all duration-300 hover:bg-gray-800/60"
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
                    community={post.community ? {
                      id: post.community._id || '',
                      name: post.community.name || '',
                      avatar: post.community.avatar || '/images/default-community-banner.jpg'
                    } : undefined}
                    onProfileClick={handleProfileClick}
                  />
                </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>

      {/* Desktop Messaging Sidebar */}
      {!isMobile && (
        <AnimatePresence>
          {showMessaging && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed right-0 top-16 bottom-0 w-96 bg-gray-900/40 backdrop-blur-sm border-l border-gray-700 z-40"
            >
              {selectedRecipientId ? (
                <DirectMessageUI
                  recipientId={selectedRecipientId}
                  onBack={() => {
                    setShowMessaging(false);
                    setSelectedRecipientId(null);
                  }}
                />
              ) : (
                <MessageInbox
                  onConversationSelect={handleConversationSelect}
                  onNewMessage={() => setShowNewMessageModal(true)}
                  onClose={() => setShowMessaging(false)}
                  selectedConversationId={selectedRecipientId || undefined}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Messaging Toggle Button */}
      {!isMobile && !showMessaging && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMessaging(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gray-800/80 backdrop-blur-md text-white rounded-full shadow-xl flex items-center justify-center z-30 transition-all border border-gray-600 hover:bg-gray-700/80"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </motion.button>
      )}

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onConversationStart={handleNewConversation}
      />

      {/* Create Post Modal with blurred background posts */}
      <CreatePostModal 
        open={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onPostCreated={handlePostCreated}
      >
        {/* Pass the posts feed as children to show in blurred background */}
        <div className="min-h-screen pt-16 pl-0 md:pl-64">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {/* Welcome Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome to Your Feed
              </h1>
              <p className="text-lg text-gray-300">Stay connected with your university community</p>
            </div>

            {/* Quick Create Post Card */}
            <div className="mb-8 p-6 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">What's on your mind?</p>
                  <p className="text-gray-400 text-sm mt-1">Share your thoughts with the community</p>
                </div>
              </div>
            </div>

            {/* Posts Feed for background */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
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