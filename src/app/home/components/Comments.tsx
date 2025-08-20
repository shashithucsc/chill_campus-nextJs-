'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import CommentItem, { ReactionType } from './CommentItem';

interface Comment {
  _id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  reactions: Array<{
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    type: ReactionType;
    createdAt: string;
  }>;
  replies: Array<{
    _id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    reactions: Array<{
      user: {
        id: string;
        name: string;
        avatar: string;
      };
      type: ReactionType;
      createdAt: string;
    }>;
    createdAt: string;
  }>;
  replyCount: number;
  createdAt: string;
}

interface CommentsProps {
  postId: string;
  isVisible: boolean;
  onCommentUpdate?: () => void;
  onStartChat?: (userId: string) => void;
}

export default function Comments({ postId, isVisible, onCommentUpdate, onStartChat }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    if (!isVisible) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, isVisible]);

  // Add new comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Comment submit triggered:', { commentInput, submitting });
    
    if (!commentInput.trim() || submitting) {
      console.log('Comment submit blocked:', { hasContent: !!commentInput.trim(), submitting });
      return;
    }

    setSubmitting(true);
    console.log('Submitting comment to post:', postId);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentInput.trim() })
      });

      console.log('Comment API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comment added successfully:', data);
        setComments(prev => [data.comment, ...prev]);
        setCommentInput('');
        // Notify parent component that comments have been updated
        onCommentUpdate?.();
      } else {
        const errorData = await response.json();
        console.error('Comment API error:', errorData);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Add reply to comment
  const handleReply = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, data.reply],
                replyCount: comment.replyCount + 1
              }
            : comment
        ));
        // Notify parent component that comments have been updated (reply counts as comment update)
        onCommentUpdate?.();
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Handle reactions
  const handleReaction = async (commentId: string, type: ReactionType, replyId?: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, replyId })
      });

      if (response.ok) {
        const data = await response.json();
        
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            if (replyId) {
              // Update reply reactions
              return {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply._id === replyId
                    ? { ...reply, reactions: data.reactions.map((r: any) => ({ ...r, user: { id: r.user.id } })) }
                    : reply
                )
              };
            } else {
              // Update comment reactions
              return {
                ...comment,
                reactions: data.reactions.map((r: any) => ({ ...r, user: { id: r.user.id } }))
              };
            }
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/10 pt-4 mt-4"
    >
      {/* Comment input */}
      <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mb-6">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
          <Image
            src={session?.user?.image || '/default-avatar.png'}
            alt="Your avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-white placeholder-white/50 px-4 py-3 focus:outline-none"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!commentInput.trim() || submitting}
            className={`m-1 px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
              !commentInput.trim() || submitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'text-white shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20'
            }`}
            style={!commentInput.trim() || submitting ? undefined : {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Sending...</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4" />
                <span className="text-sm">Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1">
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 w-full bg-white/10 rounded mb-1"></div>
                    <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">No comments yet.</div>
            <div className="text-white/30 text-xs mt-1">Be the first to comment!</div>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReact={handleReaction}
                onReply={handleReply}
                onStartChat={onStartChat}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
