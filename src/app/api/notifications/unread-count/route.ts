import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { registerAllModels } from '@/lib/registerModels';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/notifications/unread-count - Get unread notifications count
export async function GET() {
  try {
    console.log('🔔 GET /api/notifications/unread-count - Starting request');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session validated for user:', session.user.id);

    const conn = await dbConnect();
    if (!conn) {
      console.error('❌ Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Ensure all models are registered
    registerAllModels();

    try {
      const unreadCount = await Notification.countDocuments({
        recipient: session.user.id,
        isRead: false
      });

      console.log('✅ Unread count retrieved:', unreadCount);

      return NextResponse.json({
        success: true,
        data: {
          unreadCount
        }
      });
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count', details: (error as Error).message },
      { status: 500 }
    );
  }
}
