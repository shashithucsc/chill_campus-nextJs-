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
  const { id } = useParams();
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

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64 p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2 mb-4"></div>
                  <div className="h-32 bg-white/20 rounded mb-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
        <AnimatedBackground />
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64 p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center"
              >
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-white/70 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Go Back
                </button>
                <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
                <p className="text-white/70 mb-6">
                  {error || 'The post you\'re looking for doesn\'t exist or has been removed.'}
                </p>
                <button
                  onClick={() => router.push('/home/home')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Go to Feed
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <AnimatedBackground />
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => router.back()}
                className="flex items-center text-white/70 hover:text-white transition-colors"
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
                  name: post.community.name,
                  avatar: post.community.coverImage || ''
                } : undefined}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
