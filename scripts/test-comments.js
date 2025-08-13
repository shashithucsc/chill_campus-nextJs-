import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

async function testComments() {
  try {
    await dbConnect();
    console.log('Database connected successfully');
    
    // Check if we have any posts
    const posts = await Post.find().limit(5);
    console.log(`Found ${posts.length} posts`);
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      console.log(`First post ID: ${firstPost._id}`);
      
      // Check comments for the first post
      const comments = await Comment.find({ post: firstPost._id });
      console.log(`Found ${comments.length} comments for post ${firstPost._id}`);
      
      // Check old embedded comments
      console.log(`Old embedded comments: ${firstPost.comments?.length || 0}`);
    }
    
    // Check all comments in the Comment collection
    const allComments = await Comment.find();
    console.log(`Total comments in Comment collection: ${allComments.length}`);
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testComments();
