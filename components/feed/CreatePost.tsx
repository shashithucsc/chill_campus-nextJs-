'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface CreatePostProps {
  onCreatePost: (content: string) => Promise<boolean>;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const success = await onCreatePost(content);
    if (success) {
      setContent('');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <form id="create-post-section" onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <img
            src={session.user?.image || '/default-avatar.png'}
            alt={session.user?.name || 'User'}
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
} 