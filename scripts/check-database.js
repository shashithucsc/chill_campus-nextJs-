// Check database contents for debugging
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check posts
    const Post = mongoose.model('Post', new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
      disabled: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { timestamps: true }));
    
    const totalPosts = await Post.countDocuments();
    const enabledPosts = await Post.countDocuments({ disabled: { $ne: true } });
    const disabledPosts = await Post.countDocuments({ disabled: true });
    
    console.log('\n📝 Posts Statistics:');
    console.log(`  - Total posts: ${totalPosts}`);
    console.log(`  - Enabled posts: ${enabledPosts}`);
    console.log(`  - Disabled posts: ${disabledPosts}`);
    
    if (totalPosts > 0) {
      const recentPosts = await Post.find()
        .populate('user', 'fullName')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
        
      console.log('\n📰 Recent posts:');
      recentPosts.forEach((post, i) => {
        console.log(`  ${i + 1}. "${post.content.substring(0, 50)}..." by ${post.user?.fullName || 'Unknown'} - ${post.disabled ? 'DISABLED' : 'ENABLED'}`);
      });
    }
    
    // Check conversations
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage' },
      lastMessageAt: { type: Date },
      unreadCount: { type: Map, of: Number }
    }, { timestamps: true }));
    
    const totalConversations = await Conversation.countDocuments();
    console.log(`\n💬 Total conversations: ${totalConversations}`);
    
    if (totalConversations > 0) {
      const recentConversations = await Conversation.find()
        .populate('participants', 'fullName')
        .sort({ lastMessageAt: -1 })
        .limit(5)
        .lean();
        
      console.log('\n💭 Recent conversations:');
      recentConversations.forEach((conv, i) => {
        const participants = conv.participants?.map(p => p.fullName).join(', ') || 'Unknown';
        console.log(`  ${i + 1}. ${participants} - ${conv.lastMessageAt || 'No timestamp'}`);
      });
    }
    
    // Check direct messages
    const DirectMessage = mongoose.model('DirectMessage', new mongoose.Schema({
      content: { type: String, required: true },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      timestamp: { type: Date, default: Date.now },
      messageType: { type: String, default: 'text' }
    }, { timestamps: true }));
    
    const totalMessages = await DirectMessage.countDocuments();
    console.log(`\n📨 Total direct messages: ${totalMessages}`);
    
    // Check users
    const User = mongoose.model('User', new mongoose.Schema({
      fullName: String,
      email: String,
      role: String
    }));
    
    const totalUsers = await User.countDocuments();
    console.log(`\n👥 Total users: ${totalUsers}`);
    
    if (totalUsers > 0) {
      const recentUsers = await User.find().sort({ _id: -1 }).limit(3).lean();
      console.log('\n👤 Recent users:');
      recentUsers.forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.fullName} (${user.email}) - ${user.role || 'user'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
