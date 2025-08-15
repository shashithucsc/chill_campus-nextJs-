import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
  const communityId = context?.params?.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { success: false, message: 'Community not found' },
        { status: 404 }
      );
    }

  const userId = (session.user as any).id;
    const isMember = community.members.includes(userId);

    if (!isMember) {
      community.members.push(userId);
      await community.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Joined community successfully',
      memberCount: community.members.length
    });
  } catch (error: any) {
    console.error('Join community error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to join community' },
      { status: 500 }
    );
  }
}
