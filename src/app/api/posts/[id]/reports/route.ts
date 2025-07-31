import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Report Status API: Starting GET request');
    
    const session = await getServerSession(authOptions);
    console.log('Report Status API: Session check', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.email) {
      return NextResponse.json({ hasUserReported: false });
    }

    await connectDB();
    console.log('Report Status API: Database connected');
    
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    console.log('Report Status API: Checking post:', postId);
    
    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('Report Status API: User not found in database');
      return NextResponse.json({ hasUserReported: false });
    }

    // Check if user has reported this post
    const existingReport = await Report.findOne({
      'reportedBy.userId': user._id,
      'reportedContent.postId': new mongoose.Types.ObjectId(postId),
      type: 'Post'
    });

    const hasUserReported = !!existingReport;
    console.log('Report Status API: Report status checked', { hasUserReported, postId, userId: user._id });

    return NextResponse.json({ hasUserReported });

  } catch (error) {
    console.error('Report Status API: Error checking report status:', error);
    
    return NextResponse.json({ 
      hasUserReported: false,
      error: 'Failed to check report status',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}
