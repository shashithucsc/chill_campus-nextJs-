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
    const recipientId = searchParams.get('recipientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json(
        { error: 'Valid recipient ID is required' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    // Verify recipient exists
    const recipient = await User.findById(recipientId).select('fullName avatar email');
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Build query for messages between these two users
    let query: any = {
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    };

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await DirectMessage.find(query)
      .populate({
        path: 'sender',
        select: 'fullName avatar email'
      })
      .populate({
        path: 'replyTo',
        select: 'content sender timestamp',
        populate: {
          path: 'sender',
          select: 'fullName'
        }
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Transform messages for frontend
    const transformedMessages = messages.map((message: any) => ({
      _id: message._id.toString(),
      content: message.content,
      sender: {
        _id: message.sender._id.toString(),
        fullName: message.sender.fullName,
        avatar: message.sender.avatar || '',
        email: message.sender.email
      },
      timestamp: message.timestamp.toISOString(),
      messageType: message.messageType,
      isRead: message.isRead,
      readAt: message.readAt?.toISOString(),
      isEdited: message.isEdited,
      editedAt: message.editedAt?.toISOString(),
      reactions: message.reactions || [],
      replyTo: message.replyTo ? {
        _id: message.replyTo._id.toString(),
        content: message.replyTo.content,
        sender: message.replyTo.sender,
        timestamp: message.replyTo.timestamp.toISOString()
      } : null,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    }));

    // Reverse to show oldest first
    transformedMessages.reverse();

    // Mark messages as read
    await DirectMessage.updateMany(
      {
        sender: recipientId,
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update conversation unread count
    await Conversation.findOneAndUpdate(
      {
        participants: { $all: [userId, recipientId] }
      },
      {
        $set: {
          [`unreadCount.${userId}`]: 0
        }
      }
    );

    return NextResponse.json({
      messages: transformedMessages,
      hasMore: messages.length === limit,
      recipient: {
        _id: recipient._id.toString(),
        fullName: recipient.fullName,
        avatar: recipient.avatar || '',
        email: recipient.email
      }
    });

  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
