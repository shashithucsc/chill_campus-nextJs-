import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Community from "@/models/Community";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const community = await Community.findById(id)
      .populate('createdBy', 'fullName email');
    
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
      category: community.category,
      status: community.status,
      coverImage: community.coverImage || "/images/default-community-banner.jpg",
      tags: community.tags,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
      memberCount: community.members.length,
      createdBy: community.createdBy,
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

// PUT - Update community
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }
    
    const { name, description, category, status, coverImage, tags } = body;
    
    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    
    // Check if community exists and update
    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName email');
    
    if (!updatedCommunity) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Return updated community with member count
    const communityWithCount = {
      ...updatedCommunity.toObject(),
      memberCount: updatedCommunity.members.length
    };
    
    return NextResponse.json({ community: communityWithCount });
    
  } catch (error) {
    console.error('Error updating community:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Community name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

// DELETE - Delete community
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid community ID" },
        { status: 400 }
      );
    }
    
    const deletedCommunity = await Community.findByIdAndDelete(id);
    
    if (!deletedCommunity) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Community deleted successfully',
      community: deletedCommunity 
    });
    
  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
}
