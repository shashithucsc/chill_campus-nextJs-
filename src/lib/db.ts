import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: any; promise: Promise<any> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Handle missing MongoDB URI more gracefully
if (!MONGODB_URI && process.env.NODE_ENV !== 'test') {
  console.warn('MongoDB URI not found. Database operations will be limited.');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Return early if no MongoDB URI is available
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    try {
      cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    } catch (error) {
      console.error('Database connection error:', error);
      return null;
    }
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Database connection failed:', error);
    cached.promise = null; // Reset promise on failure
    return null;
  }
}

export default dbConnect;
