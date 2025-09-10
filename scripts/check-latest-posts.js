require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('🔍 Checking latest posts for Cloudinary URLs...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(3);
    
    console.log('📊 Latest 3 posts:');
    console.log('==========================================');
    
    posts.forEach((post, i) => {
      console.log(`\n📝 Post #${i+1} (ID: ${post._id})`);
      console.log(`   Content: "${post.content.substring(0, 50)}..."`);
      console.log(`   Created: ${post.createdAt}`);
      
      if (post.media && post.media.length > 0) {
        console.log(`   Media URLs (${post.media.length}):`);
        post.media.forEach((url, j) => {
          console.log(`     ${j+1}. ${url}`);
          if (url.includes('cloudinary.com')) {
            console.log(`        ✅ CLOUDINARY URL - Working!`);
          } else {
            console.log(`        ⚠️ LOCAL PATH - Old format`);
          }
        });
      } else {
        console.log(`   Media: None`);
      }
    });
    
    mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  });
