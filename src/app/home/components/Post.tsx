'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PostProps {
  id: string;
  author: {
    id: string; // <-- add id here
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  image?: string | File;
  media?: string[];
  mediaType?: 'image' | 'video' | null;
  likes: number;
  comments: number;
  timestamp: string;
  community?: {
    name: string;
    avatar: string;
  };
}

export default function Post({
  id,
  author,
  content,
  image,
  media,
  mediaType,
  likes,
  comments,
  timestamp,
  community,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showMenu, setShowMenu] = useState(false);
  const [contentState, setContentState] = useState(content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Fetch current user id from /api/user
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setCurrentUserId(data.user?.id || null));
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  const handleEdit = async () => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) {
      setIsEditing(false);
      setContentState(editContent);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={author.avatar}
                alt={author.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Link href={`/home/profile/${author.name}`} className="font-medium text-gray-900 hover:underline">
                  {author.name}
                </Link>
                {community && (
                  <>
                    <span className="text-gray-500">in</span>
                    <Link href={`/home/communities/${community.name}`} className="font-medium text-blue-600 hover:underline">
                      {community.name}
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {author.role} • {timestamp}
              </p>
            </div>
          </div>
          {/* Owner controls: 3-dots menu */}
          {currentUserId && author && author.id === currentUserId && (
            <div className="relative">
              <button
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowMenu((v) => !v)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10">
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Edit</button>
                  <button
                    onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <div className="flex space-x-2">
              <button type="button" onClick={handleEdit} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
              <button type="button" onClick={() => { setIsEditing(false); setEditContent(contentState); }} className="bg-gray-300 text-gray-800 px-3 py-1 rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-900 whitespace-pre-wrap">{contentState}</p>
            {/* Show all images if mediaType is image and media array exists */}
            {mediaType === 'image' && media && media.length > 0 && media.map((img, idx) =>
              (typeof img === 'string' && (img.startsWith('/') || img.startsWith('http')) ? (
                <div key={idx} className="mt-4 rounded-lg overflow-hidden">
                  <Image
                    src={img}
                    alt={`Post image ${idx+1}`}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : null)
            )}
            {image && typeof image !== 'string' && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Post image"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg
              className="h-5 w-5"
              fill={isLiked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{comments}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative z-10">
            <h3 className="text-lg font-semibold mb-4">Delete Post?</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}