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
      isMember = community.members.includes((session.user as any).id);
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

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the community first to check ownership
    const community = await Community.findById(id);
    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check if the current user is the creator of the community
    if (community.createdBy.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Only the community creator can edit this community" },
        { status: 403 }
      );
    }
    
    const { name, description, category, status, coverImage, tags, visibility } = body;
    
    // Validate required fields if they are being updated
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Community name is required" },
        { status: 400 }
      );
    }

    if (description !== undefined && (!description || description.trim().length === 0)) {
      return NextResponse.json(
        { error: "Community description is required" },
        { status: 400 }
      );
    }

    if (category !== undefined && !['Tech', 'Arts', 'Clubs', 'Events', 'Others'].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    if (visibility !== undefined && !['Public', 'Private'].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility setting" },
        { status: 400 }
      );
    }
    
    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (visibility !== undefined) updateData.visibility = visibility;
    
    // Check if community name already exists (excluding current community)
    if (updateData.name) {
      const existingCommunity = await Community.findOne({
        name: { $regex: new RegExp('^' + updateData.name + '$', 'i') },
        _id: { $ne: id }
      });

      if (existingCommunity) {
        return NextResponse.json(
          { error: 'A community with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the community
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

    // Check if user is a member for the response
    const isMember = updatedCommunity.members.includes((session.user as any).id);
    
    // Return updated community with member count and membership status
    const communityResponse = {
      _id: updatedCommunity._id,
      name: updatedCommunity.name,
      description: updatedCommunity.description,
      category: updatedCommunity.category,
      visibility: updatedCommunity.visibility,
      status: updatedCommunity.status,
      coverImage: updatedCommunity.coverImage || "/images/default-community-banner.jpg",
      tags: updatedCommunity.tags,
      createdAt: updatedCommunity.createdAt,
      updatedAt: updatedCommunity.updatedAt,
      memberCount: updatedCommunity.members.length,
      createdBy: updatedCommunity.createdBy,
      isMember
    };
    
    return NextResponse.json({ 
      message: 'Community updated successfully',
      community: communityResponse 
    });
    
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
