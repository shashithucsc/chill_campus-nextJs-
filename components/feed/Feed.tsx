'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    university: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
      university: string;
    };
    createdAt: string;
  }>;
  tags: string[];
  createdAt: string;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching posts');
      }

      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No posts yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <div key={post._id} className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">
                  {post.author.name}
                </p>
                <span className="text-sm text-gray-500">•</span>
                <p className="text-sm text-gray-500">
                  {post.author.university}
                </p>
              </div>
              
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                {post.content}
              </p>
              
              {post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 