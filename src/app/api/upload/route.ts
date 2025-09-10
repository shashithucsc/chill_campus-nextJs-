import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { uploadToCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/aac',
  // Video
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/avi',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/rar',
  'application/x-rar-compressed'
];

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `File type ${file.type} is not allowed. Supported types: images, audio, video, documents, and archives.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file category and folder for Cloudinary
    let fileCategory = 'file';
    let cloudinaryFolder = 'chill-campus/files';
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';

    if (file.type.startsWith('image/')) {
      fileCategory = 'image';
      cloudinaryFolder = 'chill-campus/images';
      resourceType = 'image';
    } else if (file.type.startsWith('audio/')) {
      fileCategory = 'audio';
      cloudinaryFolder = 'chill-campus/audio';
      resourceType = 'raw';
    } else if (file.type.startsWith('video/')) {
      fileCategory = 'video';
      cloudinaryFolder = 'chill-campus/videos';
      resourceType = 'video';
    } else if (file.type === 'application/pdf') {
      fileCategory = 'pdf';
      cloudinaryFolder = 'chill-campus/documents';
      resourceType = 'raw';
    } else {
      cloudinaryFolder = 'chill-campus/documents';
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: cloudinaryFolder,
      originalName: file.name,
      resourceType,
      maxFileSize: MAX_FILE_SIZE,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url: uploadResult.url,
      filePath: uploadResult.url,
      file: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category: fileCategory,
        format: uploadResult.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
