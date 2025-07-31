import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// GET: fetch all comments for a post
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
    
    const id = resolvedParams.id;
    const post = await Post.findById(id).populate({
      path: 'comments.user',
      select: 'fullName avatar',
      model: User,
    });
    if (!post) return NextResponse.json({ comments: [] });
    // Comments should be array of { _id, user, content, createdAt }
    const comments = (post.comments || []).map((c: any) => ({
      _id: c._id,
      user: {
        id: c.user?._id?.toString() || '',
        name: c.user?.fullName || 'Unknown',
        avatar: c.user?.avatar || '/default-avatar.png',
      },
      content: c.content,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST: add a comment to a post
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
    
    const id = resolvedParams.id;
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Empty comment' }, { status: 400 });
    }
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    // Create comment object
    const comment = {
      _id: new Date().getTime().toString() + Math.random().toString(36).slice(2),
      user: user._id,
      content,
      createdAt: new Date(),
    };
    post.comments = post.comments || [];
    post.comments.unshift(comment);
    await post.save();
    // Return comment with user info
    return NextResponse.json({
      comment: {
        _id: comment._id,
        user: {
          id: user._id.toString(),
          name: user.fullName,
          avatar: user.avatar || '/default-avatar.png',
        },
        content: comment.content,
        createdAt: comment.createdAt,
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
