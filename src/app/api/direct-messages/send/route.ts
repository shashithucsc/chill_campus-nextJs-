import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DirectMessage from '@/models/DirectMessage';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, recipientId, replyTo } = body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message content cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json(
        { error: 'Valid recipient ID is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Cannot send message to yourself
    if (userId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Validate replyTo if provided
    if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
      return NextResponse.json(
        { error: 'Invalid reply message ID' },
        { status: 400 }
      );
    }

    // Create the message
    const messageData: any = {
      content: content.trim(),
      sender: userId,
      recipient: recipientId,
      timestamp: new Date(),
      messageType: 'text'
    };

    if (replyTo) {
      const originalMessage = await DirectMessage.findById(replyTo);
      if (!originalMessage) {
        return NextResponse.json(
          { error: 'Original message not found' },
          { status: 404 }
        );
      }
      messageData.replyTo = replyTo;
    }

    const message = new DirectMessage(messageData);
    await message.save();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
        lastMessage: message._id,
        lastMessageAt: new Date(),
        unreadCount: new Map([
          [userId, 0],
          [recipientId, 1]
        ]),
        isArchived: new Map([
          [userId, false],
          [recipientId, false]
        ])
      });
    } else {
      // Update existing conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      
      // Increment unread count for recipient
      const currentUnread = conversation.unreadCount?.get(recipientId) || 0;
      conversation.unreadCount?.set(recipientId, currentUnread + 1);
      
      // Reset sender's unread count
      conversation.unreadCount?.set(userId, 0);
    }

    await conversation.save();

    // Populate message for response
    await message.populate({
      path: 'sender',
      select: 'fullName avatar email'
    });

    if (message.replyTo) {
      await message.populate({
        path: 'replyTo',
        select: 'content sender timestamp',
        populate: {
          path: 'sender',
          select: 'fullName'
        }
      });
    }

    // Transform message for frontend
    const transformedMessage = {
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
    };

    return NextResponse.json({
      message: transformedMessage,
      success: true
    });

  } catch (error) {
    console.error('Error sending direct message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
