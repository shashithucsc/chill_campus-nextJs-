import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    console.log('🧪 Testing Cloudinary configuration...');

    // Check environment variables
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };

    console.log('Cloudinary config check:', {
      cloud_name: !!config.cloud_name,
      api_key: !!config.api_key,
      api_secret: !!config.api_secret,
    });

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
      secure: true,
    });

    // Test connection by getting account details
    console.log('Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('Cloudinary ping result:', result);

    return NextResponse.json({
      success: true,
      config: {
        cloud_name: !!config.cloud_name,
        api_key: !!config.api_key,
        api_secret: !!config.api_secret,
      },
      connection: result,
      message: 'Cloudinary test successful',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Cloudinary test failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing Cloudinary upload with sample data...');

    // Check if we have the required environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Missing Cloudinary environment variables');
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Create a small test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('Uploading test image to Cloudinary...');
    
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chill-campus/test',
          resource_type: 'image',
          use_filename: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
            return;
          }
          resolve(result);
        }
      );
      uploadStream.end(testImageBuffer);
    });

    console.log('✅ Cloudinary upload successful:', uploadResult);

    // Clean up the test image
    try {
      await cloudinary.uploader.destroy((uploadResult as any).public_id);
      console.log('✅ Test image cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup test image:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      uploadResult,
      message: 'Cloudinary upload test successful',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cloudinary upload test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Cloudinary upload test failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}