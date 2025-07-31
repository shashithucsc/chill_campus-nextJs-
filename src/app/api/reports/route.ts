import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import Post from '@/models/Post';
import User from '@/models/User';
import mongoose from 'mongoose';

// Report reasons
const REPORT_REASONS = [
  'Inappropriate Content',
  'Harassment',
  'Spam',
  'Misinformation',
  'Violence',
  'Hate Speech',
  'Copyright Violation',
  'Other'
];

// GET - Fetch all reports for admin dashboard
export async function GET(req: NextRequest) {
  try {
    console.log('Report API: Starting GET request for reports list');
    
    const session = await getServerSession(authOptions);
    console.log('Report API: Session check', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('Report API: Database connected');
    
    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      console.log('Report API: User is not admin', { userRole: user?.role });
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');

    // Build filter query
    const filter: any = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { 'reportedBy.name': { $regex: search, $options: 'i' } },
        { 'reportedContent.content': { $regex: search, $options: 'i' } },
        { 'reportedContent.communityName': { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Report API: Filter query', filter);

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);

    // Fetch reports with pagination and populate related data
    const reports = await Report.find(filter)
      .populate('reportedBy.userId', 'fullName avatar email')
      .populate('reportedContent.authorId', 'fullName avatar email')
      .populate('reportedContent.postId', 'content image community')
      .populate('reportedContent.communityId', 'name coverImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    console.log('Report API: Found reports', { 
      count: reports.length, 
      total: totalReports,
      page,
      limit 
    });

    // Format reports for admin dashboard
    const formattedReports = reports.map(report => ({
      id: report._id.toString(),
      type: report.type,
      status: report.status,
      reason: report.reason,
      description: report.description,
      reportedBy: {
        id: report.reportedBy.userId._id?.toString() || '',
        name: report.reportedBy.name,
        avatar: report.reportedBy.avatar || ''
      },
      reportedContent: {
        id: report.reportedContent.postId?._id?.toString() || '',
        text: report.reportedContent.content,
        image: report.reportedContent.postId?.image || null,
        community: {
          id: report.reportedContent.communityId?._id?.toString() || '',
          name: report.reportedContent.communityName || 'Unknown Community'
        },
        author: {
          id: report.reportedContent.authorId._id?.toString() || '',
          name: report.reportedContent.authorId.fullName || 'Unknown User',
          avatar: report.reportedContent.authorId.avatar || ''
        }
      },
      createdAt: report.createdAt,
      reviewedBy: report.reviewedBy?.toString() || null,
      reviewedAt: report.reviewedAt || null,
      adminNotes: report.adminNotes || ''
    }));

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
        hasNext: page < Math.ceil(totalReports / limit),
        hasPrev: page > 1
      },
      stats: {
        pending: await Report.countDocuments({ status: 'Pending' }),
        resolved: await Report.countDocuments({ status: 'Resolved' }),
        ignored: await Report.countDocuments({ status: 'Ignored' })
      }
    });

  } catch (error) {
    console.error('Report API: Error fetching reports:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch reports',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Report API: Starting POST request');
    
    const session = await getServerSession(authOptions);
    console.log('Report API: Session check', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Report API: Connecting to database...');
    await connectDB();
    console.log('Report API: Database connected');
    
    const body = await req.json();
    console.log('Report API: Request body', body);
    
    const { postId, reason, description } = body;

    // Validate required fields
    if (!postId || !reason || !description) {
      console.log('Report API: Missing required fields');
      return NextResponse.json({ 
        error: 'Post ID, reason, and description are required' 
      }, { status: 400 });
    }

    // Validate reason
    if (!REPORT_REASONS.includes(reason)) {
      console.log('Report API: Invalid reason');
      return NextResponse.json({ error: 'Invalid report reason' }, { status: 400 });
    }

    try {
      // Find the user
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        console.log('Report API: User not found in database');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check if the post exists and populate user data
      const post = await Post.findById(postId).populate('user');
      if (!post) {
        console.log('Report API: Post not found');
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      console.log('Report API: Post data', { 
        postId: post._id, 
        postUser: post.user, 
        postUserType: typeof post.user,
        postContent: post.content?.substring(0, 50) 
      });

      // Check if user has already reported this post
      const existingReport = await Report.findOne({
        'reportedBy.userId': user._id,
        'reportedContent.postId': new mongoose.Types.ObjectId(postId),
        type: 'Post'
      });

      if (existingReport) {
        console.log('Report API: User has already reported this post');
        return NextResponse.json({ 
          error: 'You have already reported this post' 
        }, { status: 400 });
      }

      // Create the report
      const report = new Report({
        type: 'Post',
        reason,
        description,
        reportedBy: {
          userId: user._id,
          name: user.fullName || user.name || 'Anonymous',
          avatar: user.avatar || ''
        },
        reportedContent: {
          postId: post._id,
          authorId: typeof post.user === 'object' ? post.user._id : post.user, // Handle both populated and non-populated user
          content: post.content,
          communityId: post.community,
          communityName: post.communityName || ''
        },
        status: 'Pending'
      });

      const savedReport = await report.save();
      console.log('Report API: Report saved successfully', savedReport._id);

      return NextResponse.json({ 
        success: true,
        message: 'Report submitted successfully',
        reportId: savedReport._id.toString()
      });

    } catch (dbError) {
      console.error('Report API: Database operation error:', dbError);
      return NextResponse.json({ 
        error: 'Database error', 
        message: 'Failed to save report',
        details: process.env.NODE_ENV === 'development' ? (dbError as Error).message : undefined 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Report API: Error creating report:', error);
    
    // Always return JSON, never HTML
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: 'Failed to submit report',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 });
  }
}
