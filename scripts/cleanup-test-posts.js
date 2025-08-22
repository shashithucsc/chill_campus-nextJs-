// cleanup-test-posts.js
// Script to remove all test posts from the database
const mongoose = require('mongoose');
const { registerAllModels } = require('../src/lib/registerModels');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Register all models
    registerAllModels();
    
    // Get the Post model
    const Post = mongoose.model('Post');
    
    // Delete all posts with isTestPost flag
    return Post.deleteMany({ isTestPost: true });
  })
  .then((result) => {
    console.log(`✅ Deleted ${result.deletedCount} test posts`);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
  })
  .finally(() => {
    // Close the connection
    mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  });
