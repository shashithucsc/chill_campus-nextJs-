'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  UserIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  UserGroupIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
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
  const [postContent, setPostContent] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

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

    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/communities/${id}/posts`);
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCommunity();
      fetchPosts();
    }
  }, [id]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      const type = e.target.files[0].type.startsWith('video') ? 'video' : 'image';
      setMediaType(type);
    }
  };

  // Handle post submission
  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !media) return;

    setPostSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      if (media) {
        formData.append('media', media);
        formData.append('mediaType', mediaType || '');
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // Refresh posts
        const response = await fetch(`/api/communities/${id}/posts`);
        const data = await response.json();
        setPosts(data.posts || []);
        setPostContent('');
        setMedia(null);
        setMediaType(null);
      } else {
        console.error('Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await fetch(`/api/communities/${id}/leave`, {
        method: 'POST',
      });
      // Update the community state
      setCommunity(prev => prev ? { ...prev, isMember: false, memberCount: prev.memberCount - 1 } : null);
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      await fetch(`/api/communities/${id}/join`, {
        method: 'POST',
      });
      // Update the community state
      setCommunity(prev => prev ? { ...prev, isMember: true, memberCount: prev.memberCount + 1 } : null);
    } catch (error) {
      console.error('Error joining community:', error);
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
          {/* Create Post */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 md:p-6 mb-8 shadow-xl"
          >
            <form onSubmit={handleSubmitPost}>
              <textarea 
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                placeholder="Share something with this community..."
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              
              {media && (
                <div className="mt-2 relative">
                  {mediaType === 'image' ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-white/30">
                      <Image 
                        src={URL.createObjectURL(media)} 
                        alt="Post media preview" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-lg border border-white/30">
                      <video src={URL.createObjectURL(media)} className="h-full w-auto" />
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      setMedia(null);
                      setMediaType(null);
                    }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <label className="cursor-pointer text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden"
                      onChange={handleFileChange} 
                    />
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                </div>
                <button 
                  type="submit"
                  disabled={(!postContent.trim() && !media) || postSubmitting}
                  className={`flex items-center px-5 py-2 rounded-xl ${(!postContent.trim() && !media) || postSubmitting ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white transition-all duration-300`}
                >
                  {postSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Posts Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.15 }}
            className="space-y-6"
          >
            {loading ? (
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
              </motion.div>
            ) : (
              // Posts list
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-xl hover:bg-white/15 transition-colors duration-300"
                >
                  {/* Post header */}
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 border border-white/30 overflow-hidden">
                      <Image
                        src={post.user.avatar || "/default-avatar.png"}
                        alt={post.user.fullName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-white">{post.user.fullName}</h3>
                      <div className="text-sm text-white/60 flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(post.createdAt)}
                        <span className="mx-1">•</span>
                        <UserIcon className="h-3 w-3 mr-1" />
                        {post.user.role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Post content */}
                  <p className="text-white/90 mb-4">{post.content}</p>
                  
                  {/* Post media */}
                  {post.media && post.media.length > 0 && post.mediaType === 'image' && (
                    <div className="rounded-lg overflow-hidden mb-4 border border-white/20">
                      <Image
                        src={post.media[0]}
                        alt="Post image"
                        width={800}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  
                  {post.media && post.media.length > 0 && post.mediaType === 'video' && (
                    <div className="rounded-lg overflow-hidden mb-4 border border-white/20">
                      <video
                        src={post.media[0]}
                        controls
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {/* Post actions */}
                  <div className="flex items-center text-white/70 space-x-5 mt-2">
                    <button className="flex items-center space-x-1 hover:text-white transition-colors">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likeCount || 0}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 hover:text-white transition-colors">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span>{post.commentCount || 0}</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
