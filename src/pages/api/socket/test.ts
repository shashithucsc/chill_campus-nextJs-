import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from './io';

const testHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === 'GET') {
    // Test if Socket.IO is properly initialized
    if (res.socket.server.io) {
      const connectedClients = res.socket.server.io.engine.clientsCount;
      res.status(200).json({ 
        success: true, 
        message: 'Socket.IO server is running',
        connectedClients 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Socket.IO server not initialized' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default testHandler;
