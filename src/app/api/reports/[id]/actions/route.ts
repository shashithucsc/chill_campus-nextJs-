import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Post from '@/models/Post';
import User from '@/models/User';
import mongoose from 'mongoose';

// PATCH - Update report status and perform actions
export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    console.log('Report Action API: Starting PATCH request');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

  const { action, adminNotes } = await req.json();
  const { id } = context?.params || {};

    console.log('Report Action API: Processing action', { reportId: id, action });

    // Find the report
    const report = await Report.findById(id)
      .populate('reportedContent.postId')
      .populate('reportedContent.authorId');

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let actionResult = { 
      success: true, 
      message: '', 
      details: {} as { [key: string]: any }
    };

    switch (action) {
      case 'resolve':
        // Mark report as resolved
        report.status = 'Resolved';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        if (adminNotes) report.adminNotes = adminNotes;
        
        await report.save();
        actionResult.message = 'Report marked as resolved';
        break;

      case 'ignore':
        // Mark report as ignored
        report.status = 'Ignored';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        if (adminNotes) report.adminNotes = adminNotes;
        
        await report.save();
        actionResult.message = 'Report marked as ignored';
        break;

      case 'delete_content':
        // Delete the reported post/content
        if (report.type === 'Post' && report.reportedContent.postId) {
          const post = await Post.findById(report.reportedContent.postId);
          if (post) {
            await Post.findByIdAndDelete(report.reportedContent.postId);
            actionResult.details.deletedPost = true;
          }
        }
        
        // Mark report as resolved
        report.status = 'Resolved';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        report.adminNotes = (adminNotes || '') + ' [Content deleted by admin]';
        
        await report.save();
        actionResult.message = 'Content deleted and report resolved';
        break;

      case 'suspend_user':
        // Suspend the user who created the reported content
        if (report.reportedContent.authorId) {
          const reportedUser = await User.findById(report.reportedContent.authorId);
          if (reportedUser) {
            reportedUser.isSuspended = true;
            reportedUser.suspendedAt = new Date();
            reportedUser.suspendedBy = user._id;
            reportedUser.suspensionReason = `Content violation: ${report.reason}`;
            await reportedUser.save();
            actionResult.details.suspendedUser = true;
          }
        }
        
        // Mark report as resolved
        report.status = 'Resolved';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        report.adminNotes = (adminNotes || '') + ' [User suspended by admin]';
        
        await report.save();
        actionResult.message = 'User suspended and report resolved';
        break;

      case 'block_user':
        // Block the user who created the reported content
        if (report.reportedContent.authorId) {
          const reportedUser = await User.findById(report.reportedContent.authorId);
          if (reportedUser) {
            reportedUser.isBlocked = true;
            reportedUser.blockedAt = new Date();
            reportedUser.blockedBy = user._id;
            reportedUser.blockReason = `Content violation: ${report.reason}`;
            await reportedUser.save();
            actionResult.details.blockedUser = true;
          }
        }
        
        // Mark report as resolved
        report.status = 'Resolved';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        report.adminNotes = (adminNotes || '') + ' [User blocked by admin]';
        
        await report.save();
        actionResult.message = 'User blocked and report resolved';
        break;

      case 'warn_user':
        // Send warning to the user (implement notification system if available)
        if (report.reportedContent.authorId) {
          // Here you could implement a notification/warning system
          // For now, we'll just log it in admin notes
          actionResult.details.warnedUser = true;
        }
        
        // Mark report as resolved
        report.status = 'Resolved';
        report.reviewedBy = user._id;
        report.reviewedAt = new Date();
        report.adminNotes = (adminNotes || '') + ' [User warned by admin]';
        
        await report.save();
        actionResult.message = 'User warned and report resolved';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Report Action API: Action completed', actionResult);

    return NextResponse.json({
      ...actionResult,
      report: {
        id: report._id.toString(),
        status: report.status,
        reviewedBy: report.reviewedBy?.toString(),
        reviewedAt: report.reviewedAt,
        adminNotes: report.adminNotes
      }
    });

  } catch (error) {
    console.error('Report Action API: Error performing action:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: 'Failed to perform action',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 });
  }
}
