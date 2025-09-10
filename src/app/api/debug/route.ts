import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Environment variables check:');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY exists:', !!process.env.CLOUDINARY_API_KEY);
    console.log('CLOUDINARY_API_SECRET exists:', !!process.env.CLOUDINARY_API_SECRET);
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    return NextResponse.json({
      status: 'success',
      message: 'Debug endpoint working',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasCloudinaryConfig: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🧪 Test POST endpoint received:', body);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test POST successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json({
      status: 'error',
      message: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
