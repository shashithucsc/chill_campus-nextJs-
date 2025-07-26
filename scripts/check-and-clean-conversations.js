require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkAndCleanConversations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    console.log('Checking conversations collection...');
    const conversations = await db.collection('conversations').find({}).toArray();
    
    console.log('Total conversations:', conversations.length);
    console.log('='.repeat(50));
    
    const malformed = [];
    
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ID: ${conv._id}`);
      console.log(`   Participants: ${JSON.stringify(conv.participants)}`);
      console.log(`   Participants length: ${conv.participants?.length || 0}`);
      console.log(`   Participants type: ${typeof conv.participants}`);
      console.log(`   Is array: ${Array.isArray(conv.participants)}`);
      
      if (!conv.participants || !Array.isArray(conv.participants) || conv.participants.length !== 2) {
        console.log('   ⚠️  MALFORMED: Should have exactly 2 participants');
        malformed.push(conv);
      }
      console.log();
    });
    
    console.log('='.repeat(50));
    console.log(`Malformed conversations found: ${malformed.length}`);
    
    if (malformed.length > 0) {
      console.log('Deleting malformed conversations...');
      for (const conv of malformed) {
        console.log(`Deleting conversation ${conv._id} with participants: ${JSON.stringify(conv.participants)}`);
        await db.collection('conversations').deleteOne({ _id: conv._id });
      }
      console.log(`Deleted ${malformed.length} malformed conversations`);
    }
    
    // Check for conversations with the specific ObjectId from the error
    const problematicId = '687606e956d069cefd283ca1';
    console.log(`\nChecking for conversations containing ObjectId: ${problematicId}`);
    
    const conversationsWithId = await db.collection('conversations').find({
      participants: new mongoose.Types.ObjectId(problematicId)
    }).toArray();
    
    console.log(`Found ${conversationsWithId.length} conversations containing this ObjectId:`);
    conversationsWithId.forEach((conv, index) => {
      console.log(`${index + 1}. ID: ${conv._id}, Participants: ${JSON.stringify(conv.participants)}`);
    });
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCleanConversations();
