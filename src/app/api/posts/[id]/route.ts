import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';
import path from 'path';
import fs from 'fs/promises';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession();
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const form = await req.formData();
  const content = form.get('content') as string;
  const mediaType = form.get('mediaType') as string | null;
  let media: string[] = [];

  // Handle file upload (replace or add new media)
  const file = form.get('media');
  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file as any).name?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    await fs.writeFile(uploadPath, buffer);
    media.push(`/uploads/${fileName}`);
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession();
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.user.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
