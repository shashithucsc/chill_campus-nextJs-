import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { NotificationService } from '@/lib/notificationService';
import { NotificationType } from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/notifications/test - Create test notifications (for development)
export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test notifications not available in production' },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { type = 'all', count = 5 } = body;

    const userId = session.user.id;
    const senderName = session.user.name || 'Test User';
    const createdNotifications = [];

    // Define test notification templates
    const testTemplates = {
      post_like: () => NotificationService.notifyPostLike(
        userId, 
        userId, 
        'test-post-id', 
        senderName
      ),
      post_comment: () => NotificationService.notifyPostComment(
        userId, 
        userId, 
        'test-post-id', 
        senderName
      ),
      post_share: () => NotificationService.notifyPostShare(
        userId, 
        userId, 
        'test-post-id', 
        senderName
      ),
      follow: () => NotificationService.notifyFollow(
        userId, 
        userId, 
        senderName
      ),
      message: () => NotificationService.notifyMessage(
        userId, 
        userId, 
        senderName, 
        'Hey there! This is a test message to check notifications.'
      ),
      community_invite: () => NotificationService.notifyCommunityInvite(
        userId, 
        userId, 
        'test-community-id', 
        'Test Community', 
        senderName
      ),
      system_announcement: () => NotificationService.notifySystemAnnouncement(
        userId, 
        'System Update Available', 
        'A new system update is available with exciting features and improvements!',
        '/updates'
      ),
      admin_warning: () => NotificationService.notifyAdminWarning(
        userId, 
        'Test warning - this is for development testing only',
        'Please ignore this test warning notification.'
      ),
      event_reminder: () => NotificationService.notifyEventReminder(
        userId, 
        'Test Event', 
        new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        'test-event-id'
      )
    };

    if (type === 'all') {
      // Create one of each type
      const types = Object.keys(testTemplates);
      for (const notificationType of types) {
        try {
          const notification = await testTemplates[notificationType as keyof typeof testTemplates]();
          createdNotifications.push(notification);
        } catch (error) {
          console.error(`Error creating ${notificationType} notification:`, error);
        }
      }
    } else if (testTemplates[type as keyof typeof testTemplates]) {
      // Create specific type
      for (let i = 0; i < count; i++) {
        try {
          const notification = await testTemplates[type as keyof typeof testTemplates]();
          createdNotifications.push(notification);
        } catch (error) {
          console.error(`Error creating ${type} notification:`, error);
        }
      }
    } else {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 }
      );
    }

    // Create some additional mixed notifications for variety
    if (type === 'all' || type === 'mixed') {
      const mixedNotifications = [
        {
          type: NotificationType.POST_COMMENT,
          title: 'New comment on your post',
          message: 'Someone left an interesting comment on your recent post about campus life.',
          priority: 'medium' as const,
          actionUrl: '/post/campus-life-post'
        },
        {
          type: NotificationType.COMMUNITY_POST,
          title: 'New post in Study Group',
          message: 'A new study material was shared in the Computer Science study group.',
          priority: 'low' as const,
          actionUrl: '/community/cs-study-group'
        },
        {
          type: NotificationType.EVENT_REMINDER,
          title: 'Upcoming: Tech Meetup',
          message: 'The weekly tech meetup is happening tomorrow at 6 PM in the main hall.',
          priority: 'high' as const,
          actionUrl: '/events/tech-meetup'
        }
      ];

      for (const notifData of mixedNotifications) {
        try {
          const notification = await NotificationService.createNotification({
            recipientId: userId,
            senderId: userId,
            type: notifData.type,
            title: notifData.title,
            message: notifData.message,
            priority: notifData.priority,
            actionUrl: notifData.actionUrl
          });
          createdNotifications.push(notification);
        } catch (error) {
          console.error('Error creating mixed notification:', error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Created ${createdNotifications.length} test notifications`,
        count: createdNotifications.length,
        notifications: createdNotifications.map(n => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message
        }))
      }
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create test notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/test - Get available test types
export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoints not available in production' },
        { status: 403 }
      );
    }

    const testTypes = [
      'all',
      'post_like',
      'post_comment', 
      'post_share',
      'follow',
      'message',
      'community_invite',
      'system_announcement',
      'admin_warning',
      'event_reminder',
      'mixed'
    ];

    return NextResponse.json({
      success: true,
      data: {
        availableTypes: testTypes,
        usage: {
          endpoint: '/api/notifications/test',
          method: 'POST',
          body: {
            type: 'Type of notification (default: all)',
            count: 'Number of notifications to create (default: 5, only for specific types)'
          },
          examples: [
            { type: 'all', description: 'Creates one of each notification type' },
            { type: 'post_like', count: 3, description: 'Creates 3 post like notifications' },
            { type: 'mixed', description: 'Creates varied real-world notifications' }
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error in test notifications info:', error);
    return NextResponse.json(
      { error: 'Failed to get test info' },
      { status: 500 }
    );
  }
}
