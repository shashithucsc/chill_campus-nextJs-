import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Socket as NetSocket } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket } from '@/lib/socket';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    const httpServer: NetServer = res.socket.server;
    const io = initSocket(httpServer);
    
    res.socket.server.io = io;
    console.log('Socket.IO server initialized successfully');
  } else {
    console.log('Socket.IO server already running');
  }

  res.end();
};

export default ioHandler;
