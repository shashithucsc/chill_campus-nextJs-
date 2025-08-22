'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/app/home/navbar/Navbar';
import Sidebar from '@/app/home/sidebar/Sidebar';
import PostComponent from '@/app/home/components/Post';
import { toast } from 'react-hot-toast';

interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

interface PostData {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatar: string;
    role: string;
  };
  content: string;
  media?: string[];
  mediaType?: 'image' | 'video' | null;
  createdAt: string;
  likes?: string[];
  comments?: any[];
  community?: {
    _id: string;
    name: string;
    avatar: string;
  };
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postId = params?.id as string;

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;

      try {
        setLoading(true);
        console.log('🔄 Fetching post:', postId);
        
        const res = await fetch(`/api/posts/${postId}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch post: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📊 Post data received:', data);
        
        if (!data.post) {
          throw new Error('Invalid post data received');
        }
        
        setPost(data.post);
      } catch (err) {
        console.error('❌ Error fetching post:', err);
        const errorMessage = (err as Error).message || 'Failed to load post';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Dark gradient background matching home theme */}
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

      <Navbar />
      <Sidebar />
      
      <div className="pl-0 md:pl-64 pt-16 md:pt-24 relative z-10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </motion.button>

          {/* Post Content */}
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <span className="text-gray-300 font-medium text-lg">Loading post...</span>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-8"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/60 backdrop-blur-sm border border-red-400 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Post Not Found</h3>
              <p className="text-red-400 text-md mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/home/home')}
                className="px-6 py-3 bg-gray-800/80 backdrop-blur-md text-white text-lg rounded-xl font-semibold shadow-xl hover:bg-gray-700/80 transition-all duration-300 border border-gray-600"
              >
                Return to Home
              </motion.button>
            </motion.div>
          ) : post ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
            >
              <PostComponent
                id={post._id}
                author={{
                  id: post.user?._id || '',
                  name: post.user?.fullName || 'Unknown',
                  avatar: post.user?.avatar || '/default-avatar.png',
                  role: post.user?.role || '',
                }}
                content={post.content}
                image={post.media && post.media.length > 0 ? post.media[0] : undefined}
                media={post.media}
                mediaType={post.mediaType}
                likes={post.likes?.length || 0}
                comments={post.comments?.length || 0}
                timestamp={new Date(post.createdAt).toLocaleString()}
                community={post.community ? {
                  id: post.community._id || '',
                  name: post.community.name || '',
                  avatar: post.community.avatar || '/images/default-community-banner.jpg'
                } : undefined}
              />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-3">No Post Data</h3>
              <p className="text-gray-400 text-md mb-6">Unable to display the post</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/home/home')}
                className="px-6 py-3 bg-gray-800/80 backdrop-blur-md text-white text-lg rounded-xl font-semibold shadow-xl hover:bg-gray-700/80 transition-all duration-300 border border-gray-600"
              >
                Return to Home
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
