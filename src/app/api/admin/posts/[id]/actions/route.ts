import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Report from '@/models/Report';

export async function PATCH(
  request: NextRequest,
  context: any // Using broad type to satisfy Next.js route handler typing in current version
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

  const { action, adminNotes } = await request.json();
  const postId = context?.params?.id;
    const adminId = (session.user as any).id;

    // Validate action
    const validActions = ['delete', 'disable', 'enable', 'resolve_reports', 'warn_author', 'suspend_author'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the post
    const post = await Post.findById(postId).populate('user', 'fullName email');
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let result;
    let message = '';

    switch (action) {
      case 'delete':
        // Delete the post
        await Post.findByIdAndDelete(postId);
        
        // Update any reports related to this post
        await Report.updateMany(
          { post: postId, type: 'Post' },
          { 
            status: 'Resolved',
            resolvedBy: adminId,
            resolvedAt: new Date(),
            adminNotes: adminNotes || 'Post deleted by admin'
          }
        );

        result = { deleted: true };
        message = 'Post deleted successfully';
        break;

      case 'disable':
        // Add a disabled field to the post (we'll need to modify the schema)
        await Post.findByIdAndUpdate(postId, {
          $set: { 
            disabled: true,
            disabledBy: adminId,
            disabledAt: new Date(),
            disableReason: adminNotes || 'Disabled by admin'
          }
        });

        result = { disabled: true };
        message = 'Post disabled successfully';
        break;

      case 'enable':
        // Remove disabled status
        await Post.findByIdAndUpdate(postId, {
          $unset: { 
            disabled: 1,
            disabledBy: 1,
            disabledAt: 1,
            disableReason: 1
          }
        });

        result = { enabled: true };
        message = 'Post enabled successfully';
        break;

      case 'resolve_reports':
        // Mark all reports for this post as resolved
        const reportUpdateResult = await Report.updateMany(
          { post: postId, type: 'Post', status: 'Pending' },
          { 
            status: 'Resolved',
            resolvedBy: adminId,
            resolvedAt: new Date(),
            adminNotes: adminNotes || 'Reports resolved by admin'
          }
        );

        result = { reportsResolved: reportUpdateResult.modifiedCount };
        message = `${reportUpdateResult.modifiedCount} reports resolved successfully`;
        break;

      case 'warn_author':
        // Add warning to the post author
        await User.findByIdAndUpdate(post.user, {
          $push: {
            warnings: {
              reason: adminNotes || 'Content violation',
              warnedBy: adminId,
              warnedAt: new Date(),
              postId: postId
            }
          }
        });

        // Resolve reports if any
        await Report.updateMany(
          { post: postId, type: 'Post', status: 'Pending' },
          { 
            status: 'Resolved',
            resolvedBy: adminId,
            resolvedAt: new Date(),
            adminNotes: `Author warned: ${adminNotes || 'Content violation'}`
          }
        );

        result = { authorWarned: true };
        message = 'Author warned successfully';
        break;

      case 'suspend_author':
        // Suspend the post author
        const suspensionDays = 7; // Default 7 days
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + suspensionDays);

        await User.findByIdAndUpdate(post.user, {
          $set: {
            isSuspended: true,
            suspendedAt: new Date(),
            suspendedBy: adminId,
            suspensionEnd: suspensionEnd,
            suspensionReason: adminNotes || 'Content violation'
          }
        });

        // Resolve reports
        await Report.updateMany(
          { post: postId, type: 'Post', status: 'Pending' },
          { 
            status: 'Resolved',
            resolvedBy: adminId,
            resolvedAt: new Date(),
            adminNotes: `Author suspended: ${adminNotes || 'Content violation'}`
          }
        );

        result = { authorSuspended: true, suspensionEnd };
        message = `Author suspended until ${suspensionEnd.toDateString()}`;
        break;

      default:
        return NextResponse.json({ error: 'Action not implemented' }, { status: 400 });
    }

    // Log admin action (you might want to create an AdminActions model)
    console.log(`Admin action: ${action} on post ${postId} by admin ${adminId}`, {
      postAuthor: post.user,
      adminNotes,
      result
    });

    return NextResponse.json({
      success: true,
      message,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin Post Action Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
