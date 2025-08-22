import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Minimal shape for lean community documents to satisfy TypeScript
interface CommunityLean {
  _id: any; // Using any here because Mongoose lean returns _id as unknown without schema typing
  name: string;
  description: string;
  category?: string;
  status: string;
  coverImage?: string;
  imageUrl?: string;
  tags?: string[];
  members: any[]; // Member ObjectIds
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isAdmin = searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // Admin view - return all communities with detailed info
      const filter: any = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (status && status !== 'All') {
        filter.status = status;
      }
      
      // Build sort query
      const sortQuery: any = {};
      if (sort === 'latest') {
        sortQuery.createdAt = -1;
      } else if (sort === 'oldest') {
        sortQuery.createdAt = 1;
      } else if (sort === 'name') {
        sortQuery.name = 1;
      } else if (sort === 'members') {
        sortQuery.memberCount = -1;
      }
      
      // Get total count for pagination
      const total = await Community.countDocuments(filter);
      
      // Get communities with member count and creator info
      const communities = await Community.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            memberCount: { $size: '$members' },
            creatorName: { $arrayElemAt: ['$creator.fullName', 0] }
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            category: 1,
            status: 1,
            coverImage: 1,
            imageUrl: 1, // Add imageUrl field
            tags: 1,
            memberCount: 1,
            creatorName: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $sort: sortQuery },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);

      // Process image URLs for admin view, similar to user view
      const processedCommunities = communities.map(community => {
        // Prefer imageUrl over coverImage, similar to frontend logic
        let displayImage = community.imageUrl || community.coverImage;
        if (displayImage && !displayImage.startsWith('http') && !displayImage.startsWith('/')) {
          displayImage = `/uploads/${displayImage}`;
        }

        return {
          ...community,
          coverImage: displayImage || '/images/default-community-banner.jpg'
        };
      });
      
      return NextResponse.json({
        communities: processedCommunities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // Regular user view - existing functionality
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id;

      const communities = await Community.find({ status: 'Active' })
        .populate('createdBy', 'fullName email')
        .lean<CommunityLean[]>();

      // Add isJoined field and process image URLs
  const communitiesWithJoinStatus = communities.map((community: CommunityLean) => {
        // Ensure the coverImage is properly formed
        let coverImage = community.coverImage;
        if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('/')) {
          coverImage = `/uploads/${coverImage}`;
        }

        return {
          ...community,
          id: (community._id as any).toString(),
          isJoined: community.members.some(memberId => 
            memberId.toString() === userId
          ),
          memberCount: community.members.length,
          coverImage: coverImage || '/images/default-community-banner.jpg'
        };
      });

      return NextResponse.json({ 
        success: true, 
        communities: communitiesWithJoinStatus 
      });
    }
  } catch (error: any) {
    console.error('Fetch communities error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST - Create new community
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      name, 
      description, 
      category = 'Others', 
      status = 'Active', 
      coverImage = '', 
      tags = [],
      createdBy 
    } = body;
    
    // Validation
    if (!name || !description || !createdBy) {
      return NextResponse.json(
        { error: 'Name, description, and creator are required' },
        { status: 400 }
      );
    }
    
    // Check if community already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingCommunity) {
      return NextResponse.json(
        { error: 'Community with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new community
    const newCommunity = new Community({
      name,
      description,
      category,
      status,
      coverImage,
      tags: Array.isArray(tags) ? tags : [],
      createdBy,
      members: [createdBy] // Creator is automatically a member
    });
    
    await newCommunity.save();
    
    // Return community with member count
    const communityWithCount = await Community.aggregate([
      { $match: { _id: newCommunity._id } },
      {
        $addFields: {
          memberCount: { $size: '$members' }
        }
      }
    ]);
    
    return NextResponse.json({ 
      community: communityWithCount[0] 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
  }
}
