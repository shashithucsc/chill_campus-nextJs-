import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { registerAllModels } from '@/lib/registerModels';

interface LeanPostDoc {
  _id: any;
  disabled?: boolean;
  // Other properties are populated and treated as any; we only need disabled flag statically
}

export async function GET(req: NextRequest, context: any) {
  try {
    await dbConnect();
    
    // Register all models
    registerAllModels();

    const { id } = context?.params || {};

    // Find the post by ID and populate the user and community data
    const post = await Post.findById(id)
      .populate('user', 'fullName avatar role')
      .populate('community', '_id name coverImage')
      .populate('comments.user', 'fullName avatar')
      .lean<LeanPostDoc>();

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if post is disabled
    if ((post as any).disabled) { // retain any cast for populated dynamic shape
      return NextResponse.json(
        { error: 'This post has been disabled' },
        { status: 403 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: any) {
  await dbConnect();
  
  // Try to get session from custom session system
  let session = await getSession();
  
  // If that fails, check for session sync headers from middleware
  if (!session || !session.user || !(session.user as any).id) {
    // Check if the middleware indicated we have NextAuth session but need to sync
    const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
    if (needsSync) {
      const userId = req.headers.get('X-User-Id');
      const userEmail = req.headers.get('X-User-Email');
      const userName = req.headers.get('X-User-Name');
      
      if (userId && userEmail) {
        // Create a mock session that matches our custom session format
        session = {
          user: {
            id: userId,
            email: userEmail,
            fullName: userName || 'User',
            role: 'user' // Default role
          }
        };
      }
    }
  }
  
  // If we still don't have a session, return unauthorized
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context?.params || {};
  const form = await req.formData();
  const content = form.get('content') as string;
  const mediaType = form.get('mediaType') as string | null;
  let media: string[] = [];

  // Handle file upload (replace or add new media)
  const file = form.get('media');
  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine folder and resource type based on media type
    let folder = 'chill-campus/posts';
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    
    if (mediaType === 'image' || (file as any).type?.startsWith('image/')) {
      folder = 'chill-campus/posts/images';
      resourceType = 'image';
    } else if (mediaType === 'video' || (file as any).type?.startsWith('video/')) {
      folder = 'chill-campus/posts/videos';
      resourceType = 'video';
    }
    
    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      originalName: (file as any).name,
      resourceType,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });
    
    media.push(uploadResult.url);
  } else if (file && typeof file === 'string') {
    // If the frontend sends the existing media URL as a string, keep it
    media.push(file);
  }

  // Optionally, support removing media: if 'removeMedia' is set, clear media
  const removeMedia = form.get('removeMedia');
  if (removeMedia === 'true') {
    media = [];
  }

  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.user.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  post.content = content;
  if (media.length > 0 || removeMedia === 'true') {
    post.media = media;
    post.mediaType = mediaType || null;
  }
  await post.save();
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, context: any) {
  await dbConnect();
  
  // Try to get session from custom session system
  let session = await getSession();
  
  // If that fails, check for session sync headers from middleware
  if (!session || !session.user || !(session.user as any).id) {
    // Check if the middleware indicated we have NextAuth session but need to sync
    const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
    if (needsSync) {
      const userId = req.headers.get('X-User-Id');
      const userEmail = req.headers.get('X-User-Email');
      const userName = req.headers.get('X-User-Name');
      
      if (userId && userEmail) {
        // Create a mock session that matches our custom session format
        session = {
          user: {
            id: userId,
            email: userEmail,
            fullName: userName || 'User',
            role: 'user' // Default role
          }
        };
      }
    }
  }
  
  // If we still don't have a session, return unauthorized
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context?.params || {};
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.user.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
