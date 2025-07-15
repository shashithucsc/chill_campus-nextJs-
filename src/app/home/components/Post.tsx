'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface Comment {
  _id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface PostProps {
  id: string;
  author: {
    id: string;
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
  // Get session directly from useSession hook
  const { data: session } = useSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // Comments state
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [contentState, setContentState] = useState(content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMedia, setEditMedia] = useState<string | File | null>(image || null);
  const [editMediaType, setEditMediaType] = useState<'image' | 'video' | null>(mediaType || null);
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  
  // Debug log for post ownership
  console.log('Post props in Post component:', { id, authorId: author?.id });
  console.log('Session user ID in Post component:', session?.user?.id);
  console.log('Is owner?', author?.id === session?.user?.id);

  // Set current user ID from session when session changes
  useEffect(() => {
    if (session?.user?.id) {
      setCurrentUserId(session.user.id);
      console.log('CurrentUserId set from session:', session.user.id);
    }
  }, [session]);

  useEffect(() => {
    // Fetch like state and comments from backend
    fetch(`/api/posts/${id}/reactions`)
      .then(res => res.json())
      .then(data => {
        setIsLiked(data.likedByCurrentUser || false);
        setLikeCount(data.likeCount || 0);
      });
    fetch(`/api/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => {
        setCommentList(data.comments || []);
      });
  }, [id]);

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(likeCount + (newLiked ? 1 : -1));
    // Persist like/unlike
    await fetch(`/api/posts/${id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: newLiked }),
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentLoading(true);
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentInput }),
    });
    if (res.ok) {
      const data = await res.json();
      setCommentList([data.comment, ...commentList]);
      setCommentInput('');
    }
    setCommentLoading(false);
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
    const formData = new FormData();
    formData.append('content', editContent);
    if (editMedia && typeof editMedia !== 'string') {
      formData.append('media', editMedia);
      formData.append('mediaType', editMediaType || '');
    }
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setIsEditing(false);
      setContentState(data.post.content);
      // If media was updated, update editMedia and editMediaType from backend response
      if (data.post.media && data.post.media.length > 0) {
        setEditMedia(data.post.media[0]);
        setEditMediaType(data.post.mediaType);
      } else {
        setEditMedia(null);
        setEditMediaType(null);
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 mb-4 hover:bg-white/10 transition-all duration-300">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 overflow-hidden">
              <Image
                src={author.avatar && author.avatar !== '' ? author.avatar : '/default-avatar.png'}
                alt={author.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Link href={`/home/profile/${author.name}`} className="font-semibold text-white hover:text-blue-300 transition-colors text-lg">
                  {author.name}
                </Link>
                {community && (
                  <>
                    <span className="text-white/60">in</span>
                    <Link href={`/home/communities/${community.name}`} className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                      {community.name}
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-white/70">
                {author.role} • {timestamp}
              </p>
            </div>
          </div>
          {/* Owner controls: 3-dots menu */}
          {session?.user?.id && author && author.id === session.user.id && (
            <div className="relative">
              <button
                className="text-white/60 hover:text-white/90 focus:outline-none transition-colors"
                onClick={() => setShowMenu((v) => !v)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-10">
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/20 transition-colors"
                  >Edit</button>
                  <button
                    onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/20 transition-colors"
                  >Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-6">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white/60"
              rows={4}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            {/* Image/video edit */}
            <label className="block text-white font-medium text-lg">
              Change image/video:
              <input
                type="file"
                accept="image/*,video/*"
                className="block mt-2 text-white/90"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setEditMedia(e.target.files[0]);
                    setEditMediaType(e.target.files[0].type.startsWith('video') ? 'video' : 'image');
                  }
                }}
              />
            </label>
            {editMedia && typeof editMedia === 'string' && (
              <div className="mt-2">
                {editMediaType === 'image' ? (
                  <Image src={editMedia} alt="Edit post image" width={400} height={300} className="rounded" />
                ) : (
                  <video src={editMedia} controls className="rounded w-full max-h-64" />
                )}
              </div>
            )}
            {editMedia && typeof editMedia !== 'string' && (
              <div className="mt-2">
                {editMediaType === 'image' ? (
                  <img src={URL.createObjectURL(editMedia)} alt="Edit post image" className="rounded w-full max-h-64" />
                ) : (
                  <video src={URL.createObjectURL(editMedia)} controls className="rounded w-full max-h-64" />
                )}
              </div>
            )}
            <div className="flex space-x-3">
              <button type="button" onClick={handleEdit} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">Save</button>
              <button type="button" onClick={() => { setIsEditing(false); setEditContent(contentState); setEditMedia(image || null); setEditMediaType(mediaType || null); }} className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white text-lg whitespace-pre-wrap leading-relaxed">{contentState}</p>
            {/* Show all images if mediaType is image and media array exists */}
            {mediaType === 'image' && media && media.length > 0 && media.map((img, idx) =>
              (typeof img === 'string' && (img.startsWith('/') || img.startsWith('http')) ? (
                <div key={idx} className="mt-4 rounded-lg overflow-hidden relative">
                  <Image
                    src={img}
                    alt={`Post image ${idx+1}`}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                  
                </div>
              ) : null)
            )}
            {/* Show video if mediaType is video and media exists */}
            {mediaType === 'video' && media && media.length > 0 && (
              <div className="mt-4 rounded-lg overflow-hidden relative">
                <video src={media[0]} controls className="w-full max-h-96 rounded" />
              
              </div>
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
      <div className="px-6 py-4 border-t border-white/20">
        <div className="flex items-center space-x-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-blue-400' : 'text-white/70 hover:text-white'
            }`}
          >
            <svg
              className="h-6 w-6"
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
            <span className="font-medium">{likeCount}</span>
          </button>
          <button
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setShowComments((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">{commentList.length}</span>
          </button>
          {/* ...existing share button... */}
        </div>
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4">
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                className="flex-1 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                disabled={commentLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                disabled={commentLoading || !commentInput.trim()}
              >
                {commentLoading ? '...' : 'Post'}
              </button>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {commentList.length === 0 ? (
                <div className="text-white/60 text-sm">No comments yet.</div>
              ) : (
                commentList.map((c) => (
                  <div key={c._id} className="flex items-start space-x-3">
                    <Image
                      src={c.user.avatar || '/default-avatar.png'}
                      alt={c.user.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <span className="font-medium text-white text-sm">{c.user.name}</span>
                      <span className="ml-2 text-xs text-white/60">{new Date(c.createdAt).toLocaleString()}</span>
                      <div className="text-white/90 text-sm mt-1">{c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8 w-full max-w-md relative z-10">
            <h3 className="text-2xl font-semibold mb-6 text-white">Delete Post?</h3>
            <p className="mb-8 text-white/80 text-lg">Are you sure you want to delete this post?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-all">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}