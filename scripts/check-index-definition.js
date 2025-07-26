require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkIndexDefinition() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    // Get detailed index information
    const indexInfo = await db.collection('conversations').indexInformation();
    console.log('Index information:', JSON.stringify(indexInfo, null, 2));
    
    const indexes = await db.collection('conversations').listIndexes().toArray();
    console.log('\nDetailed indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index, null, 2)}`);
    });
    
    // Test what happens when we try to create the same structure
    const testUsers = [
      { _id: '6857d2c9c069b2b51f421993', name: 'New User' },
      { _id: '687606e956d069cefd283ca1', name: 'Existing Recipient' },
      { _id: '68551cbb981126d63000ced3', name: 'Existing User' }
    ];
    
    console.log('\nTesting different participant combinations:');
    
    // Test 1: New user + existing recipient (this is failing)
    const combo1 = [new mongoose.Types.ObjectId('6857d2c9c069b2b51f421993'), new mongoose.Types.ObjectId('687606e956d069cefd283ca1')].sort((a, b) => a.toString().localeCompare(b.toString()));
    console.log('Combo 1 (new user + existing recipient):', combo1.map(p => p.toString()));
    
    // Test 2: Existing user + existing recipient (this exists)
    const combo2 = [new mongoose.Types.ObjectId('68551cbb981126d63000ced3'), new mongoose.Types.ObjectId('687606e956d069cefd283ca1')].sort((a, b) => a.toString().localeCompare(b.toString()));
    console.log('Combo 2 (existing user + existing recipient):', combo2.map(p => p.toString()));
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIndexDefinition();
