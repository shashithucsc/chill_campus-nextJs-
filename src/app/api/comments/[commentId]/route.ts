import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';
import { registerAllModels } from '@/lib/registerModels';
import mongoose from 'mongoose';

// DELETE a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await dbConnect();
    registerAllModels();
    
    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { commentId } = await params;
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    const userId = (session.user as any).id;
    
    // First, check if it's a direct reply in a parent comment's replies array
    // We need to identify if we're deleting a top-level comment or a reply
    let isReply = false;
    let parentComment = null;
    
    // Try to find a comment that contains this reply ID in its replies array
    const parentWithReply = await Comment.findOne({
      'replies._id': commentId
    });
    
    if (parentWithReply) {
      isReply = true;
      parentComment = parentWithReply;
      
      // Find the specific reply
      const reply = parentWithReply.replies.find(
        (r: any) => r._id.toString() === commentId
      );
      
      if (!reply) {
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      }
      
      // Check if user is the reply author
      const _isReplyAuthor = reply.user.toString() === userId;
      
      // Get the post to check if user is post owner
      const post = await Post.findById(parentWithReply.post);
      const isPostOwner = post && post.user.toString() === userId;
      
      // Check authorization
      if (!isReplyAuthor && !isPostOwner) {
        return NextResponse.json({ 
          error: 'You are not authorized to delete this reply' 
        }, { status: 403 });
      }
      
      // Remove the reply from the parent comment's replies array
      await Comment.updateOne(
        { _id: parentWithReply._id },
        { 
          $pull: { replies: { _id: new mongoose.Types.ObjectId(commentId) } },
          $inc: { replyCount: -1 }
        }
      );
      
      return NextResponse.json({ success: true });
    } 
    
    // If it's not a reply, handle it as a regular comment
    const comment = await Comment.findById(commentId).populate('post');
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // Check if user is the comment author or the post owner
    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.user.toString() === userId;
    const isPostOwner = post && post.user.toString() === userId;
    
    if (!isCommentAuthor && !isPostOwner) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this comment' 
      }, { status: 403 });
    }
    
    // If it's a parent comment, delete all its replies first
    if (!comment.parentComment) {
      // Find and delete all replies to this comment
      await Comment.deleteMany({ parentComment: commentId });
    } else {
      // If it's a reply, decrement the parent comment's replyCount
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $inc: { replyCount: -1 } }
      );
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ 
      error: 'Failed to delete comment',
      details: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : undefined
    }, { status: 500 });
  }
}
