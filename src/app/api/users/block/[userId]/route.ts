import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  await dbConnect();

  // Get session
  const session = await getSession();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await User.findById((session.user as any).id);
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Initialize blockedUsers array if it doesn't exist
    if (!currentUser.blockedUsers) {
      currentUser.blockedUsers = [];
      await currentUser.save();
      return NextResponse.json({ isBlocked: false });
    }

    // Check if the user is blocked
    const isBlocked = currentUser.blockedUsers.some(
      (blockedId: any) => blockedId.toString() === userId
    );

    return NextResponse.json({ isBlocked });
  } catch (error) {
    console.error('Error checking blocked status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
