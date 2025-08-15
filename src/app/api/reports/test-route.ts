import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';

// Simple test endpoint first
export async function POST(req: NextRequest) {
  try {
    console.log('Report API: Test endpoint hit');
    
    // Basic session check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Report API: Session valid for user', (session.user as any).id);

    // Basic database connection
    await connectDB();
    console.log('Report API: Database connected');

    // Parse request body
    const body = await req.json();
    console.log('Report API: Request body received', body);

    const { postId, reason, description } = body;

    // Basic validation
    if (!postId || !reason || !description) {
      return NextResponse.json({ 
        error: 'Post ID, reason, and description are required' 
      }, { status: 400 });
    }

    // For now, just return success without database operations
    return NextResponse.json({ 
      success: true,
      message: 'Report API is working',
      data: { postId, reason, description, userId: (session.user as any).id }
    });

  } catch (error) {
    console.error('Report API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}
