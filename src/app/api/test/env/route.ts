import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL,
    };

    console.log('Environment check:', envCheck);

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment test successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Environment test failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Test POST received:', body);

    return NextResponse.json({
      success: true,
      message: 'Test POST successful',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test POST failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
