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

async function fixCommentsWithUndefinedId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const postId = '68985b46bd367a1602474b71';
    
    // Find and remove comments with undefined _id
    console.log('\n=== Finding comments with invalid IDs ===');
    const allComments = await Comment.find({ post: postId });
    console.log(`Found ${allComments.length} total comments for this post`);
    
    let removedCount = 0;
    for (const comment of allComments) {
      if (!comment._id || comment._id === undefined) {
        console.log(`Removing comment with undefined ID: "${comment.content}"`);
        await Comment.deleteOne({ _id: comment._id });
        removedCount++;
      }
    }
    
    console.log(`\nRemoved ${removedCount} comments with invalid IDs`);
    
    // Show remaining valid comments
    console.log('\n=== Remaining valid comments ===');
    const validComments = await Comment.find({ post: postId });
    console.log(`Valid comments remaining: ${validComments.length}`);
    validComments.forEach(comment => {
      console.log(`- ID: ${comment._id}, Content: "${comment.content}"`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixCommentsWithUndefinedId();
