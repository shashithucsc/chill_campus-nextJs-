import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import jwt from 'jsonwebtoken';

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
};

// Socket.IO events interface
export interface ServerToClientEvents {
  // Message events
  'new-message': (data: {
    message: any;
    communityId: string;
  }) => void;
  
  'new-direct-message': (data: {
    message: any;
    conversationId: string;
  }) => void;
  
  'message-deleted': (data: {
    messageId: string;
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  'message-edited': (data: {
    message: any;
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  // Notification events
  'notification:new': (data: {
    notification: any;
  }) => void;
  
  // User presence events
  'user-online': (data: { userId: string; timestamp: number }) => void;
  'user-offline': (data: { userId: string; timestamp: number }) => void;
  
  // Typing indicators
  'user-typing': (data: {
    userId: string;
    userName: string;
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  'user-stopped-typing': (data: {
    userId: string;
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  // Read receipts
  'message-read': (data: {
    messageIds: string[];
    conversationId: string;
    readBy: string;
  }) => void;
  
  // Error events
  'error': (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // Join/leave rooms
  'join-community': (communityId: string) => void;
  'leave-community': (communityId: string) => void;
  'join-conversation': (conversationId: string) => void;
  'leave-conversation': (conversationId: string) => void;
  
  // Typing events
  'start-typing': (data: {
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  'stop-typing': (data: {
    communityId?: string;
    conversationId?: string;
  }) => void;
  
  // Message events
  'mark-messages-read': (data: {
    messageIds: string[];
    conversationId: string;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userName: string;
  userEmail: string;
}

// Initialize Socket.IO server
export const initSocket = (httpServer: NetServer): ServerIO => {
  const io = new ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Decode base64 token or verify JWT
      let decoded: any;
      try {
        // Try JWT first
        decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
      } catch {
        // Fallback to base64 decode for simple tokens
        try {
          const decodedString = atob(token);
          decoded = JSON.parse(decodedString);
          
          // Verify token hasn't expired
          if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return next(new Error('Token expired'));
          }
        } catch {
          return next(new Error('Invalid token format'));
        }
      }
      
      if (!decoded.sub && !decoded.email) {
        return next(new Error('Invalid token'));
      }

      // Store user data in socket
      socket.data.userId = decoded.sub || decoded.email;
      socket.data.userName = decoded.name || decoded.email;
      socket.data.userEmail = decoded.email;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userName = socket.data.userName;
    
    console.log(`User ${userName} (${userId}) connected via Socket.IO`);

    // Join user to their personal room for direct messages
    socket.join(`user:${userId}`);
    
    // Broadcast user online status
    socket.broadcast.emit('user-online', {
      userId,
      timestamp: Date.now()
    });

    // Handle joining community rooms
    socket.on('join-community', (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`User ${userName} joined community: ${communityId}`);
    });

    // Handle leaving community rooms
    socket.on('leave-community', (communityId: string) => {
      socket.leave(`community:${communityId}`);
      console.log(`User ${userName} left community: ${communityId}`);
    });

    // Handle joining conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userName} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userName} left conversation: ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('start-typing', (data) => {
      const typingData = {
        userId,
        userName,
        ...data
      };

      if (data.communityId) {
        socket.to(`community:${data.communityId}`).emit('user-typing', typingData);
      } else if (data.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('user-typing', typingData);
      }
    });

    socket.on('stop-typing', (data) => {
      const typingData = {
        userId,
        ...data
      };

      if (data.communityId) {
        socket.to(`community:${data.communityId}`).emit('user-stopped-typing', typingData);
      } else if (data.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('user-stopped-typing', typingData);
      }
    });

    // Handle read receipts
    socket.on('mark-messages-read', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('message-read', {
        ...data,
        readBy: userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${userName} (${userId}) disconnected: ${reason}`);
      
      // Broadcast user offline status
      socket.broadcast.emit('user-offline', {
        userId,
        timestamp: Date.now()
      });
    });
  });

  return io;
};

// Helper function to get Socket.IO instance
export const getSocketIO = (req: any): ServerIO | null => {
  if (req.socket?.server?.io) {
    return req.socket.server.io;
  }
  return null;
};

// Helper function to emit to community
export const emitToCommunity = (io: ServerIO, communityId: string, event: keyof ServerToClientEvents, data: any) => {
  io.to(`community:${communityId}`).emit(event as any, data);
};

// Helper function to emit to conversation
export const emitToConversation = (io: ServerIO, conversationId: string, event: keyof ServerToClientEvents, data: any) => {
  io.to(`conversation:${conversationId}`).emit(event as any, data);
};

// Helper function to emit to specific user
export const emitToUser = (io: ServerIO, userId: string, event: keyof ServerToClientEvents, data: any) => {
  io.to(`user:${userId}`).emit(event as any, data);
};

// Helper function to emit to specific user without requiring io parameter
export const emitToUserDirect = (userId: string, event: keyof ServerToClientEvents, data: any, req?: any) => {
  const io = req?.socket?.server?.io;
  if (!io) {
    console.warn('Socket.IO not initialized, cannot emit event:', event);
    return;
  }
  io.to(`user:${userId}`).emit(event as any, data);
};
