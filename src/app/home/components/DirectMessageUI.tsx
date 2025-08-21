'use client';

import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/contexts/SocketContext';
import Image from 'next/image';
import { 
  PaperAirplaneIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  FaceSmileIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';
import FileAttachment from './FileAttachment';
import FileMessage from './FileMessage';

interface MessageSender {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
}

interface ReplyMessage {
  _id: string;
  content: string;
  sender: {
    fullName: string;
  };
  timestamp: string;
}

interface DirectMessage {
  _id: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'pdf';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: Array<{
    userId: string;
    emoji: string;
  }>;
  replyTo?: ReplyMessage;
  createdAt: string;
  updatedAt: string;
}

interface Recipient {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
}

interface DirectMessageUIProps {
  recipientId: string;
  onBack?: () => void;
  onNewMessage?: () => void;
}

export default function DirectMessageUI({ recipientId, onBack, onNewMessage }: DirectMessageUIProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showConversationDeleteModal, setShowConversationDeleteModal] = useState(false);
  const [showConversationDeleteOptions, setShowConversationDeleteOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages - defined first since other functions depend on it
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!recipientId || !session?.user) return;
    
    try {
      if (isInitial) setIsLoading(true);
      
      const response = await fetch(`/api/direct-messages/get?recipientId=${recipientId}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      
      // Set recipient data
      setRecipient(data.recipient);
      
      // Check if we need to filter messages due to blocked status
      if (isUserBlocked) {
        // If user is blocked, only show messages from the current user
        const currentUserId = session?.user?.id;
        const filteredMessages = data.messages.filter((msg: DirectMessage) => 
          msg.sender._id === currentUserId
        );
        setMessages(filteredMessages || []);
      } else {
        setMessages(data.messages || []);
      }
      
      if (isInitial) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [recipientId, session, isUserBlocked, scrollToBottom]);

  // Check if user is blocked
  const checkIfUserIsBlocked = useCallback(async () => {
    if (!recipientId || !session?.user) return;
    
    try {
      const response = await fetch(`/api/users/block/${recipientId}`);
      if (!response.ok) throw new Error('Failed to check block status');
      
      const data = await response.json();
      setIsUserBlocked(data.isBlocked);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  }, [recipientId, session]);

  // Block or unblock user
  const toggleBlockUser = useCallback(async () => {
    if (!recipientId || !session?.user) return;
    
    try {
      setIsBlockingUser(true);
      
      const method = isUserBlocked ? 'DELETE' : 'POST';
      const response = await fetch('/api/users/block', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: recipientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle block status');
      }

      // Update the blocked status
      setIsUserBlocked(prev => !prev);
      setShowOptionsMenu(false);
      
      // We don't call fetchMessages directly to avoid circular dependency
      // The useEffect with isUserBlocked dependency will handle this
    } catch (error) {
      console.error('Error toggling block status:', error);
    } finally {
      setIsBlockingUser(false);
    }
  }, [recipientId, session, isUserBlocked]);

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    try {
      const messageData: any = {
        recipientId
      };

      if (selectedFile) {
        // Sending file message
        messageData.content = selectedFile.originalName;
        messageData.messageType = selectedFile.category;
        messageData.fileUrl = selectedFile.url;
        messageData.fileName = selectedFile.originalName;
        messageData.fileSize = selectedFile.size;
        messageData.fileType = selectedFile.type;
      } else {
        // Sending text message
        messageData.content = newMessage.trim();
        messageData.messageType = 'text';
      }

      if (replyingTo) {
        messageData.replyTo = replyingTo._id;
      }

      const response = await fetch('/api/direct-messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      setSelectedFile(null);
      setReplyingTo(null);
      setTimeout(scrollToBottom, 100);
      
      // Notify parent component about new message
      onNewMessage?.();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Delete individual message
  const deleteMessage = async (messageId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/direct-messages/delete?messageId=${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }

      // Remove message from state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. You can only delete your own messages.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete conversation with options
  const deleteConversation = async (deleteType: 'all' | 'sent' | 'received') => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/direct-messages/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId,
          deleteType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete conversation');
      }

      // Update messages based on delete type
      if (deleteType === 'all') {
        setMessages([]);
      } else if (deleteType === 'sent') {
        setMessages(prev => prev.filter(msg => msg.sender._id !== session?.user?.id));
      } else if (deleteType === 'received') {
        setMessages(prev => prev.filter(msg => msg.sender._id === session?.user?.id));
      }
      
      setShowConversationDeleteModal(false);
      setShowConversationDeleteOptions(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete message click
  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  // Handle textarea key events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for separators
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: DirectMessage[]) => {
    const groups: { [key: string]: DirectMessage[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: formatDate(msgs[0].timestamp),
      messages: msgs
    }));
  };

  // Initial fetch and polling setup
  useEffect(() => {
    if (session?.user) {
      fetchMessages(true);
      checkIfUserIsBlocked();
  
      // Set up polling for new messages
      pollingRef.current = setInterval(() => {
        fetchMessages(false);
        // Periodically check if block status has changed
        // but not too frequently to avoid too many API calls
        checkIfUserIsBlocked();
      }, 5000); // Slightly longer interval for better performance
  
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [recipientId, session, fetchMessages, checkIfUserIsBlocked]);

  // Refetch messages when block status changes
  useEffect(() => {
    if (session?.user) {
      fetchMessages(false);
    }
  }, [isUserBlocked, session]);

  // Adjust textarea height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  // Handle click outside emoji picker and options menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showEmojiPicker || showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, showOptionsMenu]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const currentUserId = session?.user?.id;

  return (
    <div 
      className="flex flex-col h-full max-h-screen"
      style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}
    >
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-xl"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title="Back to conversations"
              >
                <ArrowLeftIcon className="h-5 w-5 text-white" />
              </button>
            )}
            
            {recipient && (
              <>
                <div className="relative w-12 h-12 rounded-full overflow-hidden" style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}>
                  {recipient.avatar ? (
                    <Image
                      src={recipient.avatar}
                      alt={recipient.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                      {recipient.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-white">{recipient.fullName}</h2>
                  <div className="text-white/60 text-sm">
                    {recipient.email}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative" ref={optionsMenuRef}>
            <button 
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <EllipsisVerticalIcon className="h-5 w-5 text-white" />
            </button>

            {/* Options Dropdown */}
            {showOptionsMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-56 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50"
              >
                <button
                  onClick={toggleBlockUser}
                  disabled={isBlockingUser}
                  className={`w-full px-4 py-3 text-left ${isUserBlocked ? 'text-green-300 hover:bg-green-500/20' : 'text-red-300 hover:bg-red-500/20'} transition-all flex items-center space-x-2`}
                >
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>{isBlockingUser ? 'Processing...' : isUserBlocked ? 'Unblock User' : 'Block User'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowConversationDeleteModal(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/20 transition-all flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Conversation</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center my-6"
              >
                <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="text-white/60 text-sm font-medium">{group.date}</span>
                </div>
              </motion.div>

              {/* Messages */}
              {group.messages.map((message, index) => {
                const isOwnMessage = message.sender._id === currentUserId;
                const showAvatar = !isOwnMessage && (
                  index === 0 || 
                  group.messages[index - 1].sender._id !== message.sender._id
                );

                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      {showAvatar && !isOwnMessage && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'}}>
                          {message.sender.avatar ? (
                            <Image
                              src={message.sender.avatar}
                              alt={message.sender.fullName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                              {message.sender.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`relative group ${showAvatar || isOwnMessage ? '' : 'ml-10'}`}>
                        {/* Reply Context */}
                        {message.replyTo && (
                          <div className={`mb-2 p-2 bg-black/20 rounded-lg border-l-2 ${isOwnMessage ? 'border-blue-400' : 'border-purple-400'}`}>
                            <div className="text-white/60 text-xs font-medium mb-1">
                              Replying to {message.replyTo.sender.fullName}
                            </div>
                            <div className="text-white/80 text-sm truncate">
                              {message.replyTo.content}
                            </div>
                          </div>
                        )}

                        {/* Message Content */}
                        <div
                          className={`
                            relative px-4 py-3 rounded-2xl backdrop-blur-sm border
                            ${isOwnMessage 
                              ? 'border border-white/20 text-white' 
                              : 'bg-black/30 border-white/10 text-white/90'
                            }
                          `}
                          style={isOwnMessage ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
                        >
                          {/* File Message */}
                          {message.messageType !== 'text' && message.fileUrl && (
                            <div className="mb-2">
                              <FileMessage
                                fileUrl={message.fileUrl}
                                fileName={message.fileName || 'File'}
                                fileSize={message.fileSize}
                                fileType={message.fileType}
                                messageType={message.messageType as any}
                                isOwnMessage={isOwnMessage}
                                onDelete={() => handleDeleteMessage(message._id)}
                              />
                            </div>
                          )}
                          
                          {/* Text Content (for captions or text messages) */}
                          {message.messageType === 'text' || (message.content && message.content !== message.fileName) ? (
                            <div className="whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                          ) : null}
                          
                          {/* Timestamp and Read status */}
                          <div className={`flex items-center space-x-1 mt-2 ${isOwnMessage ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-xs opacity-60">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.isEdited && (
                              <span className="text-xs opacity-60">(edited)</span>
                            )}
                            {isOwnMessage && (
                              <div className="text-xs opacity-60">
                                {message.isRead ? (
                                  <div className="flex">
                                    <CheckIcon className="h-3 w-3 text-blue-400" />
                                    <CheckIcon className="h-3 w-3 text-blue-400 -ml-1" />
                                  </div>
                                ) : (
                                  <CheckIcon className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Message Actions (on hover) */}
                          <div className={`
                            absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
                            ${isOwnMessage ? '-left-16' : '-right-16'}
                          `}>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-all"
                                title="Reply"
                              >
                                <ArrowUturnLeftIcon className="h-4 w-4 text-white/80" />
                              </button>
                              <button 
                                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-all"
                                title="Add reaction"
                              >
                                <FaceSmileIcon className="h-4 w-4 text-white/80" />
                              </button>
                              {/* Delete button - only show for own messages */}
                              {isOwnMessage && (
                                <button
                                  onClick={() => handleDeleteMessage(message._id)}
                                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all"
                                  title="Delete message"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-300" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {message.reactions.map((reaction, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-1 bg-black/30 rounded-full text-sm"
                              >
                                {reaction.emoji}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 bg-black/30 backdrop-blur-xl border-t border-white/10 p-4"
      >
        {isUserBlocked ? (
          <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 text-center">
            <p className="text-white font-medium">You have blocked this user</p>
            <p className="text-white/70 text-sm mt-1">You cannot send messages to a blocked user</p>
            <button
              onClick={toggleBlockUser}
              disabled={isBlockingUser}
              className="mt-3 px-4 py-2 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-green-300 transition-all"
            >
              {isBlockingUser ? 'Processing...' : 'Unblock User'}
            </button>
          </div>
        ) : (
          <>
            {/* Reply Context */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-black/20 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/60 text-xs font-medium mb-1">
                        Replying to {replyingTo.sender.fullName}
                      </div>
                      <div className="text-white/80 text-sm truncate">
                        {replyingTo.content}
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <ArrowLeftIcon className="h-4 w-4 text-white/60" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end space-x-3">
              {/* File Attachment */}
              <FileAttachment
                onFileSelect={setSelectedFile}
                onFileRemove={() => setSelectedFile(null)}
                selectedFile={selectedFile}
                disabled={isSending}
              />

              {/* Message Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFile ? "Add a caption (optional)" : "Type a message..."}
                  className="
                    w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 
                    rounded-2xl text-white placeholder-white/50 resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
                    transition-all duration-200 min-h-[48px] max-h-[120px]
                  "
                  rows={1}
                  disabled={isSending}
                />
                
                {/* Emoji Button and Picker */}
                <div ref={emojiPickerRef} className="absolute right-3 bottom-3">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <FaceSmileIcon className="h-5 w-5 text-white/60" />
                  </button>
                  
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={(!newMessage.trim() && !selectedFile) || isSending}
                className={`
                  p-3 rounded-2xl transition-all
                  ${(newMessage.trim() || selectedFile) && !isSending
                    ? 'text-white shadow-lg border border-white/20' 
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }
                `}
                style={(newMessage.trim() || selectedFile) && !isSending ? {background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'} : undefined}
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      {/* Delete Message Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Message</h3>
              </div>
              
              <p className="text-white/70 mb-6">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMessageToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => messageToDelete && deleteMessage(messageToDelete)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Conversation Confirmation Modal */}
      <AnimatePresence>
        {showConversationDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Conversation</h3>
              </div>
              
              <p className="text-white/70 mb-6">
                Choose what to delete from this conversation:
              </p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => deleteConversation('all')}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all text-left"
                  disabled={isDeleting}
                >
                  <div className="font-medium">Delete All Messages</div>
                  <div className="text-sm text-white/60">Delete the entire conversation for both users</div>
                </button>
                <button
                  onClick={() => deleteConversation('sent')}
                  className="w-full px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-xl transition-all text-left"
                  disabled={isDeleting}
                >
                  <div className="font-medium">Delete Sent Messages</div>
                  <div className="text-sm text-white/60">Delete only messages you sent</div>
                </button>
                <button
                  onClick={() => deleteConversation('received')}
                  className="w-full px-4 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-xl transition-all text-left"
                  disabled={isDeleting}
                >
                  <div className="font-medium">Delete Received Messages</div>
                  <div className="text-sm text-white/60">Delete only messages you received</div>
                </button>
              </div>
              
              <button
                onClick={() => setShowConversationDeleteModal(false)}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}