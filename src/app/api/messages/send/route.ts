import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import Community from '@/models/Community';
import { getSession } from '@/lib/session';
import { getSocketIO, emitToCommunity } from '@/lib/socket';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Get session to verify user is authenticated
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, communityId, replyTo } = body;

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

    if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        { error: 'Valid community ID is required' },
        { status: 400 }
      );
    }

    // Verify community exists and user is a member
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

  const userId = (session.user as any).id;
    if (!community.members.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied. You must be a member of this community.' },
        { status: 403 }
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
      community: communityId,
      timestamp: new Date(),
      messageType: 'text'
    };

    if (replyTo) {
      // Verify the message being replied to exists
      const originalMessage = await Message.findById(replyTo);
      if (!originalMessage) {
        return NextResponse.json(
          { error: 'Original message not found' },
          { status: 404 }
        );
      }
      messageData.replyTo = replyTo;
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender information for response
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

    // Emit real-time message to community members via Socket.IO
    const io = getSocketIO(req as any);
    if (io) {
      emitToCommunity(io, communityId, 'new-message', {
        message: transformedMessage,
        communityId
      });
    }

    return NextResponse.json({
      message: transformedMessage,
      success: true
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
