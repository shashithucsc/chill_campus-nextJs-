import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import _User from '@/models/User';
import _Community from '@/models/Community';
import Report from '@/models/Report';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

  const postId = context?.params?.id;

    // Get post with detailed information
    const post = await Post.findById(postId)
      .populate('user', 'fullName email avatar createdAt warnings isSuspended suspensionEnd')
      .populate('community', 'name description category')
      .lean() as any;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get reports for this post
    const reports = await Report.find({ post: postId, type: 'Post' })
      .populate('reportedBy', 'fullName email')
      .populate('resolvedBy', 'fullName')
      .sort({ createdAt: -1 });

    // Transform post data
    const transformedPost = {
      id: post._id.toString(),
      content: post.content,
      author: {
        id: post.user._id.toString(),
        name: post.user.fullName,
        email: post.user.email,
        avatar: post.user.avatar || '',
        createdAt: post.user.createdAt,
        warningsCount: post.user.warnings?.length || 0,
        isSuspended: post.user.isSuspended || false,
        suspensionEnd: post.user.suspensionEnd
      },
      community: post.community ? {
        id: post.community._id.toString(),
        name: post.community.name,
        description: post.community.description,
        category: post.community.category
      } : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      hasMedia: post.media && post.media.length > 0,
      media: post.media || [],
      mediaType: post.mediaType,
      disabled: post.disabled || false,
      disabledBy: post.disabledBy,
      disabledAt: post.disabledAt,
      disableReason: post.disableReason,
      reports: reports.map(report => ({
        id: report._id.toString(),
        reason: report.reason,
        description: report.description,
        status: report.status,
        reportedBy: {
          id: report.reportedBy._id.toString(),
          name: report.reportedBy.fullName,
          email: report.reportedBy.email
        },
        createdAt: report.createdAt,
        resolvedBy: report.resolvedBy ? {
          id: report.resolvedBy._id.toString(),
          name: report.resolvedBy.fullName
        } : null,
        resolvedAt: report.resolvedAt,
        adminNotes: report.adminNotes
      })),
      reportsCount: reports.length,
      pendingReportsCount: reports.filter(r => r.status === 'Pending').length
    };

    return NextResponse.json({
      success: true,
      post: transformedPost
    });

  } catch (error) {
    console.error('Admin Post Details Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
