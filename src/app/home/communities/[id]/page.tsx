'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  UserIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import Post from '../../components/Post';
import CreateCommunityPostModal from '../components/CreateCommunityPostModal';

// Utility function to format date
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};
import Link from 'next/link';

// Types
interface Community {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
}

interface Post {
  _id: string;
  content: string;
  user: {
    _id: string;
    fullName: string;
    avatar: string;
    role: string;
  };
  createdAt: string;
  media?: string[];
  mediaType?: 'image' | 'video' | null;
  likeCount?: number;
  commentCount?: number;
}

export default function CommunityPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  
  // States
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Simple animation variants without transitions
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Stagger container
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`/api/communities/${id}`);
        const data = await response.json();
        setCommunity(data.community);
      } catch (error) {
        console.error('Error fetching community:', error);
      }
    };

    if (id) {
      fetchCommunity();
      fetchPosts();
    }
  }, [id]);
  // Fetch posts function
  const fetchPosts = async () => {
    setPostLoading(true);
    try {
      const response = await fetch(`/api/communities/${id}/posts`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostLoading(false);
    }
  };

  // Handle post creation
  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleLeaveCommunity = async () => {
    setJoinLoading(true);
    try {
      await fetch(`/api/communities/${id}/leave`, {
        method: 'POST',
      });
      // Update the community state
      setCommunity(prev => prev ? { ...prev, isMember: false, memberCount: prev.memberCount - 1 } : null);
    } catch (error) {
      console.error('Error leaving community:', error);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    setJoinLoading(true);
    try {
      await fetch(`/api/communities/${id}/join`, {
        method: 'POST',
      });
      // Update the community state
      setCommunity(prev => prev ? { ...prev, isMember: true, memberCount: prev.memberCount + 1 } : null);
    } catch (error) {
      console.error('Error joining community:', error);
    } finally {
      setJoinLoading(false);
    }
  };

  // Format date 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
              ease: "easeInOut",
              delay: Math.random() * 3
            }}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Navbar />
      <Sidebar />
      
      {/* Main Content */}
      <div className="pt-16 relative z-10">
        {/* Community Header */}
        {community ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
              <Image
                src={community.coverImage || "/images/default-community-banner.jpg"}
                alt={community.name}
                fill
                className="object-cover"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90"></div>
            </div>

            {/* Community Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 pb-8 md:pb-10">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-1 flex items-center"
                    >
                      <Link href="/home/communities" className="text-white/80 hover:text-white flex items-center mr-3 mb-2">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">Communities</span>
                      </Link>
                    </motion.div>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
                    >
                      {community.name}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/80 mt-2 max-w-2xl"
                    >
                      {community.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center mt-4 text-white/70 text-sm"
                    >
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      <span>{community.memberCount} members</span>
                      <span className="mx-2">•</span>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Created {formatDate(community.createdAt)}</span>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {community.isMember ? (
                      <button
                        onClick={handleLeaveCommunity}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20 transition-all duration-300"
                      >
                        Leave Community
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinCommunity}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300"
                      >
                        Join Community
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-64 md:h-80 w-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 animate-pulse">
            <div className="max-w-6xl mx-auto h-full flex items-end p-8">
              <div className="w-full">
                <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-4 w-80 mt-3 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Post Creation and Feed */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Create Post Button */}
          {community?.isMember && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-8 shadow-xl cursor-pointer hover:bg-white/15 transition-all duration-300"
              onClick={() => setShowCreatePost(true)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-lg font-medium">Share something with the community</p>
                  <p className="text-white/60 text-sm">What's happening in {community?.name}?</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Posts Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            className="space-y-6"
          >
            {postLoading ? (
              // Loading state
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-white/20"></div>
                    <div className="ml-3">
                      <div className="h-4 w-32 bg-white/20 rounded"></div>
                      <div className="h-3 w-24 mt-2 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                </div>
              ))
            ) : posts.length === 0 ? (
              // No posts state
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <ChatBubbleLeftIcon className="h-10 w-10 text-white/30" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No posts yet</h3>
                <p className="text-white/70">
                  Be the first to share something with this community!
                </p>
                {community?.isMember && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreatePost(true)}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                  >
                    Create First Post
                  </motion.button>
                )}
              </motion.div>
            ) : (
              // Posts list using Post component
              posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Post
                    id={post._id}
                    author={{
                      id: post.user._id,
                      name: post.user.fullName,
                      avatar: post.user.avatar || '/default-avatar.png',
                      role: post.user.role
                    }}
                    content={post.content}
                    media={post.media}
                    mediaType={post.mediaType}
                    likes={post.likeCount || 0}
                    comments={post.commentCount || 0}
                    timestamp={formatDate(post.createdAt)}
                    community={{
                      name: community?.name || '',
                      avatar: community?.coverImage || ''
                    }}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Create Community Post Modal */}
        {showCreatePost && community && (
          <CreateCommunityPostModal
            open={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
            communityId={community._id}
            communityName={community.name}
          />
        )}
      </div>
    </div>
  );
}
