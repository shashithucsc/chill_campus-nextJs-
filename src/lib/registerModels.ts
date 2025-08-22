import mongoose from 'mongoose';

/**
 * Registers all models in the correct order to avoid circular dependencies
 * This function ensures all models are loaded and registered with Mongoose
 * before they're used in the application
 */
export function registerAllModels() {
  try {
    // Log what models are already registered
    const registeredBefore = mongoose.modelNames();
    console.log('📋 Models registered before:', registeredBefore);
    
    // Import models in dependency order
    // Core models first
    import('../models/User');
    import('../models/Community');
    
    // Models that depend on core models
    import('../models/Post');
    import('../models/Notification');
    
    // Log what models are registered after
    const registeredAfter = mongoose.modelNames();
    console.log('✅ Models registered after:', registeredAfter);
    
    // Check for missing models
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
 * Helper function to ensure a specific model is registered
 * @param modelName The name of the model to register
 * @returns The registered model
 */
export function ensureModelRegistered(modelName: string) {
  try {
    // Try to get the model first
    return mongoose.model(modelName);
  } catch (error) {
    // If model isn't registered, register all models
    registerAllModels();
    // Try to get the model again
    return mongoose.model(modelName);
  }
}

// Export as default for convenience
export default registerAllModels;
