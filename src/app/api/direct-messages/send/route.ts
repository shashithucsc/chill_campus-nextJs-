import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DirectMessage from '@/models/DirectMessage';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { getSocketIO, emitToConversation, emitToUser } from '@/lib/socket';
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

  const userId = (session.user as any).id;

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
    // Sort participants to ensure consistent ordering for unique index
    // Convert to ObjectIds for proper database querying
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);
    const sortedParticipants = [userObjectId, recipientObjectId].sort((a, b) => a.toString().localeCompare(b.toString()));
    console.log('Looking for conversation with participants:', sortedParticipants.map(p => p.toString()));
    
    // First, try to find conversation with exact sorted participants array
    let conversation = await Conversation.findOne({
      participants: sortedParticipants
    });

    console.log('Found conversation with exact match:', conversation?._id);

    // If not found with exact match, try with $all and $size to ensure exactly 2 participants
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { 
          $all: [userObjectId, recipientObjectId],
          $size: 2
        }
      });
      console.log('Found conversation with $all match:', conversation?._id);
    }

    if (!conversation) {
      console.log('Creating new conversation with participants:', sortedParticipants.map(p => p.toString()));
      
      // Create new conversation
      conversation = new Conversation({
        participants: sortedParticipants,
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
      
      try {
        await conversation.save();
        console.log('Successfully created conversation:', conversation._id);
      } catch (saveError: any) {
        console.log('Error saving conversation:', saveError);
        
        // If there's any error, try to find existing conversation again
        // This handles race conditions where multiple requests try to create the same conversation
        const existingConv = await Conversation.findOne({
          participants: { 
            $all: [userObjectId, recipientObjectId],
            $size: 2
          }
        });
        
        if (existingConv) {
          console.log('Found existing conversation after save error:', existingConv._id);
          conversation = existingConv;
        } else {
          // If we still can't find or create the conversation, throw the error
          throw saveError;
        }
      }
    }
    
    // Update conversation for both new and existing cases
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentUnread = conversation.unreadCount?.get(recipientId) || 0;
    conversation.unreadCount?.set(recipientId, currentUnread + 1);
    
    // Reset sender's unread count
    conversation.unreadCount?.set(userId, 0);

    await conversation.save();

    // Update message with conversation reference
    message.conversation = conversation._id;
    await message.save();

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

    // Emit real-time message via Socket.IO
    const io = getSocketIO(req as any);
    if (io) {
      // Emit to conversation room
      emitToConversation(io, conversation._id.toString(), 'new-direct-message', {
        message: transformedMessage,
        conversationId: conversation._id.toString()
      });
      
      // Also emit directly to recipient's user room for notifications
      emitToUser(io, recipientId, 'new-direct-message', {
        message: transformedMessage,
        conversationId: conversation._id.toString()
      });
    }

    return NextResponse.json({
      message: transformedMessage,
      success: true
    });

  } catch (error: any) {
    console.error('Error sending direct message:', error);
    console.error('Error code:', error.code);
    console.error('Error keyPattern:', error.keyPattern);
    console.error('Error keyValue:', error.keyValue);
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again.',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
