import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = (session.user as any).id;

    // Dynamic imports to ensure proper model registration order
    const { default: DirectMessage } = await import('@/models/DirectMessage');
    const { default: User } = await import('@/models/User');
    const { default: Conversation } = await import('@/models/Conversation');

    // Get all conversations for the user (without populate first to test)
    const conversations = await Conversation.find({
      participants: userId
    })
    .sort({ lastMessageAt: -1 })
    .lean();

    // Manually populate participants and lastMessage
    const populatedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        // Get other participants
        const participants = await User.find({
          _id: { $in: conv.participants, $ne: userId }
        }).select('fullName avatar email').lean();

        // Get last message if exists
        let lastMessage = null;
        if (conv.lastMessage) {
          lastMessage = await DirectMessage.findById(conv.lastMessage)
            .select('content timestamp messageType sender')
            .lean();
        }

        return {
          ...conv,
          participants,
          lastMessage
        };
      })
    );

    // Transform conversations for frontend
    const transformedConversations = populatedConversations.map((conv: any) => {
      const otherParticipant = conv.participants[0];
      if (!otherParticipant) return null;

      return {
        _id: conv._id.toString(),
        participant: {
          _id: otherParticipant._id.toString(),
          fullName: otherParticipant.fullName,
          avatar: otherParticipant.avatar || '',
          email: otherParticipant.email
        },
        lastMessage: conv.lastMessage ? {
          _id: conv.lastMessage._id.toString(),
          content: conv.lastMessage.content,
          timestamp: conv.lastMessage.timestamp.toISOString(),
          messageType: conv.lastMessage.messageType,
          isFromMe: conv.lastMessage.sender.toString() === userId
        } : null,
        lastMessageAt: conv.lastMessageAt.toISOString(),
        unreadCount: (conv.unreadCount instanceof Map ? conv.unreadCount.get(userId) : conv.unreadCount?.[userId]) || 0
      };
    }).filter(Boolean);

    return NextResponse.json({
      conversations: transformedConversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
