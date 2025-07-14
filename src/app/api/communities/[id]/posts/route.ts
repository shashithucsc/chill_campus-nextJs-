import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Type checking to ensure params.id exists
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
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
    
    // Find posts that belong to this community
    const posts = await Post.find({ community: communityId })
      .populate({
        path: 'user',
        select: 'fullName avatar role'
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    );
  }
}
