// Simple script to test database models
import mongoose from 'mongoose';
import connectDB from '../lib/db.js';

async function testModels() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test if models exist
    const models = ['User', 'Post', 'Report', 'Community'];
    models.forEach(modelName => {
      if (mongoose.models[modelName]) {
        console.log(`✅ ${modelName} model loaded`);
      } else {
        console.log(`❌ ${modelName} model not found`);
      }
    });
    
    console.log('Model test completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testModels();
