const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Comment Schema
const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  replies: [],
  reactions: [],
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', CommentSchema);

async function testCommentsQuery() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const postId = '68985b46bd367a1602474b71';
    
    // Test the original query (this might be failing)
    console.log('\n=== Testing original query ===');
    const originalQuery = await Comment.find({ 
      post: postId, 
      parentComment: { $exists: false } 
    });
    console.log('Original query results:', originalQuery.length);
    
    // Test the new query (this should work)
    console.log('\n=== Testing new query ===');
    const newQuery = await Comment.find({ 
      post: postId, 
      $or: [
        { parentComment: { $exists: false } },
        { parentComment: null },
        { parentComment: undefined }
      ]
    });
    console.log('New query results:', newQuery.length);
    
    // Test just looking for null parentComment
    console.log('\n=== Testing null parentComment query ===');
    const nullQuery = await Comment.find({ 
      post: postId, 
      parentComment: null 
    });
    console.log('Null query results:', nullQuery.length);
    
    // Show all comments for this post
    console.log('\n=== All comments for this post ===');
    const allComments = await Comment.find({ post: postId });
    console.log('Total comments for post:', allComments.length);
    allComments.forEach(comment => {
      console.log(`- Comment ID: ${comment._id}, parentComment: ${comment.parentComment}, content: "${comment.content}"`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testCommentsQuery();
