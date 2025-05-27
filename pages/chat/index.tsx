import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    name: 'John Doe',
    lastMessage: 'Hey, are you going to the workshop tomorrow?',
    time: '10:30 AM',
    unread: 2,
    avatar: '/default-avatar.png',
  },
  {
    id: 2,
    name: 'Jane Smith',
    lastMessage: 'Thanks for the help with the project!',
    time: 'Yesterday',
    unread: 0,
    avatar: '/default-avatar.png',
  },
  // Add more mock conversations as needed
];

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Chat - ChillCampus</title>
        <meta name="description" content="Chat with other university students" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-12 h-[600px]">
            {/* Conversations List */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Messages</h2>
              </div>
              <div className="overflow-y-auto h-[calc(600px-4rem)]">
                {mockConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                      selectedChat === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedChat(conversation.id)}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        className="h-12 w-12 rounded-full"
                        src={conversation.avatar}
                        alt={conversation.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{conversation.name}</p>
                        <p className="text-sm text-gray-500">{conversation.time}</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                          {conversation.unread}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Image
                        className="h-10 w-10 rounded-full"
                        src={mockConversations.find(c => c.id === selectedChat)?.avatar || '/default-avatar.png'}
                        alt="Profile"
                        width={40}
                        height={40}
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {mockConversations.find(c => c.id === selectedChat)?.name}
                        </h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* Add messages here */}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 