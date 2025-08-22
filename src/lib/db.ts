import mongoose from 'mongoose';
import { registerAllModels } from './registerModels';

declare global {
  // Keep mongoose in global to avoid re-connecting in dev
  // eslint-disable-next-line no-var
  var mongoose: { conn: any; promise: Promise<any> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Warn if DB URL is missing (except in tests)
if (!MONGODB_URI && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ MongoDB URI not found. Database operations will be limited.');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Skip if no connection string
  if (!MONGODB_URI) {
    console.error('❌ MongoDB URI is not defined');
    return null;
  }

  if (cached.conn) {
    console.log('✅ Using cached database connection');
    // Even with cached connection, ensure models are registered
    registerAllModels();
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increase timeout for slow connections
      heartbeatFrequencyMS: 10000, // Increased frequency for more reliable connection
      maxPoolSize: 10, // More connections for performance
    };

    try {
      console.log('🔄 Connecting to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ New database connection established');
        // Register all models after successful connection
        registerAllModels();
        return mongoose;
      });
    } catch (error) {
      console.error('❌ Database connection error:', error);
      cached.promise = null;
      return null;
    }
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    // Log additional information about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // If it's a MongoDB error, log more details
      if ((error as any).name === 'MongoServerError') {
        console.error('MongoDB error code:', (error as any).code);
        console.error('MongoDB error codeName:', (error as any).codeName);
      }
    }
    
    cached.promise = null; // reset on failure
    return null;
  }
}

export default dbConnect;
