import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Community from "@/models/Community";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to leave a community" },
        { status: 401 }
      );
    }

    const communityId = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Remove user from community members
    const community = await Community.findByIdAndUpdate(
      communityId,
      {
        $pull: { members: session.user.id }
      },
      { new: true }
    );
    
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Successfully left community",
      memberCount: community.members.length
    });
  } catch (error) {
    console.error("Error leaving community:", error);
    return NextResponse.json(
      { error: "Failed to leave community" },
      { status: 500 }
    );
  }
}
