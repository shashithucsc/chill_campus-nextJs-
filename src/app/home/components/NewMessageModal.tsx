'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  fullName: string;
  avatar: string;
  email: string;
  role: string;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStart: (recipientId: string) => void;
}

export default function NewMessageModal({ isOpen, onClose, onConversationStart }: NewMessageModalProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Search users
  const searchUsers = async (query: string) => {
    console.log('searchUsers called with query:', query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Fetching users from API...');
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=20`);
      console.log('User search response status:', response.status);
      if (!response.ok) throw new Error('Failed to search users');
      
      const data = await response.json();
      console.log('User search results:', data);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Focus search input when modal opens
  useEffect(() => {
    console.log('NewMessageModal isOpen changed:', isOpen);
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle modal close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    console.log('User selected:', user);
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Send message and start conversation
  const handleSendMessage = async () => {
    console.log('handleSendMessage called', { selectedUser, message: message.trim(), isSending });
    if (!selectedUser || !message.trim() || isSending) return;

    setIsSending(true);
    try {
      console.log('Sending message to API...');
      const response = await fetch('/api/direct-messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message.trim(),
          recipientId: selectedUser._id
        })
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error:', errorData);
        throw new Error('Failed to send message');
      }

      const responseData = await response.json();
      console.log('Message sent successfully:', responseData);

      // Close modal and start conversation
      onConversationStart(selectedUser._id);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Reset modal state
  const handleReset = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setMessage('');
  };

  // Handle modal close
  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}
          className="rounded-2xl border border-white/20 backdrop-blur-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white drop-shadow">New Message</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              <XMarkIcon className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!selectedUser ? (
              // User Search
              <div>
                <div className="mb-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    To:
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow"
                    />
                  </div>
                </div>

                {/* Search Results */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <motion.button
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleUserSelect(user)}
                        className="w-full p-3 flex items-center space-x-3 rounded-xl hover:bg-white/20 transition-all text-left border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.fullName}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {user.fullName}
                          </div>
                          <div className="text-white/60 text-sm truncate">
                            {user.email}
                          </div>
                        </div>

                        <div className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-lg">
                          {user.role}
                        </div>
                      </motion.button>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center py-8 text-white/60">
                      <UserIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm">No users found</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-white/60">
                      <MagnifyingGlassIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm">Search for users to start a conversation</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Message Composition
              <div>
                {/* Selected User */}
                <div className="mb-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    To:
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 flex-shrink-0 border border-white/10">
                      {selectedUser.avatar ? (
                        <Image
                          src={selectedUser.avatar}
                          alt={selectedUser.fullName}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                          {selectedUser.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {selectedUser.fullName}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <XMarkIcon className="h-4 w-4 text-white/60" />
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-6">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Message:
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 text-white/80 hover:text-white transition-all border border-white/10 rounded-xl bg-white/10"
                  >
                    Back
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className={`
                      px-6 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 border shadow
                      ${message.trim() && !isSending
                        ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 hover:from-blue-800 hover:via-indigo-800 hover:to-blue-700 text-white border-white/20' 
                        : 'bg-white/10 text-white/40 cursor-not-allowed border-white/10'
                      }
                    `}
                  >
                    {isSending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4" />
                        <span>Send</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
