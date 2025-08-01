/**
 * Test script to create sample notifications for testing the notification system
 * Run this script in VS Code terminal: node scripts/test-notifications.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Notification model (simplified for script)
const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  actionUrl: { type: String, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  relatedCommunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deliveryMethods: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);

// User model (simplified for script)
const UserSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  profilePicture: String
});

const User = mongoose.model('User', UserSchema);

async function createTestNotifications() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find first user to use as recipient
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('No users found in database. Please create some users first.');
      return;
    }

    const recipient = users[0];
    const sender = users.length > 1 ? users[1] : users[0];

    console.log(`Creating test notifications for user: ${recipient.name} (${recipient.email})`);

    // Sample notifications
    const sampleNotifications = [
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'post_like',
        title: 'New like on your post',
        message: `${sender.name} liked your post`,
        priority: 'low',
        actionUrl: '/post/sample-post-id',
        relatedUser: sender._id
      },
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'post_comment',
        title: 'New comment on your post',
        message: `${sender.name} commented: "Great post! Really enjoyed reading this."`,
        priority: 'medium',
        actionUrl: '/post/sample-post-id',
        relatedUser: sender._id
      },
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'follow',
        title: 'New follower',
        message: `${sender.name} started following you`,
        priority: 'medium',
        actionUrl: `/profile/${sender._id}`,
        relatedUser: sender._id
      },
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'message',
        title: 'New message',
        message: `${sender.name}: Hey there! How are you doing?`,
        priority: 'high',
        actionUrl: `/messages/${sender._id}`,
        relatedUser: sender._id
      },
      {
        recipient: recipient._id,
        type: 'system_announcement',
        title: 'Welcome to ChillCampus!',
        message: 'Your account has been successfully created. Start exploring and connecting with fellow students!',
        priority: 'medium',
        actionUrl: '/home'
      },
      {
        recipient: recipient._id,
        type: 'event_reminder',
        title: 'Event reminder',
        message: 'Campus Study Group is starting in 1 hour. Don\'t forget to join!',
        priority: 'high',
        actionUrl: '/events/study-group',
        metadata: { eventTitle: 'Campus Study Group', eventDate: new Date() }
      },
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'community_invite',
        title: 'Community invitation',
        message: `${sender.name} invited you to join Computer Science Students`,
        priority: 'high',
        actionUrl: '/community/cs-students/invite',
        relatedUser: sender._id
      },
      {
        recipient: recipient._id,
        type: 'admin_warning',
        title: 'Community guidelines reminder',
        message: 'Please remember to follow our community guidelines when posting content.',
        priority: 'urgent',
        actionUrl: '/support/guidelines',
        metadata: { reason: 'content-guidelines', details: 'Automated reminder' }
      }
    ];

    // Create notifications
    console.log('Creating sample notifications...');
    
    for (const notificationData of sampleNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✓ Created notification: ${notification.title}`);
    }

    // Create some older notifications (some marked as read)
    const olderNotifications = [
      {
        recipient: recipient._id,
        sender: sender._id,
        type: 'post_share',
        title: 'Your post was shared',
        message: `${sender.name} shared your post`,
        priority: 'low',
        isRead: true,
        actionUrl: '/post/sample-post-id',
        relatedUser: sender._id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        recipient: recipient._id,
        type: 'system_announcement',
        title: 'Server maintenance scheduled',
        message: 'We will be performing server maintenance tonight from 2 AM to 4 AM EST.',
        priority: 'medium',
        isRead: true,
        actionUrl: '/announcements',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    for (const notificationData of olderNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✓ Created older notification: ${notification.title}`);
    }

    console.log(`\n✅ Successfully created ${sampleNotifications.length + olderNotifications.length} test notifications!`);
    
    // Count total notifications for this user
    const totalCount = await Notification.countDocuments({ recipient: recipient._id });
    const unreadCount = await Notification.countDocuments({ recipient: recipient._id, isRead: false });
    
    console.log(`📊 Total notifications for ${recipient.name}: ${totalCount}`);
    console.log(`📩 Unread notifications: ${unreadCount}`);
    console.log('\n🎉 Test notifications are ready! You can now test the notification system in the UI.');

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestNotifications();
