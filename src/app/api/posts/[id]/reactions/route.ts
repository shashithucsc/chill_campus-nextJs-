import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import NotificationService from '@/lib/notificationService';
import { registerAllModels } from '@/lib/registerModels';

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
    
    // Register all models to prevent schema errors
    registerAllModels();

    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = context?.params?.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const post = await Post.findById(postId).populate('user', 'fullName email');
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
      
      // Send notification if the post isn't by the current user
      if (post.user && post.user._id.toString() !== userId) {
        try {
          // Get liker's name
          const currentUser = await User.findById(userId).select('fullName');
          const likerName = currentUser?.fullName || 'Someone';
          
          // Send notification to post owner
          await NotificationService.notifyPostLike(
            post.user._id.toString(),
            userId,
            post._id.toString(),
            likerName
          );
          console.log(`✅ Sent like notification to ${post.user._id} from ${likerName}`);
        } catch (notificationError) {
          console.error('Error sending like notification:', notificationError);
          // Don't block the like action if notification fails
        }
      }
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
