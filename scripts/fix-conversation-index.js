require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fixConversationIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    const collection = db.collection('conversations');
    
    console.log('Current indexes:');
    const currentIndexes = await collection.listIndexes().toArray();
    currentIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)} (unique: ${index.unique})`);
    });
    
    // Drop the problematic participants_1 index
    console.log('\nDropping problematic participants_1 index...');
    try {
      await collection.dropIndex('participants_1');
      console.log('Successfully dropped participants_1 index');
    } catch (error) {
      console.log('Error dropping index (might not exist):', error.message);
    }
    
    // The issue is that MongoDB's unique index on array fields works element-wise
    // Instead, let's create a compound index or use a different approach
    
    // Option 1: Don't use a unique index at all, handle uniqueness in application code
    // This is actually the better approach for this use case
    
    console.log('\nChecking if conversations collection needs cleaning...');
    const conversations = await collection.find({}).toArray();
    
    // Group conversations by participant pairs to find duplicates
    const participantGroups = new Map();
    conversations.forEach(conv => {
      if (conv.participants && conv.participants.length === 2) {
        const sortedKey = [...conv.participants].sort().map(p => p.toString()).join(',');
        if (!participantGroups.has(sortedKey)) {
          participantGroups.set(sortedKey, []);
        }
        participantGroups.get(sortedKey).push(conv);
      }
    });
    
    // Find and handle duplicates
    let duplicatesFound = 0;
    for (const [participantKey, convs] of participantGroups.entries()) {
      if (convs.length > 1) {
        duplicatesFound++;
        console.log(`Found ${convs.length} conversations for participants: ${participantKey}`);
        
        // Keep the most recent one, delete others
        const sorted = convs.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
        const toKeep = sorted[0];
        const toDelete = sorted.slice(1);
        
        console.log(`  Keeping: ${toKeep._id} (${toKeep.lastMessageAt || toKeep.createdAt})`);
        for (const conv of toDelete) {
          console.log(`  Deleting: ${conv._id} (${conv.lastMessageAt || conv.createdAt})`);
          await collection.deleteOne({ _id: conv._id });
        }
      }
    }
    
    if (duplicatesFound === 0) {
      console.log('No duplicate conversations found');
    } else {
      console.log(`Cleaned up ${duplicatesFound} duplicate conversation groups`);
    }
    
    console.log('\nFinal indexes:');
    const finalIndexes = await collection.listIndexes().toArray();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)} (unique: ${index.unique})`);
    });
    
    mongoose.disconnect();
    console.log('Done! You can now try sending messages again.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixConversationIndex();
