require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    console.log('Checking indexes on conversations collection...');
    const indexes = await db.collection('conversations').listIndexes().toArray();
    
    console.log('Indexes found:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique}`);
      console.log(`   Sparse: ${index.sparse}`);
      console.log();
    });
    
    // Let's also check what happens when we try to insert
    const testUserId = '68551cbb981126d63000ced3';
    const testRecipientId = '687606e956d069cefd283ca1';
    const sortedParticipants = [testUserId, testRecipientId].sort();
    
    console.log('Test participants (sorted):', sortedParticipants);
    
    // Try to find existing conversation
    const existing = await db.collection('conversations').findOne({
      participants: sortedParticipants
    });
    console.log('Found existing with exact match:', !!existing);
    
    const existingAll = await db.collection('conversations').findOne({
      participants: { 
        $all: [testUserId, testRecipientId],
        $size: 2
      }
    });
    console.log('Found existing with $all match:', !!existingAll);
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIndexes();
