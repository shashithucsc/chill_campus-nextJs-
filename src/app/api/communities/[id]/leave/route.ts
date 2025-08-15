import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Community from "@/models/Community";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to leave a community" },
        { status: 401 }
      );
    }

  const communityId = context?.params?.id;
    
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // First check if user is a member and get current community
    const community = await Community.findById(communityId);
    
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

  if (!community.members.includes((session.user as any).id)) {
      return NextResponse.json(
        { error: "You are not a member of this community" },
        { status: 400 }
      );
    }

    // Check if this is the last member
    if (community.members.length === 1) {
      // Delete all posts in this community first
      await Post.deleteMany({ community: communityId });
      
      // Then delete the community
      await Community.findByIdAndDelete(communityId);
      
      return NextResponse.json({
        message: "Community deleted as you were the last member",
        deleted: true
      });
    } else {
      // Remove user from community members
      const updatedCommunity = await Community.findByIdAndUpdate(
        communityId,
        {
          $pull: { members: (session.user as any).id }
        },
        { new: true }
      );
      
      return NextResponse.json({
        message: "Successfully left community",
        memberCount: updatedCommunity.members.length,
        deleted: false
      });
    }
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Failed to leave community" },
      { status: 500 }
    );
  }
}
