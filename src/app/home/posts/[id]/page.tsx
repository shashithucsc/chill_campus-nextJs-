'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../../navbar/Navbar';
import Sidebar from '../../sidebar/Sidebar';
import Post from '../../components/Post';
import AnimatedBackground from '../../communities/components/AnimatedBackground';

interface PostData {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
    role: string;
  };
  content: string;
  media?: string[];
  mediaType?: 'image' | 'video' | null;
  likes: string[];
  comments: any[];
  community?: {
    _id: string;
    name: string;
    coverImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PostPage() {
  const params = useParams();
  const id = (params as Record<string,string | string[]>)?.id;
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (typeof id === 'string' && id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950">
        {/* Dark gradient background matching system theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
              style={{ 
                left: `${20 + i * 20}%`, 
                top: `${10 + i * 15}%`,
                animation: `float ${8 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
        </div>
        
        <Navbar />
        <Sidebar />
        <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700/60 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700/60 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-700/60 rounded mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950">
        {/* Dark gradient background matching system theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
              style={{ 
                left: `${20 + i * 20}%`, 
                top: `${10 + i * 15}%`,
                animation: `float ${8 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
        </div>
        
        <Navbar />
        <Sidebar />
        <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-gray-700 shadow-xl text-center"
            >
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Go Back
              </button>
              <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
              <p className="text-gray-300 mb-6">
                {error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
              </p>
              <button
                onClick={() => router.push('/home/home')}
                className="bg-gray-800/80 backdrop-blur-md border border-gray-600/50 hover:bg-gray-700/80 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go to Feed
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Dark gradient background matching system theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>

      {/* Subtle floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"
            style={{ 
              left: `${20 + i * 20}%`, 
              top: `${10 + i * 15}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}
      </div>
      
      <Navbar />
      <Sidebar />
      <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Post
              id={post._id}
              author={{
                id: post.user._id,
                name: post.user.fullName,
                avatar: post.user.avatar || '',
                role: post.user.role
              }}
              content={post.content}
              media={post.media}
              mediaType={post.mediaType}
              likes={post.likes.length}
              comments={post.comments.length}
              timestamp={post.createdAt}
              community={post.community ? {
                id: post.community._id,
                name: post.community.name,
                avatar: post.community.coverImage || ''
              } : undefined}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
