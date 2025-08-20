import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/session';

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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Determine file category for frontend
    let fileCategory = 'file';
    if (file.type.startsWith('image/')) {
      fileCategory = 'image';
    } else if (file.type.startsWith('audio/')) {
      fileCategory = 'audio';
    } else if (file.type.startsWith('video/')) {
      fileCategory = 'video';
    } else if (file.type === 'application/pdf') {
      fileCategory = 'pdf';
    }

    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url: fileUrl,
      filePath: fileUrl,
      file: {
        url: fileUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category: fileCategory
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
