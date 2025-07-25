'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArchiveBoxIcon,
  CheckIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatBubbleLeftSolid } from '@heroicons/react/24/solid';

interface LastMessage {
  content: string;
  timestamp: string;
  senderId: string;
}

interface Participant {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage: LastMessage;
  unreadCount: Record<string, number>;
  isArchived: Record<string, boolean>;
  updatedAt: string;
  createdAt: string;
}

interface MessageInboxProps {
  onConversationSelect: (recipientId: string) => void;
  onNewMessage: () => void;
  selectedConversationId?: string;
  className?: string;
}

export default function MessageInbox({ 
  onConversationSelect, 
  onNewMessage, 
  selectedConversationId,
  className = ''
}: MessageInboxProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/direct-messages/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp for conversation list
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 24 * 7) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get other participant in conversation
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== session?.user?.id);
  };

  // Get unread count for current user
  const getUnreadCount = (conversation: Conversation) => {
    const userId = session?.user?.id;
    return userId ? (conversation.unreadCount[userId] || 0) : 0;
  };

  // Check if conversation is archived for current user
  const isConversationArchived = (conversation: Conversation) => {
    const userId = session?.user?.id;
    return userId ? (conversation.isArchived[userId] || false) : false;
  };

  // Filter conversations based on search and archive status
  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation);
    const matchesSearch = !searchQuery || 
      otherParticipant?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesArchiveFilter = showArchived ? 
      isConversationArchived(conversation) : 
      !isConversationArchived(conversation);

    return matchesSearch && matchesArchiveFilter;
  });

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((total, conversation) => {
    return total + getUnreadCount(conversation);
  }, 0);

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/direct-messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId })
      });
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => {
          if (conv._id === conversationId) {
            const userId = session?.user?.id;
            if (userId) {
              return {
                ...conv,
                unreadCount: {
                  ...conv.unreadCount,
                  [userId]: 0
                }
              };
            }
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (otherParticipant) {
      onConversationSelect(otherParticipant._id);
      
      // Mark as read if it has unread messages
      if (getUnreadCount(conversation) > 0) {
        markAsRead(conversation._id);
      }
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchConversations();

    // Set up polling for new conversations
    const interval = setInterval(fetchConversations, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex items-center justify-center h-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-black/20 backdrop-blur-sm border-r border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftSolid className="h-6 w-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Messages</h2>
            {totalUnreadCount > 0 && (
              <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </div>
            )}
          </div>
          
          <button
            onClick={onNewMessage}
            className="p-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all"
          >
            <PlusIcon className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>

        {/* Archive Toggle */}
        <div className="flex items-center mt-3">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              !showArchived 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ml-2 ${
              showArchived 
                ? 'bg-blue-500 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <ArchiveBoxIcon className="h-4 w-4 inline mr-1" />
            Archived
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 text-white/60"
            >
              <ChatBubbleLeftIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewMessage}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Start a conversation
                </button>
              )}
            </motion.div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversationId === otherParticipant?._id;

              if (!otherParticipant) return null;

              return (
                <motion.button
                  key={conversation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`
                    w-full p-4 flex items-center space-x-3 hover:bg-white/5 transition-all text-left
                    ${isSelected ? 'bg-blue-500/20 border-r-2 border-blue-400' : ''}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
                      {otherParticipant.avatar ? (
                        <Image
                          src={otherParticipant.avatar}
                          alt={otherParticipant.fullName}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                          {otherParticipant.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                        {otherParticipant.fullName}
                      </h3>
                      <span className="text-xs text-white/50 flex-shrink-0">
                        {formatTimestamp(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                      </span>
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="flex items-center space-x-1">
                        {conversation.lastMessage.senderId === session?.user?.id && (
                          <CheckIcon className="h-3 w-3 text-white/50 flex-shrink-0" />
                        )}
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'text-white/90' : 'text-white/60'}`}>
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add archive/unarchive functionality here
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <EllipsisVerticalIcon className="h-4 w-4 text-white/60" />
                    </button>
                  </div>
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
