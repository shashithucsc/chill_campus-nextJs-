'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useChat } from '../context/ChatContext';
import MessageInbox from '../components/MessageInbox';
import DirectMessageUI from '../components/DirectMessageUI';
import NewMessageModal from '../components/NewMessageModal';

export default function ChatSidebar() {
  const { isChatOpen, closeChat, selectedConversation, setSelectedConversation } = useChat();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  // Handle starting a new conversation
  const handleNewConversation = (recipientId: string) => {
    setSelectedConversation(recipientId);
    setShowNewMessageModal(false);
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Chat Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-96 lg:w-80 xl:w-96 bg-white/10 backdrop-blur-md border-l border-white/20 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">
                {selectedConversation ? 'Chat' : 'Messages'}
              </h2>
              <button
                onClick={closeChat}
                className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {selectedConversation ? (
                <DirectMessageUI 
                  recipientId={selectedConversation}
                  onBack={() => setSelectedConversation(null)}
                />
              ) : (
                <MessageInbox 
                  onConversationSelect={setSelectedConversation}
                  onNewMessage={() => setShowNewMessageModal(true)}
                  onClose={closeChat}
                  selectedConversationId={selectedConversation || undefined}
                />
              )}
            </div>
          </motion.div>

          {/* New Message Modal */}
          <NewMessageModal
            isOpen={showNewMessageModal}
            onClose={() => setShowNewMessageModal(false)}
            onConversationStart={handleNewConversation}
          />
        </>
      )}
    </AnimatePresence>
  );
}
