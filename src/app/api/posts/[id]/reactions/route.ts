import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// GET: fetch reaction count and user's reaction status for a post
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    
    // Validate that params and id exist
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    const postId = resolvedParams.id;
    
    // Check if user is authenticated to get their reaction status
    const session = await getSession();
    let userReacted = false;
    
    if (session && session.user && (session.user as any).id) {
      const userId = (session.user as any).id;
      const post = await Post.findById(postId);
      if (post && post.likes && Array.isArray(post.likes)) {
        userReacted = post.likes.includes(userId);
      }
    }
    
    // Get the post to count reactions
    const post = await Post.findById(postId).select('likes');
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    const reactionCount = post.likes ? post.likes.length : 0;
    
    return NextResponse.json({
      reactionCount,
      userReacted
    });
    
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}

// POST: toggle reaction on a post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // Check authentication
    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    
    // Validate params
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    const postId = resolvedParams.id;
    const userId = (session.user as any).id;
    
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = [];
    }
    
    // Toggle reaction
    const userIndex = post.likes.indexOf(userId);
    let action = '';
    
    if (userIndex > -1) {
      // User already liked, so unlike
      post.likes.splice(userIndex, 1);
      action = 'unliked';
    } else {
      // User hasn't liked, so like
      post.likes.push(userId);
      action = 'liked';
    }
    
    await post.save();
    
    return NextResponse.json({
      success: true,
      action,
      reactionCount: post.likes.length,
      userReacted: action === 'liked'
    });
    
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
