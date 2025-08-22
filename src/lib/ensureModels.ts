import mongoose from 'mongoose';

// Import all models to ensure they're registered
// import User from '@/models/User';
// import Post from '@/models/Post';
// import Community from '@/models/Community';
// import Notification from '@/models/Notification';

// This function ensures all models are properly registered before use
export function ensureModelsRegistered() {
  // Make sure all models are registered with Mongoose
  const registeredModels = mongoose.modelNames();
  
  console.log('✅ Registered Mongoose models:', registeredModels);
  
  // Check if our core models are registered
  const requiredModels = ['User', 'Post', 'Community', 'Notification'];
  const missingModels = requiredModels.filter(model => !registeredModels.includes(model));
  
  if (missingModels.length > 0) {
    console.warn(`⚠️ Warning: The following models are not registered: ${missingModels.join(', ')}`);
  }
}

export default ensureModelsRegistered;
