import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';

interface SearchLeanUser {
  _id: any;
  fullName: string;
  email: string;
  avatar?: string;
  university?: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

  const userId = (session.user as any).id; // cast to any to avoid TS error due to loose session typing

    // Search users by name or email (excluding current user)
  const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { fullName: { $regex: query.trim(), $options: 'i' } },
        { email: { $regex: query.trim(), $options: 'i' } }
      ],
      isActive: true,
      status: 'Active'
    })
    .select('fullName email avatar university role')
    .limit(limit)
  .lean<SearchLeanUser[]>();

    // Transform users for frontend
  const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || '',
      university: user.university,
      role: user.role
    }));

    return NextResponse.json({
      users: transformedUsers
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
