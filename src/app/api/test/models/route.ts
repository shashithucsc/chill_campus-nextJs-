import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    
    // Try to import the models
    const Comment = await import('@/models/Comment');
    const Post = await import('@/models/Post');
    const User = await import('@/models/User');
    
    return NextResponse.json({
      success: true,
      message: 'Models imported successfully',
      models: {
        Comment: !!Comment.default,
        Post: !!Post.default,
        User: !!User.default
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Model import error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
