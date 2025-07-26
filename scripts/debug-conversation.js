require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function debugConversation() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    // Get the exact conversation
    const conversation = await db.collection('conversations').findOne({
      _id: new mongoose.Types.ObjectId('6883070cd3ba205514e54f4a')
    });
    
    console.log('Conversation details:');
    console.log('ID:', conversation._id);
    console.log('Participants raw:', conversation.participants);
    console.log('Participants length:', conversation.participants.length);
    console.log('Participant types:', conversation.participants.map(p => typeof p));
    console.log('Participant string values:', conversation.participants.map(p => p.toString()));
    
    // Test different query approaches
    const testUserId = '68551cbb981126d63000ced3';
    const testRecipientId = '687606e956d069cefd283ca1';
    
    console.log('\nTesting queries:');
    
    // Test 1: Exact array match with strings
    const test1 = await db.collection('conversations').findOne({
      participants: [testUserId, testRecipientId]
    });
    console.log('Test 1 (string array):', !!test1);
    
    // Test 2: Exact array match with ObjectIds
    const test2 = await db.collection('conversations').findOne({
      participants: [new mongoose.Types.ObjectId(testUserId), new mongoose.Types.ObjectId(testRecipientId)]
    });
    console.log('Test 2 (ObjectId array):', !!test2);
    
    // Test 3: $all with strings
    const test3 = await db.collection('conversations').findOne({
      participants: { $all: [testUserId, testRecipientId] }
    });
    console.log('Test 3 ($all strings):', !!test3);
    
    // Test 4: $all with ObjectIds
    const test4 = await db.collection('conversations').findOne({
      participants: { $all: [new mongoose.Types.ObjectId(testUserId), new mongoose.Types.ObjectId(testRecipientId)] }
    });
    console.log('Test 4 ($all ObjectIds):', !!test4);
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugConversation();
