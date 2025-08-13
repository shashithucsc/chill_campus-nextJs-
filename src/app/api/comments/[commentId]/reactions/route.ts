import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getSession } from '@/lib/session';

// POST: add or update a reaction to a comment
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
    const { type, replyId } = await req.json();
    
    if (!type || !['like', 'love', 'laugh', 'wow', 'sad', 'angry'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }
    
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    const comment = await Comment.findById(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    
    let targetReactions;
    let targetType = 'comment';
    
    if (replyId) {
      // Reacting to a reply
      const reply = comment.replies.find(r => r._id === replyId);
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      targetReactions = reply.reactions;
      targetType = 'reply';
    } else {
      // Reacting to a comment
      targetReactions = comment.reactions;
    }
    
    // Check if user already reacted
    const existingReactionIndex = targetReactions.findIndex(
      r => r.user.toString() === userId
    );
    
    if (existingReactionIndex >= 0) {
      if (targetReactions[existingReactionIndex].type === type) {
        // Same reaction - remove it (toggle off)
        targetReactions.splice(existingReactionIndex, 1);
      } else {
        // Different reaction - update it
        targetReactions[existingReactionIndex].type = type as any;
        targetReactions[existingReactionIndex].createdAt = new Date();
      }
    } else {
      // New reaction
      targetReactions.push({
        user: userId,
        type: type as any,
        createdAt: new Date()
      });
    }
    
    await comment.save();
    
    return NextResponse.json({
      success: true,
      targetType,
      targetId: replyId || commentId,
      reactions: targetReactions.map(r => ({
        user: { id: r.user.toString() },
        type: r.type,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

// DELETE: remove a reaction
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
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
    const url = new URL(req.url);
    const replyId = url.searchParams.get('replyId');
    
    const userId = (session.user as any).id;
    const comment = await Comment.findById(commentId);
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    
    let targetReactions;
    
    if (replyId) {
      const reply = comment.replies.find(r => r._id === replyId);
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      targetReactions = reply.reactions;
    } else {
      targetReactions = comment.reactions;
    }
    
    // Remove user's reaction
    const reactionIndex = targetReactions.findIndex(
      r => r.user.toString() === userId
    );
    
    if (reactionIndex >= 0) {
      targetReactions.splice(reactionIndex, 1);
      await comment.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
