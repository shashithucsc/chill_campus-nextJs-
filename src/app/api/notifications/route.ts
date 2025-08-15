import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Build query
    const query: any = {
  recipient: (session.user as any).id,
      isArchived: false
    };

    if (type) {
      query.type = type;
    }

    if (unreadOnly) {
      query.isRead = false;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get notifications with population
    const notifications = await Notification.find(query)
      .populate('sender', 'name username profilePicture')
      .populate('relatedUser', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
  const unreadCount = await Notification.getUnreadCount((session.user as any).id);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification (for testing/admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      recipient,
      type,
      title,
      message,
      actionUrl,
      priority = 'medium',
      relatedPost,
      relatedComment,
      relatedCommunity,
      relatedUser,
      metadata = {}
    } = body;

    // Validate required fields
    if (!recipient || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: recipient, type, title, message' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await Notification.createNotification({
      recipient: new mongoose.Types.ObjectId(recipient),
  sender: (session.user as any).id ? new mongoose.Types.ObjectId((session.user as any).id) : undefined,
      type,
      title,
      message,
      actionUrl,
      priority,
      relatedPost: relatedPost ? new mongoose.Types.ObjectId(relatedPost) : undefined,
      relatedComment: relatedComment ? new mongoose.Types.ObjectId(relatedComment) : undefined,
      relatedCommunity: relatedCommunity ? new mongoose.Types.ObjectId(relatedCommunity) : undefined,
      relatedUser: relatedUser ? new mongoose.Types.ObjectId(relatedUser) : undefined,
      metadata,
      deliveryMethods: {
        inApp: true,
        email: false,
        push: false
      }
    });

    // Populate for response
    await notification.populate('sender', 'name username profilePicture');
    await notification.populate('relatedUser', 'name username profilePicture');

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
