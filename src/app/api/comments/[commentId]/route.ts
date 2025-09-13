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
    
    // Check if this is a reply to another comment or a main comment
    let isReply = false;
    let parentComment = null;
    
    // Look for the parent comment that has this reply
    const parentWithReply = await Comment.findOne({
      'replies._id': commentId
    });
    
    if (parentWithReply) {
      isReply = true;
      parentComment = parentWithReply;
      
      // Get the reply details
      const reply = parentWithReply.replies.find(
        (r: any) => r._id.toString() === commentId
      );
      
      if (!reply) {
        return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
      }
      
      // Check if user wrote this reply
      const _isReplyAuthor = reply.user.toString() === userId;
      
      // Check if user owns the post
      const post = await Post.findById(parentWithReply.post);
      const isPostOwner = post && post.user.toString() === userId;
      
      // Make sure user can delete this reply
      if (!isReplyAuthor && !isPostOwner) {
        return NextResponse.json({ 
          error: 'You are not authorized to delete this reply' 
        }, { status: 403 });
      }
      
      // Delete the reply from the parent comment
      await Comment.updateOne(
        { _id: parentWithReply._id },
        { 
          $pull: { replies: { _id: new mongoose.Types.ObjectId(commentId) } },
          $inc: { replyCount: -1 }
        }
      );
      
      return NextResponse.json({ success: true });
    } 
    
    // Handle as a main comment
    const comment = await Comment.findById(commentId).populate('post');
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    // Check if user wrote the comment or owns the post
    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.user.toString() === userId;
    const isPostOwner = post && post.user.toString() === userId;
    
    if (!isCommentAuthor && !isPostOwner) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this comment' 
      }, { status: 403 });
    }
    
    // If this is a main comment, delete all replies first
    if (!comment.parentComment) {
      // Delete all replies to this comment
      await Comment.deleteMany({ parentComment: commentId });
    } else {
      // If this is a reply, reduce the parent's reply count
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $inc: { replyCount: -1 } }
      );
    }
    
    // Remove the comment
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
