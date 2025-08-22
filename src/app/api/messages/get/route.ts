import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
// import User from '@/models/User';
import Community from '@/models/Community';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

interface LeanMessageSender {
  _id: any;
  fullName: string;
  avatar?: string;
  email: string;
}

interface LeanMessageDoc {
  _id: any;
  content: string;
  sender: LeanMessageSender;
  timestamp: Date;
  messageType?: string;
  isEdited?: boolean;
  editedAt?: Date;
  reactions?: any[];
  replyTo?: {
    _id: any;
    content: string;
    sender: { fullName: string };
    timestamp: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
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
    const communityId = searchParams.get('communityId');
    const _page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        { error: 'Valid community ID is required' },
        { status: 400 }
      );
    }

    // Verify user is a member of the community
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

    // Build query for pagination
    const query: any = { community: communityId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // Fetch messages with sender information
    const messages = await Message.find(query)
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
      .lean<LeanMessageDoc[]>();

    // Transform messages for frontend
    const transformedMessages = messages.map(message => ({
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
    }));

    // Reverse to show oldest first (since we queried newest first for pagination)
    transformedMessages.reverse();

    return NextResponse.json({
      messages: transformedMessages,
      hasMore: messages.length === limit,
      community: {
        _id: community._id.toString(),
        name: community.name,
        memberCount: community.members.length
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
