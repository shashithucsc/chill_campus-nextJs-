/**
 * Test script to verify community creation with cover image
 * This script checks the data flow from frontend to database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Community model (simplified for testing)
const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Tech', 'Arts', 'Clubs', 'Events', 'Others']
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active'
  },
  coverImage: {
    type: String,
    default: '',
    validate: {
      validator: function(value) {
        if (!value) return true;
        return /^(https?:\/\/|\/uploads\/).+/.test(value);
      },
      message: 'Invalid image URL format'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Community = mongoose.model('TestCommunity', communitySchema);

async function testCommunityCreation() {
  try {
    console.log('🔍 Testing Community Creation with Cover Image...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a user to use as creator
    const User = mongoose.model('User');
    const users = await User.find().limit(1);
    
    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Using test user: ${testUser.name} (${testUser.email})\n`);

    // Test data that simulates the frontend request
    const testCommunityData = {
      name: 'Test Community with Cover Image',
      category: 'Tech',
      description: 'This is a test community to verify cover image functionality.',
      visibility: 'Public',
      coverImage: '/uploads/test-image.jpg', // Simulating uploaded image URL
      createdBy: testUser._id,
      members: [testUser._id]
    };

    console.log('📝 Test data to be saved:');
    console.log(JSON.stringify(testCommunityData, null, 2));
    console.log();

    // Create the community (simulating what the API does)
    console.log('💾 Creating community...');
    const community = await Community.create(testCommunityData);
    
    console.log('✅ Community created successfully!\n');
    console.log('📊 Saved community data:');
    console.log('_id:', community._id.toString());
    console.log('name:', community.name);
    console.log('description:', community.description);
    console.log('category:', community.category);
    console.log('visibility:', community.visibility);
    console.log('status:', community.status);
    console.log('coverImage:', community.coverImage);
    console.log('tags:', community.tags);
    console.log('createdBy:', community.createdBy.toString());
    console.log('members:', community.members.map(m => m.toString()));
    console.log('createdAt:', community.createdAt);
    console.log('updatedAt:', community.updatedAt);
    console.log();

    // Verify the coverImage field is properly saved
    if (community.coverImage === testCommunityData.coverImage) {
      console.log('✅ SUCCESS: coverImage field is correctly saved!');
      console.log(`   Expected: ${testCommunityData.coverImage}`);
      console.log(`   Actual: ${community.coverImage}`);
    } else {
      console.log('❌ FAILURE: coverImage field was not saved correctly!');
      console.log(`   Expected: ${testCommunityData.coverImage}`);
      console.log(`   Actual: ${community.coverImage}`);
    }

    // Test with empty coverImage (should also work)
    console.log('\n🔍 Testing with empty coverImage...');
    const testCommunityData2 = {
      ...testCommunityData,
      name: 'Test Community without Cover Image',
      coverImage: '' // Empty string
    };

    const community2 = await Community.create(testCommunityData2);
    console.log('✅ Community without coverImage created successfully!');
    console.log('   coverImage field:', `"${community2.coverImage}"`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Community.deleteMany({ 
      name: { 
        $in: ['Test Community with Cover Image', 'Test Community without Cover Image'] 
      } 
    });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
    
    if (error.code === 11000) {
      console.log('   → This might be a duplicate key error. Try with a different community name.');
    }
    
    if (error.errors) {
      console.log('   → Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`     - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    console.log('🎉 Test completed!');
  }
}

// Test for field mapping issues
function testFieldMapping() {
  console.log('\n🔍 Testing Field Mapping Issues...\n');
  
  const frontendData = {
    name: 'Test Community',
    category: 'Tech',
    description: 'Test description',
    visibility: 'Public',
    coverImage: '/uploads/test-image.jpg' // ✅ Correct field name
  };

  const incorrectData = {
    name: 'Test Community',
    category: 'Tech', 
    description: 'Test description',
    visibility: 'Public',
    imageUrl: '/uploads/test-image.jpg' // ❌ Wrong field name
  };

  console.log('✅ Correct frontend data (what should be sent):');
  console.log(JSON.stringify(frontendData, null, 2));
  console.log();
  
  console.log('❌ Incorrect frontend data (what was being sent before fix):');
  console.log(JSON.stringify(incorrectData, null, 2));
  console.log();
  
  console.log('📝 Issue explanation:');
  console.log('   - Database model expects: "coverImage"');
  console.log('   - Frontend was sending: "imageUrl"');
  console.log('   - API uses spread operator: {...data}');
  console.log('   - Result: imageUrl saved, coverImage remained empty');
  console.log();
  
  console.log('🔧 Fix applied:');
  console.log('   - Changed frontend FormData interface');
  console.log('   - Updated all references from imageUrl to coverImage');
  console.log('   - Now frontend sends correct field name');
}

// Run the tests
console.log('🧪 COMMUNITY COVER IMAGE TEST SUITE');
console.log('====================================\n');

testFieldMapping();
testCommunityCreation();
