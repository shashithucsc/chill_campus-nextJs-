'use client';

import { Post } from '@/types';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { DEFAULT_AVATAR } from '@/constants';

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={post.author.image || DEFAULT_AVATAR}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
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
          
          <div className="mt-4 flex items-center space-x-6">
            <button 
              onClick={onLike}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
            >
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
  );
} 