import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/notifications/[id] - Mark notification as read/unread
export async function PUT(
  request: NextRequest,
  context: any
) {
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
    const { isRead } = body;

    // Validate the notification belongs to the user
  const notification = await Notification.findOneAndUpdate(
      { 
    _id: context?.params?.id, 
  recipient: (session.user as any).id 
      },
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    ).populate('sender', 'name username profilePicture');

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Archive notification
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Archive the notification (soft delete)
  const notification = await Notification.findOneAndUpdate(
      { 
    _id: context?.params?.id, 
  recipient: (session.user as any).id 
      },
      { isArchived: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification archived successfully'
    });

  } catch (error) {
    console.error('Error archiving notification:', error);
    return NextResponse.json(
      { error: 'Failed to archive notification' },
      { status: 500 }
    );
  }
}
