// Script to create test posts in the database
// Run with: node scripts/create-test-posts.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Load environment variables

// Define the Post model
const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    media: [{ type: String }],
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
    comments: { type: Array, default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    disabled: { type: Boolean, default: false },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    disabledAt: { type: Date },
    disableReason: { type: String }
  },
  { timestamps: true }
);

// Define the User model (minimal for this script)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'student' },
  avatar: { type: String }
});

// Initialize models
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  // Connect to MongoDB
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user to use as the author
    const user = await User.findOne().sort({ createdAt: -1 });

    if (!user) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`🧑 Using user: ${user.fullName} (${user._id}) as post author`);

    // Create test posts
    const testPosts = [
      {
        user: user._id,
        content: "Hello everyone! This is a test post to see if our feed is working correctly. Let me know if you can see this! #TestPost #ChillCampus",
        mediaType: null,
        media: []
      },
      {
        user: user._id,
        content: "Just joined the community! Looking forward to connecting with fellow students. What are some good clubs to join on campus?",
        mediaType: null,
        media: []
      },
      {
        user: user._id,
        content: "Check out this amazing view of our campus! #CampusLife #BeautifulDay",
        mediaType: "image",
        media: ["/uploads/1752221215022-j3no.jpeg"]
      },
      {
        user: user._id,
        content: "Study session at the library. Who else is preparing for finals? #StudyMode #Finals",
        mediaType: null,
        media: []
      },
      {
        user: user._id,
        content: "Just discovered this amazing coffee shop near campus. Great place to study! ☕ #CoffeeAndBooks #StudentLife",
        mediaType: null,
        media: []
      }
    ];

    console.log(`🔄 Creating ${testPosts.length} test posts...`);
    
    // Create each post
    for (const postData of testPosts) {
      const post = new Post(postData);
      await post.save();
      console.log(`✅ Created post: ${post._id}`);
    }

    console.log('✅ All test posts created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
main();
