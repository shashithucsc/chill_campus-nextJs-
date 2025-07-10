import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const communities = await Community.find()
      .populate('createdBy', 'name email')
      .lean();

    // Add isJoined field to each community
    const communitiesWithJoinStatus = communities.map(community => ({
      ...community,
      id: community._id.toString(),
      isJoined: community.members.some(memberId => 
        memberId.toString() === userId
      ),
      members: community.members.length // Convert members array to count
    }));

    return NextResponse.json({ 
      success: true, 
      communities: communitiesWithJoinStatus 
    });
  } catch (error: any) {
    console.error('Fetch communities error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}
