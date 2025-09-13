import mongoose from 'mongoose';

/**
 * Load all models in the right order to prevent problems
 * This makes sure all models are ready before we use them
 */
export function registerAllModels() {
  try {
    // See what models are already loaded
    const registeredBefore = mongoose.modelNames();
    console.log('📋 Models registered before:', registeredBefore);
    
    // Load models in the right order
    // Main models first
    import('../models/User');
    import('../models/Community');
    
    // Models that need the main models first
    import('../models/Post');
    import('../models/Notification');
    
    // See what models are loaded now
    const registeredAfter = mongoose.modelNames();
    console.log('✅ Models registered after:', registeredAfter);
    
    // See if any models are missing
    const expectedModels = ['User', 'Community', 'Post', 'Notification'];
    const missingModels = expectedModels.filter(model => !registeredAfter.includes(model));
    
    if (missingModels.length > 0) {
      console.warn(`⚠️ Warning: The following models failed to register: ${missingModels.join(', ')}`);
    } else {
      console.log('✅ All expected models registered successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error registering models:', error);
    return false;
  }
}

/**
 * Make sure a model is loaded
 * @param modelName The name of the model to load
 * @returns The loaded model
 */
export function ensureModelRegistered(modelName: string) {
  try {
    // Try to get the model
    return mongoose.model(modelName);
  } catch (error) {
    // If model isn't loaded, load all models
    registerAllModels();
    // Try to get the model again
    return mongoose.model(modelName);
  }
}

// Export as default to make it easier to use
export default registerAllModels;
