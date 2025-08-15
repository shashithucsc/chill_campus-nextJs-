import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DirectMessage from '@/models/DirectMessage';
import Conversation from '@/models/Conversation';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

  const userId = new mongoose.Types.ObjectId((session.user as any).id);

    // Mark all unread messages as read for this user in this conversation
    await DirectMessage.updateMany(
      {
        conversation: conversationId,
        recipient: userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    // Update the conversation's unread count for this user
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          [`unreadCount.${userId}`]: 0
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
