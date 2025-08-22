'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  HeartIcon,
  FaceSmileIcon,
  HandThumbUpIcon,
  FaceFrownIcon,
  ExclamationCircleIcon,
  ChatBubbleOvalLeftIcon,
  PaperAirplaneIcon,
  TrashIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  FaceSmileIcon as FaceSmileSolid,
  HandThumbUpIcon as HandThumbUpSolid,
  FaceFrownIcon as FaceFrownSolid,
  ExclamationCircleIcon as ExclamationCircleSolid
} from '@heroicons/react/24/solid';
import ProfileViewModal from './ProfileViewModal';

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

interface Reaction {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  type: ReactionType;
  createdAt: string;
}

interface Reply {
  _id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  reactions: Reaction[];
  createdAt: string;
}

interface Comment {
  _id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  reactions: Reaction[];
  replies: Reply[];
  replyCount: number;
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  onReact: (commentId: string, type: ReactionType, replyId?: string) => void;
  onReply: (commentId: string, content: string) => void;
  onStartChat?: (userId: string) => void;
  postOwnerId?: string;
}

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const _reactionIcons = {
  like: { outline: HandThumbUpIcon, solid: HandThumbUpSolid },
  love: { outline: HeartIcon, solid: HeartSolid },
  laugh: { outline: FaceSmileIcon, solid: FaceSmileSolid },
  wow: { outline: ExclamationCircleIcon, solid: ExclamationCircleSolid },
  sad: { outline: FaceFrownIcon, solid: FaceFrownSolid },
  angry: { outline: FaceFrownIcon, solid: FaceFrownSolid }
};

