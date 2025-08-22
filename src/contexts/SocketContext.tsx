'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { SoundManager } from '@/lib/SoundManager';
import { 
  ServerToClientEvents, 
  ClientToServerEvents 
} from '@/lib/socket';
import { toast } from 'react-hot-toast';
import NotificationToast from '@/app/components/NotificationToast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  sender?: string;
  priority: string;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, { userId: string; userName: string; timestamp: number }>;
  latestNotification: Notification | null;
  
  // Helper functions
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (roomData: { communityId?: string; conversationId?: string }) => void;
  stopTyping: (roomData: { communityId?: string; conversationId?: string }) => void;
  markMessagesAsRead: (messageIds: string[], conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
  latestNotification: null,
  joinCommunity: () => {},
  leaveCommunity: () => {},
  joinConversation: () => {},
  leaveConversation: () => {},
  startTyping: () => {},
  stopTyping: () => {},
  markMessagesAsRead: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, { userId: string; userName: string; timestamp: number }>>(new Map());
  const [soundManager] = useState(() => SoundManager.getInstance());
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Create a simple auth token from session user data
      const authToken = btoa(JSON.stringify({
        sub: session.user.id || session.user.email,
        name: session.user.name,
        email: session.user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }));

      // Initialize Socket.IO connection
      const socketInstance = io(process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL! 
        : 'http://localhost:3000', {
        path: '/api/socket/io',
        auth: {
          token: authToken
        },
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Socket.IO connected successfully');
        setIsConnected(true);
        soundManager.playConnectSound();
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setIsConnected(false);
        soundManager.playDisconnectSound();
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
        setIsConnected(false);
        
        // Don't play error sound for initial connection attempts
        if (socketInstance.connected) {
          soundManager.playErrorSound();
        }
        
        // Log detailed error info for debugging
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        soundManager.playConnectSound();
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket.IO reconnection error:', error.message);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket.IO failed to reconnect');
        setIsConnected(false);
        soundManager.playErrorSound();
      });

      // User presence handlers
      socketInstance.on('user-online', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      socketInstance.on('user-offline', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      });

      // Message event handlers with sound effects
      socketInstance.on('new-message', (data) => {
        soundManager.playNewMessageSound();
      });

      socketInstance.on('new-direct-message', (data) => {
        soundManager.playDirectMessageSound();
      });

      // Notification handler
      socketInstance.on('notification:new', (data) => {
        console.log('New notification received:', data);
        setLatestNotification(data.notification);
        soundManager.playNewMessageSound();
        
        // Show toast notification
        toast.custom((t) => (
          <NotificationToast notification={data.notification} t={t} />
        ), {
          duration: 5000,
          position: 'top-right',
        });
      });

      // Typing indicators
      socketInstance.on('user-typing', (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const key = data.communityId || data.conversationId || 'unknown';
          newMap.set(`${key}-${data.userId}`, {
            userId: data.userId,
            userName: data.userName,
            timestamp: Date.now()
          });
          return newMap;
        });
      });

      socketInstance.on('user-stopped-typing', (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const key = data.communityId || data.conversationId || 'unknown';
          newMap.delete(`${key}-${data.userId}`);
          return newMap;
        });
      });

      // Cleanup typing indicators older than 3 seconds
      const typingCleanup = setInterval(() => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const now = Date.now();
          for (const [key, value] of newMap.entries()) {
            if (now - value.timestamp > 3000) {
              newMap.delete(key);
            }
          }
          return newMap;
        });
      }, 1000);

      setSocket(socketInstance);

      return () => {
        clearInterval(typingCleanup);
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Map());
      };
    }
  }, [session, status]);

  // Helper functions
  const joinCommunity = (communityId: string) => {
    socket?.emit('join-community', communityId);
  };

  const leaveCommunity = (communityId: string) => {
    socket?.emit('leave-community', communityId);
  };

  const joinConversation = (conversationId: string) => {
    socket?.emit('join-conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave-conversation', conversationId);
  };

  const startTyping = (roomData: { communityId?: string; conversationId?: string }) => {
    socket?.emit('start-typing', roomData);
  };

  const stopTyping = (roomData: { communityId?: string; conversationId?: string }) => {
    socket?.emit('stop-typing', roomData);
  };

  const markMessagesAsRead = (messageIds: string[], conversationId: string) => {
    socket?.emit('mark-messages-read', { messageIds, conversationId });
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    latestNotification,
    joinCommunity,
    leaveCommunity,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
