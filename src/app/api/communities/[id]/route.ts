import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Community from "@/models/Community";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const community = await Community.findById(id);
    
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is a member
    let isMember = false;
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      isMember = community.members.includes(session.user.id);
    }

    // Format the response
    const formattedCommunity = {
      _id: community._id,
      name: community.name,
      description: community.description,
      coverImage: community.imageUrl || "/images/default-community-banner.jpg",
      createdAt: community.createdAt,
      memberCount: community.members.length,
      isMember
    };

    return NextResponse.json({ community: formattedCommunity });
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    );
  }
}
