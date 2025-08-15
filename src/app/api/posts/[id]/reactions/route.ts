import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// GET: fetch reaction count and user's reaction status for a post
export async function GET(req: NextRequest, context: any) {
  try {
    await dbConnect();

    const postId = context?.params?.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Auth (optional for like status)
    const session = await getSession();
    let userReacted = false;
    let userId: string | null = null;
    if (session?.user && (session.user as any).id) {
      userId = (session.user as any).id;
    }

    const post = await Post.findById(postId).select('likes');
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (userId && Array.isArray(post.likes)) {
      userReacted = post.likes.some((l: any) => l?.toString() === userId);
    }

    const reactionCount = post.likes ? post.likes.length : 0;

    // Return both naming styles for backward compatibility
    return NextResponse.json({
      reactionCount,
      userReacted,
      likeCount: reactionCount,
      likedByCurrentUser: userReacted
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

// POST: toggle reaction on a post
export async function POST(req: NextRequest, context: any) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = context?.params?.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.likes) post.likes = [];

  const existingIndex = post.likes.findIndex((l: any) => l?.toString() === userId);
    let action: 'liked' | 'unliked';
    if (existingIndex > -1) {
      post.likes.splice(existingIndex, 1);
      action = 'unliked';
    } else {
      post.likes.push(userId); // will be cast to ObjectId
      action = 'liked';
    }

    await post.save();

    const reactionCount = post.likes.length;
    const userReacted = action === 'liked';

    return NextResponse.json({
      success: true,
      action,
      reactionCount,
      userReacted,
      likeCount: reactionCount,
      likedByCurrentUser: userReacted
    });
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
