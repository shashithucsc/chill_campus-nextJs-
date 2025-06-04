import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    console.log('API POST /api/posts - Server Session:', session);

    if (!session?.user?.id) {
      console.log('API POST /api/posts - Authentication failed: No session or user ID');
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { content, tags } = await req.json();

    if (!content) {
      return NextResponse.json(
        { message: 'Post content is required' },
        { status: 400 }
      );
    }

    const post = await Post.create({
      content,
      author: session.user.id,
      tags: tags || []
    });

    // Populate author details
    await post.populate('author', 'name email university');

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating post' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    console.log('API GET /api/posts - Fetching posts...');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email university')
      .populate('comments.author', 'name email university');

    console.log(`API GET /api/posts - Found ${posts.length} posts.`);

    const total = await Post.countDocuments();

    console.log(`API GET /api/posts - Total posts count: ${total}.`);

    return NextResponse.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching posts' },
      { status: 500 }
    );
  }
} 