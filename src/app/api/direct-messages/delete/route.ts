import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DirectMessage from '@/models/DirectMessage';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

// DELETE individual direct message
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json(
        { error: 'Valid message ID is required' },
        { status: 400 }
      );
    }

    // Find the message
    const message = await DirectMessage.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

  const userId = (session.user as any).id;
    
    // Check if user is the sender or recipient
    const isMessageOwner = message.sender.toString() === userId;
    const isRecipient = message.recipient.toString() === userId;

    if (!isMessageOwner && !isRecipient) {
      return NextResponse.json(
        { error: 'Access denied. You can only delete messages you sent or received.' },
        { status: 403 }
      );
    }

    // Delete the message
    await DirectMessage.findByIdAndDelete(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting direct message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

// POST - Delete entire conversation
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
    const { recipientId, deleteType } = body;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json(
        { error: 'Valid recipient ID is required' },
        { status: 400 }
      );
    }

  const userId = (session.user as any).id;

    if (deleteType === 'all') {
      // Delete all messages between the two users
      const result = await DirectMessage.deleteMany({
        $or: [
          { sender: userId, recipient: recipientId },
          { sender: recipientId, recipient: userId }
        ]
      });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} messages from the conversation`,
        deletedCount: result.deletedCount
      });

    } else if (deleteType === 'sent') {
      // Delete only messages sent by the current user
      const result = await DirectMessage.deleteMany({ 
        sender: userId,
        recipient: recipientId
      });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} messages you sent`,
        deletedCount: result.deletedCount
      });

    } else if (deleteType === 'received') {
      // Delete only messages received by the current user
      const result = await DirectMessage.deleteMany({ 
        sender: recipientId,
        recipient: userId
      });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} messages you received`,
        deletedCount: result.deletedCount
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid delete type. Use "all", "sent", or "received".' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting direct message conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
