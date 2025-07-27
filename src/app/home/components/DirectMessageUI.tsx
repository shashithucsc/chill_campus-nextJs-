'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  PaperAirplaneIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  FaceSmileIcon,
  ArrowUturnLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import EmojiPicker from './EmojiPicker';

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
  messageType: 'text' | 'image' | 'file';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  const fetchMessages = async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      
      const response = await fetch(`/api/direct-messages/get?recipientId=${recipientId}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
      setRecipient(data.recipient);
      
      if (isInitial) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData: any = {
        content: newMessage.trim(),
        recipientId
      };

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
    fetchMessages(true);

    // Set up polling for new messages
    pollingRef.current = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [recipientId]);

  // Adjust textarea height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
    <div className="flex flex-col h-full max-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
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
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
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

          <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            <EllipsisVerticalIcon className="h-5 w-5 text-white" />
          </button>
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
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
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
                              ? 'bg-blue-500/30 border-blue-400/30 text-white' 
                              : 'bg-black/30 border-white/10 text-white/90'
                            }
                          `}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                          
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
                            ${isOwnMessage ? '-left-12' : '-right-12'}
                          `}>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-all"
                              >
                                <ArrowUturnLeftIcon className="h-4 w-4 text-white/80" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 transition-all">
                                <FaceSmileIcon className="h-4 w-4 text-white/80" />
                              </button>
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
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
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
            disabled={!newMessage.trim() || isSending}
            className={`
              p-3 rounded-2xl transition-all
              ${newMessage.trim() && !isSending
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-white/10 text-white/40 cursor-not-allowed'
              }
            `}
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
      </motion.div>
    </div>
  );
}
