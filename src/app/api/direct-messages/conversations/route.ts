import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DirectMessage from '@/models/DirectMessage';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
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
    const userId = session.user.id;

    // Get all conversations for the user
    const conversations = await Conversation.find({
      participants: userId,
      'isArchived.${userId}': { $ne: true }
    })
    .populate({
      path: 'participants',
      select: 'fullName avatar email',
      match: { _id: { $ne: userId } } // Exclude current user
    })
    .populate({
      path: 'lastMessage',
      select: 'content timestamp messageType sender'
    })
    .sort({ lastMessageAt: -1 })
    .lean();

    // Transform conversations for frontend
    const transformedConversations = conversations.map(conv => {
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
        unreadCount: conv.unreadCount?.get(userId) || 0,
        isArchived: conv.isArchived?.get(userId) || false
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
