import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

// For now, we'll use a simple followers array in the User model
// In a more robust system, you'd create a separate Follow model

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = context?.params;
    if (!params?.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const targetUserId = params.userId;
    const followerId = (session.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Can't follow yourself
    if (targetUserId === followerId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const followerUser = await User.findById(followerId);
    if (!followerUser) {
      return NextResponse.json(
        { error: "Follower not found" },
        { status: 404 }
      );
    }

    // Initialize arrays if they don't exist
    if (!targetUser.followers) targetUser.followers = [];
    if (!followerUser.following) followerUser.following = [];

    // Check if already following
    const isAlreadyFollowing = targetUser.followers.some(
      (id: any) => id.toString() === followerId
    );

    if (isAlreadyFollowing) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Add follow relationship
    targetUser.followers.push(new mongoose.Types.ObjectId(followerId));
    followerUser.following.push(new mongoose.Types.ObjectId(targetUserId));

    await Promise.all([
      targetUser.save(),
      followerUser.save()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user'
    });

  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const params = context?.params;
    if (!params?.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const targetUserId = params.userId;
    const followerId = (session.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Find both users
    const [targetUser, followerUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(followerId)
    ]);

    if (!targetUser || !followerUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove follow relationship
    if (targetUser.followers) {
      targetUser.followers = targetUser.followers.filter(
        (id: any) => id.toString() !== followerId
      );
    }

    if (followerUser.following) {
      followerUser.following = followerUser.following.filter(
        (id: any) => id.toString() !== targetUserId
      );
    }

    await Promise.all([
      targetUser.save(),
      followerUser.save()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}
