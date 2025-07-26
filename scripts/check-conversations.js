require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkConversations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    console.log('Checking conversations collection...');
    const conversations = await db.collection('conversations').find({}).toArray();
    
    console.log('Total conversations:', conversations.length);
    console.log('='.repeat(50));
    
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ID: ${conv._id}`);
      console.log(`   Participants: ${JSON.stringify(conv.participants)}`);
      console.log(`   Participants length: ${conv.participants?.length || 0}`);
      if (conv.participants && conv.participants.length !== 2) {
        console.log('   ⚠️  MALFORMED: Should have exactly 2 participants');
      }
      console.log();
    });
    
    // Check for conversations with incorrect participant count
    const malformed = conversations.filter(c => !c.participants || c.participants.length !== 2);
    console.log('='.repeat(50));
    console.log(`Malformed conversations (not exactly 2 participants): ${malformed.length}`);
    
    if (malformed.length > 0) {
      console.log('Malformed conversation details:');
      malformed.forEach((conv, index) => {
        console.log(`${index + 1}. ID: ${conv._id}, Participants: ${JSON.stringify(conv.participants)}`);
      });
    }
    
    // Check for duplicate conversations
    const participantGroups = new Map();
    conversations.forEach(conv => {
      if (conv.participants && conv.participants.length === 2) {
        const sortedParticipants = [...conv.participants].sort().join(',');
        if (!participantGroups.has(sortedParticipants)) {
          participantGroups.set(sortedParticipants, []);
        }
        participantGroups.get(sortedParticipants).push(conv._id);
      }
    });
    
    const duplicates = Array.from(participantGroups.entries()).filter(([key, convIds]) => convIds.length > 1);
    console.log(`Duplicate conversations: ${duplicates.length}`);
    if (duplicates.length > 0) {
      duplicates.forEach(([participants, convIds]) => {
        console.log(`Participants ${participants}: ${convIds.length} conversations - IDs: ${convIds.join(', ')}`);
      });
    }
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConversations();
