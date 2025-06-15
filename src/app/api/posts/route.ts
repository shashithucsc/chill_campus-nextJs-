import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  await dbConnect();
  const posts = await Post.find({}).populate('user', 'fullName email').sort({ createdAt: -1 });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getSession();
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
