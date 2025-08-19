'use client';

import { useSocket } from '@/contexts/SocketContext';
import { useSession } from 'next-auth/react';
import ConnectionStatus from '@/app/home/components/ConnectionStatus';

export default function SocketTestPage() {
  const { socket, isConnected, onlineUsers, typingUsers } = useSocket();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Socket.IO Test</h1>
          <p>Please log in to test Socket.IO functionality</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <ConnectionStatus />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Socket.IO Real-time Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div>Socket ID: {socket?.id || 'N/A'}</div>
              <div>User: {session.user?.name || session.user?.email}</div>
            </div>
          </div>

          {/* Online Users */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Online Users</h2>
            <div className="space-y-2">
              <div>Total Online: {onlineUsers.size}</div>
              <div className="max-h-40 overflow-y-auto">
                {Array.from(onlineUsers).map(userId => (
                  <div key={userId} className="text-sm text-gray-300">
                    User: {userId}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Typing Users */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Typing Indicators</h2>
            <div className="space-y-2">
              <div>Currently Typing: {typingUsers.size}</div>
              <div className="max-h-40 overflow-y-auto">
                {Array.from(typingUsers.entries()).map(([key, user]) => (
                  <div key={key} className="text-sm text-gray-300">
                    {user.userName} is typing...
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => socket?.emit('join-community', 'test-community')}
                className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!isConnected}
              >
                Join Test Community
              </button>
              
              <button
                onClick={() => socket?.emit('start-typing', { communityId: 'test-community' })}
                className="w-full px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                disabled={!isConnected}
              >
                Start Typing
              </button>
              
              <button
                onClick={() => socket?.emit('stop-typing', { communityId: 'test-community' })}
                className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                disabled={!isConnected}
              >
                Stop Typing
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/home" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
