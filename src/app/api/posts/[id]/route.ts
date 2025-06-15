import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getSession } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getSession();
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  const body = await req.json();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.user.toString() !== (session.user as any).id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  post.content = body.content;
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
