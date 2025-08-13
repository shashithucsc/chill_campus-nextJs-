import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// GET: fetch all comments for a post with replies and reactions - FIXED NULL HANDLING
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    console.log('GET /api/posts/[id]/comments - Database connected');
    
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) {
      console.log('GET /api/posts/[id]/comments - Missing post ID');
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    const id = resolvedParams.id;
    console.log('GET /api/posts/[id]/comments - Fetching comments for post:', id);
    
    // Fetch main comments (not replies) - handle both null and undefined parentComment
    const comments = await Comment.find({ 
      post: id, 
      $or: [
        { parentComment: { $exists: false } },
        { parentComment: null },
        { parentComment: undefined }
      ]
    })
    .populate('user', 'fullName avatar')
    .populate('replies.user', 'fullName avatar')
    .populate('reactions.user', 'fullName avatar')
    .populate('replies.reactions.user', 'fullName avatar')
    .sort({ createdAt: -1 });

    console.log('GET /api/posts/[id]/comments - Found comments:', comments.length);
    console.log('GET /api/posts/[id]/comments - Raw comments data:', comments.map(c => ({ 
      id: c._id?.toString(), 
      post: c.post?.toString(), 
      user: c.user?.toString(),
      content: c.content,
      parentComment: c.parentComment 
    })));

    // Filter out comments with invalid _id
    const validComments = comments.filter(comment => comment._id && comment._id !== undefined);
    console.log('GET /api/posts/[id]/comments - Valid comments after filtering:', validComments.length);

    const formattedComments = validComments.map((comment: any) => ({
      _id: comment._id?.toString() || 'unknown',
      user: {
        id: comment.user?._id?.toString() || 'unknown',
        name: comment.user?.fullName || 'Unknown',
        avatar: comment.user?.avatar || '/default-avatar.png',
      },
      content: comment.content,
      reactions: comment.reactions?.map((reaction: any) => ({
        user: {
          id: reaction.user?._id?.toString() || 'unknown',
          name: reaction.user?.fullName,
          avatar: reaction.user?.avatar || '/default-avatar.png',
        },
        type: reaction.type,
        createdAt: reaction.createdAt
      })) || [],
      replies: comment.replies?.map((reply: any) => ({
        _id: reply._id?.toString() || 'unknown',
        user: {
          id: reply.user?._id?.toString() || 'unknown',
          name: reply.user?.fullName || 'Unknown',
          avatar: reply.user?.avatar || '/default-avatar.png',
        },
        content: reply.content,
        reactions: reply.reactions?.map((reaction: any) => ({
          user: {
            id: reaction.user?._id?.toString() || 'unknown',
            name: reaction.user?.fullName,
            avatar: reaction.user?.avatar || '/default-avatar.png',
          },
          type: reaction.type,
          createdAt: reaction.createdAt
        })) || [],
        createdAt: reply.createdAt
      })) || [],
      replyCount: comment.replyCount || 0,
      createdAt: comment.createdAt,
    }));

    console.log('GET /api/posts/[id]/comments - Returning formatted comments:', formattedComments.length);
    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("GET /api/posts/[id]/comments - Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST: add a comment to a post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    console.log('POST /api/posts/[id]/comments - Database connected');
    
    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      console.log('POST /api/posts/[id]/comments - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) {
      console.log('POST /api/posts/[id]/comments - Missing post ID');
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }
    
    const id = resolvedParams.id;
    const { content } = await req.json();
    console.log('POST /api/posts/[id]/comments - Request data:', { postId: id, content });
    
    if (!content || !content.trim()) {
      console.log('POST /api/posts/[id]/comments - Empty content');
      return NextResponse.json({ error: 'Empty comment' }, { status: 400 });
    }
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) {
      console.log('POST /api/posts/[id]/comments - User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const post = await Post.findById(id);
    if (!post) {
      console.log('POST /api/posts/[id]/comments - Post not found:', id);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    console.log('POST /api/posts/[id]/comments - Creating comment...');
    
    // Create new comment
    const comment = new Comment({
      post: id,
      user: userId,
      content: content.trim(),
      replies: [],
      reactions: [],
      replyCount: 0
    });
    
    console.log('POST /api/posts/[id]/comments - About to save comment:', {
      post: id,
      user: userId,
      content: content.trim()
    });
    
    await comment.save();
    console.log('POST /api/posts/[id]/comments - Comment saved with ID:', comment._id);
    
    // Populate user data for response
    await comment.populate('user', 'fullName avatar');
    
    const responseData = {
      comment: {
        _id: comment._id.toString(),
        user: {
          id: (comment.user as any)._id.toString(),
          name: (comment.user as any).fullName,
          avatar: (comment.user as any).avatar || '/default-avatar.png',
        },
        content: comment.content,
        reactions: [],
        replies: [],
        replyCount: 0,
        createdAt: comment.createdAt,
      }
    };
    
    console.log('POST /api/posts/[id]/comments - Returning response:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('POST /api/posts/[id]/comments - Error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json({ error: 'Validation error: ' + error.message }, { status: 400 });
      }
      if (error.message.includes('duplicate')) {
        return NextResponse.json({ error: 'Duplicate entry error' }, { status: 409 });
      }
      if (error.message.includes('Cast to ObjectId')) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to add comment', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 });
  }
}
