import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { registerAllModels } from '@/lib/registerModels';

export async function GET() {
  try {
    console.log('🧪 Testing posts API prerequisites...');

    // Test 1: Connect to database
    console.log('1️⃣ Testing database connection...');
    const conn = await dbConnect();
    if (!conn) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connected');

    // Test 2: Load models
    console.log('2️⃣ Testing model registration...');
    registerAllModels();
    console.log('✅ Models registered');

    // Test 3: Check settings
    console.log('3️⃣ Testing environment variables...');
    const envVars = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    };
    console.log('Environment check:', envVars);

    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);

    if (missingVars.length > 0) {
      console.warn('⚠️ Missing environment variables:', missingVars);
    } else {
      console.log('✅ All environment variables present');
    }

    return NextResponse.json({
      success: true,
      tests: {
        database: true,
        models: true,
        environment: envVars,
        missingVars: missingVars.length > 0 ? missingVars : null,
      },
      message: 'Posts API prerequisites test completed',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Posts test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Posts test failed',
      details: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing POST form data handling...');

    // Test form data
    const form = await req.formData();
    const content = form.get('content') as string;
    const mediaType = form.get('mediaType') as string | null;
    const file = form.get('media');

    console.log('Form data received:', {
      content: content?.length || 0,
      mediaType,
      hasFile: !!file,
      fileType: file && typeof file === 'object' ? (file as any).type : typeof file,
    });

    return NextResponse.json({
      success: true,
      formData: {
        content: content?.length || 0,
        mediaType,
        hasFile: !!file,
        fileType: file && typeof file === 'object' ? (file as any).type : typeof file,
      },
      message: 'Form data test successful',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Form data test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Form data test failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
