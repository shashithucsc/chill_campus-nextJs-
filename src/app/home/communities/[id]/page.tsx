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
  DocumentTextIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import Post from '../../components/Post';
import CreateCommunityPostModal from '../components/CreateCommunityPostModal';
import EditCommunityModal from '../components/EditCommunityModal';
import DualMessaging from '../../components/DualMessaging';
import AnimatedBackground from '../components/AnimatedBackground';

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
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  category: string;
  visibility: 'Public' | 'Private';
  tags: string[];
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
  const params = useParams();
  const id = params ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const { data: session } = useSession();
  
  // States
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');

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
  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${id}`);
      const data = await response.json();
      setCommunity(data.community);
    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCommunity();
      fetchPosts();
    }
  }, [id]);

  // Early return for invalid ID
  if (!id) {
    return <div>Invalid community ID</div>;
  }
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

  // Handle community update
  const handleCommunityUpdate = (updatedCommunity: {
    _id: string;
    name: string;
    description: string;
    category: string;
    visibility: 'Public' | 'Private';
    coverImage: string;
    tags: string[];
  }) => {
    if (community) {
      setCommunity({
        ...community,
        ...updatedCommunity
      });
      setMessage({ text: 'Community updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Check if current user is the creator
  const isCreator = session?.user?.id === community?.createdBy?._id;

  const handleLeaveCommunity = async () => {
    // Check if this is the last member
    if (community && community.memberCount === 1) {
      setShowDeleteWarning(true);
      return;
    }

    await performLeaveCommunity();
  };

  const performLeaveCommunity = async () => {
    setJoinLoading(true);
    try {
      const response = await fetch(`/api/communities/${id}/leave`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if community was deleted
        if (data.deleted) {
          setMessage({ text: 'Community has been deleted as you were the last member.', type: 'success' });
          // Redirect to communities page after a delay
          setTimeout(() => {
            window.location.href = '/home/communities';
          }, 3000);
        } else {
          // Refetch community data to get updated membership status
          await fetchCommunity();
          setMessage({ text: 'Successfully left the community!', type: 'success' });
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to leave community:', errorData.error);
        setMessage({ text: 'Failed to leave community. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error leaving community:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setJoinLoading(false);
      setShowDeleteWarning(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleJoinCommunity = async () => {
    setJoinLoading(true);
    try {
      const response = await fetch(`/api/communities/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refetch community data to get updated membership status
        await fetchCommunity();
        setMessage({ text: 'Successfully joined the community!', type: 'success' });
      } else {
        const errorData = await response.json();
        console.error('Failed to join community:', errorData.message);
        setMessage({ text: 'Failed to join community. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error joining community:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setJoinLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
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
    <div className="min-h-screen"
         style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
      {/* Animated background elements */}
      <AnimatedBackground 
        particleCount={8} 
        glassParticleCount={12}
        className="fixed inset-0 overflow-hidden pointer-events-none"
      />

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
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-blue-100 bg-clip-text text-transparent"
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
                    className="flex items-center gap-3"
                  >
                    {/* Edit Button - Only for creators */}
                    {isCreator && (
                      <button
                        onClick={() => setShowEditCommunity(true)}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg border border-white/20 transition-all duration-300 backdrop-blur-sm hover:opacity-90"
                        style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                    )}

                    {/* Join/Leave Button */}
                    {community.isMember ? (
                      <button
                        onClick={handleLeaveCommunity}
                        disabled={joinLoading}
                        className={`px-4 py-2 backdrop-blur-md text-white rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          community.memberCount === 1
                            ? 'bg-red-600/20 hover:bg-red-600/30 border-red-400/30 hover:border-red-400/50'
                            : 'bg-white/10 hover:bg-white/20 border-white/20'
                        }`}
                      >
                        {joinLoading 
                          ? (community.memberCount === 1 ? 'Deleting...' : 'Leaving...') 
                          : (community.memberCount === 1 ? 'Delete Community' : 'Leave Community')
                        }
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinCommunity}
                        disabled={joinLoading}
                        className="px-4 py-2 text-white rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                        style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
                      >
                        {joinLoading ? 'Joining...' : 'Join Community'}
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-64 md:h-80 w-full animate-pulse border border-white/10"
               style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
            <div className="max-w-6xl mx-auto h-full flex items-end p-8">
              <div className="w-full">
                <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="h-4 w-80 mt-3 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        {community?.isMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
          >
            <div className="flex space-x-1 bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'posts'
                    ? 'text-white shadow-lg border border-white/20'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
                style={activeTab === 'posts' ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span className="font-medium">Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'chat'
                    ? 'text-white shadow-lg border border-white/20'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
                style={activeTab === 'chat' ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <span className="font-medium">Chat</span>
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Tab Content */}
        {activeTab === 'posts' ? (
          // Post Creation and Feed
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
                <div className="w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center" 
                     style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}>
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
                    className="mt-4 px-6 py-3 text-white rounded-xl font-medium shadow-lg border border-white/20"
                    style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
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
        ) : (
          // Chat Tab Content
          <div className="h-[calc(100vh-200px)]">
            <DualMessaging 
              community={community ? {
                _id: community._id,
                name: community.name,
                banner: community.coverImage || '',
                description: community.description,
                memberCount: community.memberCount || 0
              } : undefined}
            />
          </div>
        )}

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

        {/* Delete Community Warning Modal */}
        <AnimatePresence>
          {showDeleteWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/20 border border-red-400/30">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Delete Community?
                  </h3>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    You are the last member of <span className="font-semibold text-blue-300">"{community?.name}"</span>. 
                    Leaving will permanently delete this community and all its posts. This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteWarning(false)}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-white/20 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={performLeaveCommunity}
                      disabled={joinLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joinLoading ? 'Deleting...' : 'Delete Community'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed top-20 right-4 z-50 max-w-sm"
            >
              <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
                message.type === 'success'
                  ? 'bg-green-500/90 border-green-400/50 text-white'
                  : 'bg-red-500/90 border-red-400/50 text-white'
              }`}>
                <div className="flex items-center">
                  <span className="mr-2 text-lg">
                    {message.type === 'success' ? '✅' : '❌'}
                  </span>
                  <p className="font-medium">{message.text}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Community Modal */}
        {community && (
          <EditCommunityModal
            isOpen={showEditCommunity}
            onClose={() => setShowEditCommunity(false)}
            community={{
              _id: community._id,
              name: community.name,
              description: community.description,
              coverImage: community.coverImage,
              category: community.category,
              visibility: community.visibility,
              tags: community.tags
            }}
            onUpdate={handleCommunityUpdate}
          />
        )}
      </div>
    </div>
  );
}
