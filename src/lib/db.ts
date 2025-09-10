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
    // Check if the connection is still alive
    try {
      if (cached.conn.connection.readyState === 1) {
        console.log('✅ Using cached database connection');
        // Even with cached connection, ensure models are registered
        registerAllModels();
        return cached.conn;
      } else {
        console.log('🔄 Cached connection not ready, reconnecting...');
        cached.conn = null;
        cached.promise = null;
      }
    } catch (error) {
      console.log('🔄 Error checking cached connection, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000, // 45 second socket timeout
      heartbeatFrequencyMS: 10000, // Keep connection alive
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2, // Minimum connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      waitQueueTimeoutMS: 5000, // Wait 5 seconds for connection from pool
      retryWrites: true,
      retryReads: true,
      // Add connection event handlers
      maxConnecting: 2, // Allow 2 connections to be made at a time
    };

    try {
      console.log('🔄 Connecting to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ New database connection established');
        
        // Add connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
          console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
          console.log('✅ MongoDB reconnected');
        });
        
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
      
      // Handle specific connection reset errors
      if (error.message.includes('ECONNRESET') || error.message.includes('connection was forcibly closed')) {
        console.error('🔄 Connection was reset, clearing cached connection for retry');
        cached.conn = null;
        cached.promise = null;
      }
    }
    
    cached.promise = null; // reset on failure
    return null;
  }
}

export default dbConnect;
