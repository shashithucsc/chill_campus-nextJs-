import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import DirectMessage from '@/models/DirectMessage';
import Notification from '@/models/Notification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();

    const { action, communityId, conversationId, lastTimestamp } = req.query;
    const userId = session.user.id;

    // Parse timestamp filter
    const timestampFilter = lastTimestamp 
      ? { createdAt: { $gt: new Date(lastTimestamp as string) } }
      : { createdAt: { $gt: new Date(Date.now() - 30000) } }; // Last 30 seconds

    switch (action) {
      case 'community-messages':
        if (!communityId) {
          return res.status(400).json({ error: 'Community ID required' });
        }

        const communityMessages = await Message.find({
          community: communityId,
          ...timestampFilter
        })
        .populate('author', 'name image')
        .populate('community', 'name')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        return res.status(200).json({
          success: true,
          messages: communityMessages.reverse(), // Reverse to get chronological order
          timestamp: new Date().toISOString()
        });

      case 'conversation-messages':
        if (!conversationId) {
          return res.status(400).json({ error: 'Conversation ID required' });
        }

        const directMessages = await DirectMessage.find({
          conversation: conversationId,
          ...timestampFilter
        })
        .populate('sender', 'name image')
        .populate('conversation')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        return res.status(200).json({
          success: true,
          messages: directMessages.reverse(), // Reverse to get chronological order
          timestamp: new Date().toISOString()
        });

      case 'notifications':
        const notifications = await Notification.find({
          recipient: userId,
          isRead: false,
          ...timestampFilter
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        return res.status(200).json({
          success: true,
          notifications,
          timestamp: new Date().toISOString()
        });

      case 'online-users':
        // For fallback mode, we can't track real-time online users
        // So we return a simplified response or recent active users
        return res.status(200).json({
          success: true,
          users: [], // Empty array since we can't track real-time presence
          message: 'Real-time presence tracking not available in fallback mode',
          timestamp: new Date().toISOString()
        });

      case 'typing-status':
        // For fallback mode, typing indicators are not practical
        return res.status(200).json({
          success: true,
          typingUsers: [],
          message: 'Real-time typing indicators not available in fallback mode',
          timestamp: new Date().toISOString()
        });

      case 'health-check':
        // Simple health check for the fallback system
        return res.status(200).json({
          success: true,
          fallback: true,
          mode: 'polling',
          timestamp: new Date().toISOString(),
          message: 'Fallback polling system is active'
        });

      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          supportedActions: [
            'community-messages',
            'conversation-messages', 
            'notifications',
            'online-users',
            'typing-status',
            'health-check'
          ]
        });
    }
  } catch (error) {
    console.error('Fallback API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}
