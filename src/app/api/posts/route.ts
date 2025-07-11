import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  await dbConnect();
  // Populate fullName, email, avatar, and role for the user
  const posts = await Post.find({})
    .populate('user', 'fullName email avatar role')
    .sort({ createdAt: -1 });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
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
        // Get the user from the database to have complete data
        const user = await User.findById(userId).select('-password');
        if (user) {
          // Create a mock session that matches our custom session format
          session = {
            user: {
              id: userId,
              email: userEmail,
              fullName: user.fullName || userName || 'User',
              role: user.role || 'user'
            }
          };
        }
      }
    }
  }
  
  // If we still don't have a session, return unauthorized
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await req.formData();
  const content = form.get('content') as string;
  const mediaType = form.get('mediaType') as string | null;
  let media: string[] = [];

  // Handle file upload
  const file = form.get('media');
  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file as any).name?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    await fs.writeFile(uploadPath, buffer);
    media.push(`/uploads/${fileName}`);
  } else if (file && typeof file === 'string') {
    media.push(file);
  }

  if (!content && media.length === 0) {
    return NextResponse.json({ error: 'Post content or media required' }, { status: 400 });
  }
  const post = await Post.create({
    user: (session.user as any).id,
    content,
    media,
    mediaType: mediaType || null,
  });
  return NextResponse.json({ post });
}
