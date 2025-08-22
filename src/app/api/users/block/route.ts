import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();

  // Get session
  const session = await getSession();
  if (!session?.user || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Check if the user to block exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return NextResponse.json({ error: 'User to block not found' }, { status: 404 });
    }

    // Initialize blockedUsers array if it doesn't exist
    if (!currentUser.blockedUsers) {
      currentUser.blockedUsers = [];
    }

    // Check if the user is already blocked
    const isAlreadyBlocked = currentUser.blockedUsers.some(
      (blockedId: mongoose.Types.ObjectId) => blockedId.toString() === userId
    );

    if (isAlreadyBlocked) {
      return NextResponse.json({ success: true, message: 'User is already blocked' });
    }

    // Add the user to blocked users
    currentUser.blockedUsers.push(userId);
    await currentUser.save();

    return NextResponse.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  // Get session
  const session = await getSession();
  if (!session?.user || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Initialize blockedUsers array if it doesn't exist
    if (!currentUser.blockedUsers) {
      currentUser.blockedUsers = [];
      await currentUser.save();
      return NextResponse.json({ success: true, message: 'User is not blocked' });
    }

    // Check if the user is already blocked
    const isBlocked = currentUser.blockedUsers.some(
      (blockedId: mongoose.Types.ObjectId) => blockedId.toString() === userId
    );

    if (!isBlocked) {
      return NextResponse.json({ success: true, message: 'User is not blocked' });
    }

    // Remove the user from blocked users
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (blockedId: mongoose.Types.ObjectId) => blockedId.toString() !== userId
    );
    await currentUser.save();

    return NextResponse.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
