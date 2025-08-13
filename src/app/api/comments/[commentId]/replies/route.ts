import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// POST: add a reply to a comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    await dbConnect();
    
    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }
    
    const { commentId } = resolvedParams;
    const { content } = await req.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Empty reply' }, { status: 400 });
    }
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    const comment = await Comment.findById(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    
    // Create reply
    const reply = {
      user: userId,
      content: content.trim(),
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    comment.replies.push(reply);
    comment.replyCount = comment.replies.length;
    await comment.save();
    
    // Get the saved reply with its generated _id
    const savedReply = comment.replies[comment.replies.length - 1];
    
    return NextResponse.json({
      reply: {
        _id: savedReply._id?.toString() || 'temp-id',
        user: {
          id: user._id.toString(),
          name: user.fullName,
          avatar: user.avatar || '/default-avatar.png',
        },
        content: reply.content,
        reactions: [],
        createdAt: reply.createdAt,
      }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  }
}
