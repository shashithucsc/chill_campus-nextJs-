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
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    // Initialize Socket.IO server with full configuration
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
    
    console.log('Socket.IO server initialized successfully');
  } else {
    console.log('Socket.IO server already running');
  }
  
  res.end();
};

export default ioHandler;
