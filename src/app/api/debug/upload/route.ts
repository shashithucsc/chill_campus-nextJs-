import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  try {
    console.log('🐛 DEBUG: Testing file upload process step by step...');
    
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...');
    const envVars = {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };
    
    console.log('Environment variables present:', {
      CLOUDINARY_CLOUD_NAME: !!envVars.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!envVars.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!envVars.CLOUDINARY_API_SECRET,
    });

    const missingVars = Object.entries(envVars).filter(([_, value]) => !value);
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        step: 1,
        error: 'Missing environment variables',
        missingVars: missingVars.map(([key]) => key),
      }, { status: 500 });
    }

    // Step 2: Parse form data
    console.log('Step 2: Parsing form data...');
    let formData;
    try {
      formData = await req.formData();
      console.log('✅ Form data parsed successfully');
    } catch (formError) {
      console.error('❌ Form parsing failed:', formError);
      return NextResponse.json({
        success: false,
        step: 2,
        error: 'Form parsing failed',
        details: (formError as Error).message,
      }, { status: 400 });
    }

    // Step 3: Get file from form
    console.log('Step 3: Extracting file...');
    const file = formData.get('file') || formData.get('media');
    if (!file) {
      return NextResponse.json({
        success: false,
        step: 3,
        error: 'No file provided',
        availableFields: Array.from(formData.keys()),
      }, { status: 400 });
    }

    if (typeof file === 'string') {
      return NextResponse.json({
        success: false,
        step: 3,
        error: 'File is string, expected File object',
        fileValue: file.substring(0, 100),
      }, { status: 400 });
    }

    console.log('File info:', {
      name: (file as any).name,
      type: (file as any).type,
      size: (file as any).size,
    });

    // Step 4: Convert to buffer
    console.log('Step 4: Converting to buffer...');
    let buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
      console.log('✅ Buffer created, size:', buffer.length);
    } catch (bufferError) {
      console.error('❌ Buffer conversion failed:', bufferError);
      return NextResponse.json({
        success: false,
        step: 4,
        error: 'Buffer conversion failed',
        details: (bufferError as Error).message,
      }, { status: 500 });
    }

    // Step 5: Configure Cloudinary
    console.log('Step 5: Configuring Cloudinary...');
    try {
      cloudinary.config({
        cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
        api_key: envVars.CLOUDINARY_API_KEY,
        api_secret: envVars.CLOUDINARY_API_SECRET,
        secure: true,
      });
      console.log('✅ Cloudinary configured');
    } catch (configError) {
      console.error('❌ Cloudinary config failed:', configError);
      return NextResponse.json({
        success: false,
        step: 5,
        error: 'Cloudinary configuration failed',
        details: (configError as Error).message,
      }, { status: 500 });
    }

    // Step 6: Test Cloudinary connection
    console.log('Step 6: Testing Cloudinary connection...');
    try {
      const pingResult = await cloudinary.api.ping();
      console.log('✅ Cloudinary ping successful:', pingResult);
    } catch (pingError) {
      console.error('❌ Cloudinary ping failed:', pingError);
      return NextResponse.json({
        success: false,
        step: 6,
        error: 'Cloudinary connection failed',
        details: (pingError as Error).message,
      }, { status: 500 });
    }

    // Step 7: Upload to Cloudinary
    console.log('Step 7: Uploading to Cloudinary...');
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'chill-campus/debug',
            resource_type: 'auto',
            use_filename: false,
            unique_filename: true,
            timeout: 30000,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload stream error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result?.secure_url);
              resolve(result);
            }
          }
        );

        // Set timeout
        setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'));
        }, 30000);

        uploadStream.end(buffer);
      });

      // Clean up the test upload
      try {
        if (uploadResult && (uploadResult as any).public_id) {
          await cloudinary.uploader.destroy((uploadResult as any).public_id);
          console.log('✅ Test upload cleaned up');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup failed:', cleanupError);
      }

      return NextResponse.json({
        success: true,
        message: 'All steps completed successfully',
        steps: {
          1: 'Environment variables ✅',
          2: 'Form parsing ✅', 
          3: 'File extraction ✅',
          4: 'Buffer conversion ✅',
          5: 'Cloudinary config ✅',
          6: 'Cloudinary connection ✅',
          7: 'Upload test ✅',
        },
        fileInfo: {
          name: (file as any).name,
          type: (file as any).type,
          size: (file as any).size,
          bufferSize: buffer.length,
        },
        uploadResult: {
          url: (uploadResult as any).secure_url,
          publicId: (uploadResult as any).public_id,
          format: (uploadResult as any).format,
          bytes: (uploadResult as any).bytes,
        }
      });

    } catch (uploadError) {
      console.error('❌ Cloudinary upload failed:', uploadError);
      return NextResponse.json({
        success: false,
        step: 7,
        error: 'Cloudinary upload failed',
        details: (uploadError as Error).message,
        errorName: (uploadError as Error).name,
        stack: process.env.NODE_ENV === 'development' ? (uploadError as Error).stack : undefined,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Unexpected error in debug upload:', error);
    return NextResponse.json({
      success: false,
      step: 0,
      error: 'Unexpected error',
      details: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Debug upload endpoint. Send POST with file to test upload process.',
    usage: 'POST with FormData containing a "file" or "media" field',
  });
}