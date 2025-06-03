import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Try to connect to the database
    await connectToDatabase();
    
    // Get connection status
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return NextResponse.json({
      status: 'success',
      message: 'Database connection test successful',
      details: {
        state: connectionStates[connectionState as keyof typeof connectionStates],
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection test failed',
      error: error.message
    }, { status: 500 });
  }
} 