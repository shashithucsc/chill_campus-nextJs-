'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatBubbleLeftSolid, UserGroupIcon as UserGroupSolid } from '@heroicons/react/24/solid';

// Components
import MessagingUI from './MessagingUI';
import DirectMessageUI from './DirectMessageUI';
import MessageInbox from './MessageInbox';
import NewMessageModal from './NewMessageModal';

interface Community {
  _id: string;
  name: string;
  banner: string;
  description: string;
}

interface DualMessagingProps {
  community?: Community;
  className?: string;
  onClose?: () => void; // Optional close handler
}

type MessagingMode = 'group' | 'direct' | 'inbox';

export default function DualMessaging({ community, className = '', onClose }: DualMessagingProps) {
  const { data: session } = useSession();
  const [mode, setMode] = useState<MessagingMode>('inbox');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Close handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle conversation selection from inbox
  const handleConversationSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId);
    setMode('direct');
  };

  // Handle new conversation start
  const handleNewConversation = (recipientId: string) => {
    console.log('handleNewConversation called with recipientId:', recipientId);
    setSelectedRecipientId(recipientId);
    setMode('direct');
    setShowNewMessageModal(false);
    console.log('State updated - selectedRecipientId:', recipientId, 'mode: direct');
  };

  // Handle message sent - refresh conversations
  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle back navigation
  const handleBack = () => {
    if (mode === 'direct') {
      setMode('inbox');
      setSelectedRecipientId(null);
    } else if (mode === 'group') {
      setMode('inbox');
    }
  };

  // Handle mode switch
  const handleModeSwitch = (newMode: MessagingMode) => {
    setMode(newMode);
    if (newMode !== 'direct') {
      setSelectedRecipientId(null);
    }
  };

  // Mobile: Show only one view at a time
  if (isMobile) {
    return (
      <div className={`h-full ${className}`}>
        <AnimatePresence mode="wait">
          {mode === 'inbox' && (
            <motion.div
              key="mobile-inbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {/* Mobile Header */}
              <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white">Messages</h1>
                  <div className="flex items-center space-x-2">
                    {/* Mode Toggle */}
                    <div className="flex items-center bg-black/20 rounded-xl p-1">
                      <button
                        onClick={() => handleModeSwitch('inbox')}
                        className={`p-2 rounded-lg transition-all ${
                          mode === 'inbox' 
                            ? 'bg-blue-500 text-white' 
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5" />
                      </button>
                      {community && (
                        <button
                          onClick={() => handleModeSwitch('group')}
                          className={`p-2 rounded-lg transition-all ${
                            mode === 'group' 
                              ? 'bg-blue-500 text-white' 
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <UserGroupIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
                      <Cog6ToothIcon className="h-5 w-5 text-white/60" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inbox */}
              <MessageInbox
                onConversationSelect={handleConversationSelect}
                onNewMessage={() => setShowNewMessageModal(true)}
                onClose={handleClose}
                selectedConversationId={selectedRecipientId}
                className="flex-1"
                refreshTrigger={refreshTrigger}
              />
            </motion.div>
          )}

          {mode === 'group' && community && (
            <motion.div
              key="mobile-group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {/* Mobile Group Header */}
              <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-white" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <UserGroupSolid className="h-6 w-6 text-blue-400" />
                    <h2 className="text-lg font-bold text-white">{community.name}</h2>
                  </div>
                </div>
              </div>

              <MessagingUI community={community} />
            </motion.div>
          )}

          {mode === 'direct' && selectedRecipientId && (
            <motion.div
              key="mobile-direct"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <DirectMessageUI
                recipientId={selectedRecipientId}
                onBack={handleBack}
                onNewMessage={handleMessageSent}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Message Modal */}
        <NewMessageModal
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          onConversationStart={handleNewConversation}
        />
      </div>
    );
  }

  // Desktop: Show sidebar and main content
  return (
    <div className={`h-full flex ${className}`}>
      {/* Sidebar */}
      <div className="w-80 flex flex-col bg-black/20 backdrop-blur-sm border-r border-white/10">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
              <Cog6ToothIcon className="h-5 w-5 text-white/60" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-black/20 rounded-xl p-1">
            <button
              onClick={() => handleModeSwitch('inbox')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                mode === 'inbox' || mode === 'direct'
                  ? 'bg-blue-500 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Direct</span>
            </button>
            {community && (
              <button
                onClick={() => handleModeSwitch('group')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all ${
                  mode === 'group' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserGroupIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {(mode === 'inbox' || mode === 'direct') && (
            <MessageInbox
              onConversationSelect={handleConversationSelect}
              onNewMessage={() => setShowNewMessageModal(true)}
              onClose={handleClose}
              selectedConversationId={selectedRecipientId}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {mode === 'group' && community && (
            <div className="p-4 text-center">
              <div className="bg-white/10 rounded-xl p-6">
                <UserGroupSolid className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{community.name}</h3>
                <p className="text-white/60 text-sm">
                  Group chat for community members
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'group' && community ? (
            <motion.div
              key="desktop-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <MessagingUI community={community} />
            </motion.div>
          ) : mode === 'direct' && selectedRecipientId ? (
            <motion.div
              key="desktop-direct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <DirectMessageUI 
                recipientId={selectedRecipientId} 
                onNewMessage={handleMessageSent}
              />
            </motion.div>
          ) : (
            <motion.div
              key="desktop-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
            >
              <div className="text-center">
                <ChatBubbleLeftSolid className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/80 mb-2">
                  Select a conversation
                </h3>
                <p className="text-white/60">
                  Choose a conversation from the sidebar to start messaging
                </p>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
                >
                  Start New Conversation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onConversationStart={handleNewConversation}
      />
    </div>
  );
}
