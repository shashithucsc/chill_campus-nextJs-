import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Community from '@/models/Community';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

// DELETE individual message
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
    const message = await Message.findById(messageId).populate('community');
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    
    // Check if user is the sender or community admin
    const community = await Community.findById(message.community._id);
    const isMessageOwner = message.sender.toString() === userId;
    const isAdmin = community?.admin?.toString() === userId;
    const isModerator = community?.moderators?.includes(userId);

    if (!isMessageOwner && !isAdmin && !isModerator) {
      return NextResponse.json(
        { error: 'Access denied. You can only delete your own messages or you must be an admin/moderator.' },
        { status: 403 }
      );
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

// POST - Delete entire conversation (all messages in community)
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
    const { communityId, deleteType } = body;

    if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        { error: 'Valid community ID is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify community exists and get user permissions
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    const isAdmin = community.admin?.toString() === userId;
    const isModerator = community.moderators?.includes(userId);

    if (deleteType === 'all') {
      // Only admins can delete all messages in a community
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Access denied. Only community admins can delete all messages.' },
          { status: 403 }
        );
      }

      // Delete all messages in the community
      const result = await Message.deleteMany({ community: communityId });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} messages from the community`,
        deletedCount: result.deletedCount
      });

    } else if (deleteType === 'own') {
      // Delete only user's own messages in the community
      const result = await Message.deleteMany({ 
        community: communityId,
        sender: userId 
      });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} of your messages from the community`,
        deletedCount: result.deletedCount
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid delete type. Use "all" or "own".' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
