import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { initSocket } from '@/lib/socket';

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: NextApiResponse['socket'] & {
    server: NetServer & {
      io: ServerIO;
    };
  };
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // For Vercel deployment, we need to handle Socket.IO differently
  if (process.env.VERCEL) {
    // On Vercel, we can't use persistent WebSocket connections
    // Return a fallback response
    console.log('Socket.IO not available on Vercel serverless functions');
    res.status(200).json({ 
      message: 'Socket.IO not available in serverless environment',
      fallback: true 
    });
    return;
  }

  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    try {
      // Initialize Socket.IO server with full configuration
      const io = initSocket(res.socket.server);
      res.socket.server.io = io;
      
      console.log('Socket.IO server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error);
      res.status(500).json({ error: 'Failed to initialize Socket.IO' });
      return;
    }
  } else {
    console.log('Socket.IO server already running');
  }
  
  res.end();
};

export default ioHandler;
