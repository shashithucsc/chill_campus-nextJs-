// check-model-registration.js
// A script to check if all models are properly registered with Mongoose

const mongoose = require('mongoose');
require('dotenv').config();

// Helper function to get a safe debug view of an object
function safeStringify(obj, indent = 2) {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular Reference]';
        }
        cache.add(value);
      }
      return value;
    },
    indent
  );
}

// Connect to MongoDB
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Load models
    console.log('\n📋 Loading models...');
    
    try {
      require('../src/models/User');
      console.log('✅ User model loaded');
    } catch (err) {
      console.error('❌ Error loading User model:', err.message);
    }
    
    try {
      require('../src/models/Community');
      console.log('✅ Community model loaded');
    } catch (err) {
      console.error('❌ Error loading Community model:', err.message);
    }
    
    try {
      require('../src/models/Post');
      console.log('✅ Post model loaded');
    } catch (err) {
      console.error('❌ Error loading Post model:', err.message);
    }
    
    try {
      require('../src/models/Notification');
      console.log('✅ Notification model loaded');
    } catch (err) {
      console.error('❌ Error loading Notification model:', err.message);
    }

    // Check registered models
    console.log('\n📋 Registered models:');
    const models = mongoose.modelNames();
    console.log(models);

    // Check each model's schema
    console.log('\n📋 Model schemas:');
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        console.log(`\n🔍 ${modelName} schema paths:`);
        console.log(Object.keys(model.schema.paths));
        
        // Check for referenced models in this schema
        console.log(`\n🔗 ${modelName} references:`);
        const references = [];
        
        for (const [pathName, pathConfig] of Object.entries(model.schema.paths)) {
          if (pathConfig.instance === 'ObjectID' && pathConfig.options && pathConfig.options.ref) {
            references.push({
              path: pathName,
              ref: pathConfig.options.ref
            });
          }
          
          // Check for references in array types
          if (pathConfig.instance === 'Array' && 
              pathConfig.schema && 
              pathConfig.schema.paths && 
              pathConfig.schema.paths.type && 
              pathConfig.schema.paths.type.options && 
              pathConfig.schema.paths.type.options.ref) {
            references.push({
              path: `${pathName} (Array)`,
              ref: pathConfig.schema.paths.type.options.ref
            });
          }
        }
        
        if (references.length > 0) {
          console.log(references);
        } else {
          console.log('No references found');
        }
        
      } catch (err) {
        console.error(`❌ Error checking ${modelName} schema:`, err.message);
      }
    }

    // Test retrieving documents
    console.log('\n📋 Testing document retrieval:');
    
    try {
      const User = mongoose.model('User');
      const userCount = await User.countDocuments();
      console.log(`✅ User count: ${userCount}`);
    } catch (err) {
      console.error('❌ Error counting Users:', err.message);
    }
    
    try {
      const Community = mongoose.model('Community');
      const communityCount = await Community.countDocuments();
      console.log(`✅ Community count: ${communityCount}`);
    } catch (err) {
      console.error('❌ Error counting Communities:', err.message);
    }
    
    try {
      const Post = mongoose.model('Post');
      const postCount = await Post.countDocuments();
      console.log(`✅ Post count: ${postCount}`);
      
      // Try to populate a post to check references
      if (postCount > 0) {
        console.log('\n📋 Testing Post population:');
        
        try {
          const post = await Post.findOne().populate('user');
          console.log('✅ Post user populated:', post.user ? 'yes' : 'no');
        } catch (err) {
          console.error('❌ Error populating post user:', err.message);
        }
        
        try {
          const post = await Post.findOne().populate('community');
          console.log('✅ Post community populated:', post.community ? 'yes' : 'no');
        } catch (err) {
          console.error('❌ Error populating post community:', err.message);
        }
      }
    } catch (err) {
      console.error('❌ Error counting Posts:', err.message);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

main();
