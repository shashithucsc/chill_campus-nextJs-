'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Image, Video, Link as LinkIcon, Smile } from 'lucide-react';

const CreatePost = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement post creation
      console.log('Creating post:', content);
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <img
            src={user?.profilePicture || '/default-avatar.png'}
            alt="Profile"
            className="h-10 w-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="What's on your mind?"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Video className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 