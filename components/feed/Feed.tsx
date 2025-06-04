'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

// Temporary mock data
const mockPosts = [
  {
    id: 1,
    author: {
      name: 'John Doe',
      university: 'University of Moratuwa',
      profilePicture: '/default-avatar.png',
    },
    content: 'Just finished an amazing hackathon! 🚀 #TechLife #Hackathon2024',
    image: '/post1.jpg',
    likes: 42,
    comments: 12,
    shares: 5,
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    author: {
      name: 'Jane Smith',
      university: 'University of Colombo',
      profilePicture: '/default-avatar.png',
    },
    content: 'Looking for team members for the upcoming inter-university debate competition. DM if interested! #Debate #TeamUp',
    likes: 28,
    comments: 8,
    shares: 3,
    timestamp: '4 hours ago',
  },
];

const Feed = () => {
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="divide-y divide-gray-200">
      {posts.map((post) => (
        <article key={post.id} className="p-4">
          <div className="flex space-x-3">
            <Image
              src={post.author.profilePicture}
              alt={post.author.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {post.author.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {post.author.university} • {post.timestamp}
                  </p>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="mt-2 text-gray-900">{post.content}</p>
              {post.image && (
                <div className="mt-3">
                  <Image
                    src={post.image}
                    alt="Post image"
                    width={600}
                    height={400}
                    className="rounded-lg"
                  />
                </div>
              )}
              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                >
                  <Heart className="h-5 w-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                  <Share2 className="h-5 w-5" />
                  <span>{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Feed; 