# Fixing Model Registration Issues in Next.js App

This document provides solutions for resolving the "Schema hasn't been registered for model 'Community'" error and related Mongoose model registration issues.

## Root Cause

The error occurs due to the way Next.js handles server components and API routes, which can cause model registration issues:

1. **Multiple instances** - Next.js may create multiple instances of models across different API routes
2. **Order of registration** - Models with dependencies need to be registered in the correct order
3. **TypeScript vs JavaScript** - Scripts need special handling for TypeScript models

## Solution Implemented

We've implemented the following solutions:

### 1. Centralized Model Registration

Created a `registerModels.ts` utility that properly registers all models in the correct dependency order:

```typescript
// src/lib/registerModels.ts
export function registerAllModels() {
  // Register models in dependency order
  require('../models/User');
  require('../models/Community');
  require('../models/Post');
  require('../models/Notification');
  
  // Log registered models for debugging
  console.log('✅ Models registered:', mongoose.modelNames());
}
```

### 2. Robust Model Exports

Updated the Community model export pattern to be more resilient:

```typescript
// src/models/Community.ts
// Check if the model exists before creating it
let CommunityModel: mongoose.Model<ICommunity>;

try {
  // Try to get the existing model
  CommunityModel = mongoose.model<ICommunity>(COMMUNITY_MODEL_NAME);
} catch (error) {
  // Model doesn't exist, create it
  CommunityModel = mongoose.model<ICommunity>(COMMUNITY_MODEL_NAME, communitySchema);
}

// Export the model
export default CommunityModel;
```

### 3. Database Connection Enhancements

Modified the database connection to automatically register models:

```typescript
// src/lib/db.ts
async function dbConnect() {
  // ...connection logic...
  
  if (cached.conn) {
    // Even with cached connection, ensure models are registered
    registerAllModels();
    return cached.conn;
  }
  
  // ...more connection logic...
}
```

### 4. Explicit Model Imports

Updated the Post model to explicitly import dependencies:

```typescript
// src/models/Post.ts
import './User'; // This ensures User model is registered
import './Community'; // This ensures Community model is registered
```

## Testing

A diagnostic script `check-model-registration.js` is available to verify model registration:

```bash
node scripts/check-model-registration.js
```

## Additional Resources

For development testing:
- `scripts/create-test-posts.js` - Create test data for the feed
- `scripts/cleanup-test-posts.js` - Remove test data when done
