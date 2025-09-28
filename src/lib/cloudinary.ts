import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with validation
const requiredEnvVars = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing Cloudinary environment variables:', missingVars);
  throw new Error(`Missing Cloudinary configuration: ${missingVars.join(', ')}`);
}

cloudinary.config({
  cloud_name: requiredEnvVars.cloud_name,
  api_key: requiredEnvVars.api_key,
  api_secret: requiredEnvVars.api_secret,
  secure: true,
});

console.log('✅ Cloudinary configured successfully');

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
  bytes: number;
  originalName?: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    originalName?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    allowedFormats?: string[];
    maxFileSize?: number;
  } = {}
): Promise<UploadResult> {
  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid buffer: Buffer is empty or undefined');
  }

  // Check file size limits (Vercel has 4.5MB limit for serverless functions)
  const maxSize = options.maxFileSize || 4 * 1024 * 1024; // 4MB default
  if (buffer.length > maxSize) {
    throw new Error(`File too large: ${buffer.length} bytes (max: ${maxSize} bytes)`);
  }

  console.log(`🔄 Starting Cloudinary upload... (${buffer.length} bytes)`);

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder || 'chill-campus',
      resource_type: options.resourceType || 'auto',
      use_filename: false,
      unique_filename: true,
      timeout: 50000, // 50 second timeout
    };

    if (options.allowedFormats) {
      uploadOptions.allowed_formats = options.allowedFormats;
    }

    // Set transformation for images to optimize size
    if (options.resourceType === 'image') {
      uploadOptions.transformation = [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ];
    }

    console.log('☁️ Cloudinary upload options:', {
      folder: uploadOptions.folder,
      resource_type: uploadOptions.resource_type,
      timeout: uploadOptions.timeout,
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          
          // Provide more specific error messages
          let errorMessage = `Upload failed: ${error.message}`;
          if (error.message.includes('timeout')) {
            errorMessage = 'Upload timeout: File too large or connection too slow';
          } else if (error.message.includes('Invalid')) {
            errorMessage = 'Invalid file format or corrupted file';
          } else if (error.message.includes('quota')) {
            errorMessage = 'Storage quota exceeded';
          }
          
          reject(new Error(errorMessage));
          return;
        }

        if (!result) {
          console.error('❌ No result returned from Cloudinary');
          reject(new Error('Upload failed: No result returned from Cloudinary'));
          return;
        }

        console.log('✅ Cloudinary upload successful:', {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
          originalName: options.originalName,
        });
      }
    );

    // Set timeout for the upload stream
    const timeoutId = setTimeout(() => {
      console.error('❌ Upload stream timeout');
      reject(new Error('Upload timeout: Operation took too long'));
    }, 55000); // 55 second timeout

    uploadStream.on('error', (streamError) => {
      clearTimeout(timeoutId);
      console.error('❌ Upload stream error:', streamError);
      reject(new Error(`Stream error: ${streamError.message}`));
    });

    uploadStream.on('finish', () => {
      clearTimeout(timeoutId);
      console.log('✅ Upload stream finished');
    });

    try {
      uploadStream.end(buffer);
      console.log('✅ Buffer sent to upload stream');
    } catch (streamError) {
      clearTimeout(timeoutId);
      console.error('❌ Error sending buffer to stream:', streamError);
      reject(new Error(`Failed to send buffer: ${(streamError as Error).message}`));
    }
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    // Don't throw error for deletion failures in production
  }
}

export default cloudinary;
