import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await req.json();
    const { action } = data; // 'join' or 'leave'
    const communityId = params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { success: false, message: 'Community not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isMember = community.members.includes(userId);

    if (action === 'join' && !isMember) {
      community.members.push(userId);
    } else if (action === 'leave' && isMember) {
      community.members = community.members.filter(
        (id: any) => id.toString() !== userId
      );
    }

    await community.save();

    return NextResponse.json({
      success: true,
      message: action === 'join' ? 'Joined community' : 'Left community',
      memberCount: community.members.length
    });
  } catch (error: any) {
    console.error('Join/Leave community error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update membership' },
      { status: 500 }
    );
  }
}
