const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Simple Post schema for testing
const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  media: [String],
  mediaType: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

async function checkPostsAndCloudinary() {
  console.log('🔍 Checking posts and Cloudinary usage...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Post = mongoose.model('Post', PostSchema);
    
    // Get all posts
    const posts = await Post.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`📊 Found ${posts.length} recent posts`);
    console.log('');
    
    if (posts.length === 0) {
      console.log('ℹ️ No posts found in database yet.');
      console.log('💡 Create a post with an image to test Cloudinary integration!');
      return;
    }
    
    console.log('📋 Analyzing recent posts:');
    console.log('==========================================');
    
    let cloudinaryPosts = 0;
    let localPosts = 0;
    let postsWithMedia = 0;
    
    posts.forEach((post, index) => {
      console.log(`\n📝 Post #${index + 1} (ID: ${post._id})`);
      console.log(`   Content: "${post.content?.substring(0, 50)}${post.content?.length > 50 ? '...' : ''}"`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   Media Type: ${post.mediaType || 'none'}`);
      
      if (post.media && post.media.length > 0) {
        postsWithMedia++;
        console.log(`   Media URLs (${post.media.length}):`);
        
        post.media.forEach((url, urlIndex) => {
          console.log(`     ${urlIndex + 1}. ${url}`);
          
          if (url.includes('res.cloudinary.com')) {
            console.log(`        ✅ CLOUDINARY URL - This is stored correctly!`);
            cloudinaryPosts++;
          } else if (url.includes('/uploads/') || url.startsWith('/')) {
            console.log(`        ⚠️ LOCAL PATH - This should be migrated to Cloudinary`);
            localPosts++;
          } else {
            console.log(`        🤔 UNKNOWN URL TYPE`);
          }
        });
      } else {
        console.log(`   Media: None`);
      }
    });
    
    console.log('\n==========================================');
    console.log('📊 SUMMARY:');
    console.log(`   Total posts analyzed: ${posts.length}`);
    console.log(`   Posts with media: ${postsWithMedia}`);
    console.log(`   Posts using Cloudinary: ${cloudinaryPosts}`);
    console.log(`   Posts using local storage: ${localPosts}`);
    console.log('');
    
    if (cloudinaryPosts > 0) {
      console.log('✅ GREAT! Your posts are using Cloudinary URLs!');
      console.log('   This means your migration is working correctly.');
    } else if (localPosts > 0) {
      console.log('⚠️ Found posts with local file paths.');
      console.log('   New posts should use Cloudinary, but old posts might still have local paths.');
    } else if (postsWithMedia === 0) {
      console.log('ℹ️ No posts with media found.');
      console.log('💡 Try creating a new post with an image to test Cloudinary!');
    }
    
    console.log('');
    console.log('🎯 How it works:');
    console.log('   1. When you upload a file in a post, it goes to Cloudinary');
    console.log('   2. Cloudinary returns a URL like: https://res.cloudinary.com/...');
    console.log('   3. This URL is stored in MongoDB in the post.media array');
    console.log('   4. When displaying posts, we fetch the URL from MongoDB');
    console.log('   5. The browser loads images directly from Cloudinary CDN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

checkPostsAndCloudinary();
