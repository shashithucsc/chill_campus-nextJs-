const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://chillcampus:1234@chillcampuscluster.xryax7f.mongodb.net/?retryWrites=true&w=majority&appName=chillCampusCluster';

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  
  const opts = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
  };

  try {
    await mongoose.connect(MONGODB_URI, opts);
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test connection state
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    console.log('🏠 Database name:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();
