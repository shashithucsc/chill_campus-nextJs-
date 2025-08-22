// import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

export async function GET() {
  try {
    await dbConnect();
    
    // Check posts
    const posts = await Post.find().limit(3);
    const postsInfo = posts.map(p => ({
      id: p._id.toString(),
      oldCommentsCount: p.comments?.length || 0,
      content: p.content.substring(0, 50) + '...'
    }));
    
    // Check new comments
    const newComments = await Comment.find().limit(10);
    const commentsInfo = newComments.map(c => ({
      id: c._id,
      postId: c.post.toString(),
      content: c.content.substring(0, 50) + '...',
      user: c.user.toString(),
      repliesCount: c.replies?.length || 0,
      reactionsCount: c.reactions?.length || 0
    }));
    
    return NextResponse.json({
      success: true,
      postsFound: posts.length,
      posts: postsInfo,
      newCommentsFound: newComments.length,
      comments: commentsInfo
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
