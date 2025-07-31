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
