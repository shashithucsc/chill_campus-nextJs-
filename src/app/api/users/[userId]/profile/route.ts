import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Community from '@/models/Community';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    await dbConnect();

    const params = context?.params;
    if (!params?.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const targetUserId = params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get the requesting user's session
    const session = await getSession();
    const requestingUserId = session?.user ? (session.user as any).id : null;

    // Find the target user
    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's posts count
    const postsCount = await Post.countDocuments({ 
      user: targetUserId, 
      disabled: { $ne: true } 
    });

    // Get user's communities count
    const communitiesCount = await Community.countDocuments({
      members: targetUserId,
      status: 'Active'
    });

    // Check if requesting user is following this user
    let isFollowing = false;
    let followersCount = 0;
    let followingCount = 0;
    let mutualConnections = 0;

    // Get followers and following counts
    followersCount = user.followers ? user.followers.length : 0;
    followingCount = user.following ? user.following.length : 0;

    if (requestingUserId) {
      // Check if following
      isFollowing = user.followers ? user.followers.some(
        (id: any) => id.toString() === requestingUserId
      ) : false;

      // Get mutual connections
      if (user.followers && user.following) {
        const requestingUser = await User.findById(requestingUserId).select('following');
        if (requestingUser && requestingUser.following) {
          const requestingFollowingIds = requestingUser.following.map((id: any) => id.toString());
          const targetFollowerIds = user.followers.map((id: any) => id.toString());
          
          mutualConnections = requestingFollowingIds.filter(id => targetFollowerIds.includes(id)).length;
        }
      }
    }

    // Transform user data for response
    const userProfile = {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || '',
      bio: user.bio || '',
      university: user.university || '',
      role: user.role || 'student',
      interests: user.interests || [],
      joinedAt: user.createdAt.toISOString(),
      stats: {
        posts: postsCount,
        communities: communitiesCount,
        followers: followersCount,
        following: followingCount
      },
      isFollowing,
      mutualConnections
    };

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