export default function CommentItem({ comment, onReact, onReply, onStartChat, postOwnerId }: CommentItemProps) {
  const { data: session } = useSession();
  const [showReactions, setShowReactions] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getUserReaction = (reactions: Reaction[], userId: string) => {
    return reactions.find(r => r.user.id === userId);
  };

  const _getReactionCount = (reactions: Reaction[], type: ReactionType) => {
    return reactions.filter(r => r.type === type).length;
  };

  const getTotalReactions = (reactions: Reaction[]) => {
    return reactions.length;
  };

  const getTopReactions = (reactions: Reaction[]) => {
    const counts: { [key in ReactionType]: number } = {
      like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
    };

    reactions.forEach(r => counts[r.type]++);

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type as ReactionType);
  };

  const handleReaction = (type: ReactionType, replyId?: string) => {
    onReact(comment._id, type, replyId);
    setShowReactions(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    }
  };

  // Profile modal handlers
  const handleProfileClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  const handleStartChat = (userId: string) => {
    onStartChat?.(userId);
  };

  const handleDeleteComment = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove comment from DOM
        const commentElement = document.getElementById(`comment-${comment._id}`);
        if (commentElement) {
          commentElement.style.opacity = '0';
          setTimeout(() => {
            commentElement.remove();
          }, 300);
        }
        
        // Close delete confirmation
        setShowDeleteConfirm(false);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const userReaction = getUserReaction(comment.reactions, session?.user?.id || '');

  return (
    <motion.div
      id={`comment-${comment._id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/15"
    >
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => handleProfileClick(comment.user.id)}
          title="View profile"
        >
          <Image
            src={comment.user.avatar || '/default-avatar.png'}
            alt={comment.user.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          {/* User info and content */}
          <div className="bg-white/12 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-start">
              <button
                onClick={() => handleProfileClick(comment.user.id)}
                className="text-blue-900 font-semibold text-base hover:text-blue-300 transition-colors cursor-pointer"
              >
                {comment.user.name}
              </button>
              
              {/* Delete option - Only show if user is comment author or post owner */}
              {session?.user?.id && (session.user.id === comment.user.id || session.user.id === postOwnerId) && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-white/40 hover:text-red-400 transition-colors p-1"
                  title="Delete comment"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-white/95 text-base mt-2 leading-relaxed">{comment.content}</p>
          </div>

          {/* Reactions display */}
          {getTotalReactions(comment.reactions) > 0 && (
            <div className="flex items-center mt-2 mb-2">
              <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
                {getTopReactions(comment.reactions).map((type, index) => (
                  <span key={type} className="text-sm mr-1">
                    {reactionEmojis[type]}
                  </span>
                ))}
                <span className="text-white/70 text-xs ml-1">
                  {getTotalReactions(comment.reactions)}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-6 mt-3">
            <div className="relative">
              <button
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                className={`flex items-center space-x-2 text-sm py-2 px-3 rounded-lg transition-all ${
                  userReaction
                    ? 'text-blue-400 bg-blue-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {userReaction ? (
                  <span className="text-base">{reactionEmojis[userReaction.type]}</span>
                ) : (
                  <HandThumbUpIcon className="w-5 h-5" />
                )}
                <span className="font-medium">{userReaction ? userReaction.type : 'Like'}</span>
              </button>

              {/* Reaction picker */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-2 bg-black/80 backdrop-blur-md rounded-full p-2 flex space-x-1 shadow-xl border border-white/20"  
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                  >
                    {Object.entries(reactionEmojis).map(([type, emoji]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type as ReactionType)}
                        className="text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-white/20"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center space-x-2 text-sm text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/15 transition-all"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
              <span className="font-medium">Reply</span>
            </button>

            <span className="text-white/50 text-sm font-medium">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReplySubmit}
                className="flex items-center space-x-3 mt-4"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20">
                  <Image
                    src={session?.user?.image || '/default-avatar.png'}
                    alt="Your avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex items-center bg-white/12 rounded-full border border-white/20">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-transparent text-white placeholder-white/60 px-5 py-3 focus:outline-none text-base"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className={`m-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      !replyText.trim()
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replyCount > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-white/70 hover:text-white text-sm font-medium mb-3 flex items-center space-x-2 transition-colors"
              >
                <span>{showReplies ? 'Hide' : 'View'} {comment.replyCount} replies</span>
              </button>

              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pl-5 border-l-2 border-white/25"
                  >
                    {comment.replies.map((reply) => (
                      <ReplyItem
                        key={reply._id}
                        reply={reply}
                        commentId={comment._id}
                        onReact={onReact}
                        onStartChat={onStartChat || (() => {})}
                        postOwnerId={postOwnerId}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-3">Delete Comment</h3>
              <p className="text-white/80 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile View Modal - now uses createPortal internally */}
      {showProfileModal && selectedUserId && (
        <ProfileViewModal
          isOpen={showProfileModal}
          userId={selectedUserId}
          onClose={() => setShowProfileModal(false)}
          onStartChat={handleStartChat}
        />
      )}
    </motion.div>
  );
}

// Reply component
interface ReplyItemProps {
  reply: Reply;
  commentId: string;
  onReact: (commentId: string, type: ReactionType, replyId?: string) => void;
  onStartChat: (userId: string) => void;
  postOwnerId?: string;
}

function ReplyItem({ reply, commentId, onReact, onStartChat, postOwnerId }: ReplyItemProps) {
  const { data: session } = useSession();
  const [showReactions, setShowReactions] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile modal handlers
  const handleProfileClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  const handleStartChat = (userId: string) => {
    setShowProfileModal(false);
    onStartChat(userId);
  };

  const handleDeleteReply = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/comments/${reply._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove reply from DOM
        const replyElement = document.getElementById(`reply-${reply._id}`);
        if (replyElement) {
          replyElement.style.opacity = '0';
          setTimeout(() => {
            replyElement.remove();
          }, 300);
        }
        
        // Close delete confirmation
        setShowDeleteConfirm(false);
      } else {
        console.error('Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getUserReaction = (reactions: Reaction[], userId: string) => {
    return reactions.find(r => r.user.id === userId);
  };

  const getTotalReactions = (reactions: Reaction[]) => {
    return reactions.length;
  };

  const getTopReactions = (reactions: Reaction[]) => {
    const counts: { [key in ReactionType]: number } = {
      like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0
    };
    
    reactions.forEach(r => counts[r.type]++);

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type as ReactionType);
  };

  const handleReaction = (type: ReactionType) => {
    onReact(commentId, type, reply._id);
    setShowReactions(false);
  };

  const userReaction = getUserReaction(reply.reactions, session?.user?.id || '');

  return (
    <div className="flex items-start space-x-3" id={`reply-${reply._id}`}>
      <button
        onClick={() => handleProfileClick(reply.user.id)}
        className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:ring-2 hover:ring-blue-500/50 transition-all duration-200"        
      >
        <Image
          src={reply.user.avatar || '/default-avatar.png'}
          alt={reply.user.name}
          fill
          className="object-cover"
        />
      </button>

      <div className="flex-1">
        <div className="bg-white/8 rounded-xl px-4 py-3">
          <div className="flex justify-between items-start">
            <button
              onClick={() => handleProfileClick(reply.user.id)}
              className="text-blue-900 font-semibold text-sm hover:text-blue-300 transition-colors duration-200"
            >
              {reply.user.name}
            </button>
            
            {/* Delete option - Only show if user is reply author or post owner */}
            {session?.user?.id && (session.user.id === reply.user.id || session.user.id === postOwnerId) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-white/40 hover:text-red-400 transition-colors p-0.5"
                title="Delete reply"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-white/95 text-sm mt-1.5 leading-relaxed">{reply.content}</p>
        </div>

        {/* Reactions display */}
        {getTotalReactions(reply.reactions) > 0 && (
          <div className="flex items-center mt-1 mb-1">
            <div className="flex items-center bg-white/10 rounded-full px-2 py-0.5">
              {getTopReactions(reply.reactions).map((type, index) => (
                <span key={type} className="text-xs mr-1">
                  {reactionEmojis[type]}
                </span>
              ))}
              <span className="text-white/70 text-xs ml-1">
                {getTotalReactions(reply.reactions)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 mt-2">
          <div className="relative">
            <button
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className={`flex items-center space-x-1.5 text-sm py-1.5 px-2 rounded transition-all ${
                userReaction
                  ? 'text-blue-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {userReaction ? (
                <span className="text-sm">{reactionEmojis[userReaction.type]}</span>
              ) : (
                <HandThumbUpIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{userReaction ? userReaction.type : 'Like'}</span>
            </button>

            {/* Reaction picker */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-1 bg-black/80 backdrop-blur-md rounded-full p-1 flex space-x-1 shadow-xl border border-white/20"    
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                >
                  {Object.entries(reactionEmojis).map(([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type as ReactionType)}
                      className="text-sm hover:scale-125 transition-transform p-1 rounded-full hover:bg-white/20"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-white/50 text-sm font-medium">{formatTimeAgo(reply.createdAt)}</span>
        </div>
      </div>

      {/* Profile View Modal - now uses createPortal internally */}
      {showProfileModal && selectedUserId && (
        <ProfileViewModal
          isOpen={showProfileModal}
          userId={selectedUserId}
          onClose={() => setShowProfileModal(false)}
          onStartChat={handleStartChat}
        />
      )}
      
      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-3">Delete Reply</h3>
              <p className="text-white/80 mb-6">Are you sure you want to delete this reply? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReply}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
