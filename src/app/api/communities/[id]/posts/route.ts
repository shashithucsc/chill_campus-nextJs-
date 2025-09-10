import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Community from "@/models/Community";
import { getSession } from '@/lib/session';
import mongoose from "mongoose";
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET: Fetch all posts for a specific community
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    // Type checking to ensure params.id exists
  const params = context?.params;
  if (!params?.id) {
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
    
    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }
    
    // Find posts that belong to this community
    const posts = await Post.find({ community: communityId })
      .populate({
        path: 'user',
        select: 'fullName avatar role'
      })
      .populate({
        path: 'community',
        select: 'name imageUrl'
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

// POST: Create a new post in a specific community
export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    await dbConnect();
    
  const params = context?.params;
  if (!params?.id) {
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

    // Get session
    let session = await getSession();
    
    // If that fails, check for session sync headers from middleware
    if (!session || !session.user || !(session.user as any).id) {
      const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
      if (needsSync) {
        const userId = req.headers.get('X-User-Id');
        const userEmail = req.headers.get('X-User-Email');
        const userName = req.headers.get('X-User-Name');
        
        if (userId && userEmail) {
          const user = await User.findById(userId).select('-password');
          if (user) {
            session = {
              user: {
                id: userId,
                email: userEmail,
                fullName: user.fullName || userName || 'User',
                role: user.role || 'user'
              }
            };
          }
        }
      }
    }
    
    // Check authentication
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the community
    const userId = (session.user as any).id;
    if (!community.members.includes(userId)) {
      return NextResponse.json(
        { error: "You must be a member of this community to post" },
        { status: 403 }
      );
    }

    // Parse form data
    const form = await req.formData();
    const content = form.get('content') as string;
    const mediaType = form.get('mediaType') as string | null;
    const media: string[] = [];

    // Handle file upload
    const file = form.get('media');
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Determine folder and resource type based on media type
      let folder = 'chill-campus/community-posts';
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
      
      if (mediaType === 'image' || (file as any).type?.startsWith('image/')) {
        folder = 'chill-campus/community-posts/images';
        resourceType = 'image';
      } else if (mediaType === 'video' || (file as any).type?.startsWith('video/')) {
        folder = 'chill-campus/community-posts/videos';
        resourceType = 'video';
      }
      
      const uploadResult = await uploadToCloudinary(buffer, {
        folder,
        originalName: (file as any).name,
        resourceType,
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
      });
      
      media.push(uploadResult.url);
    } else if (file && typeof file === 'string') {
      media.push(file);
    }

    // Validate content
    if (!content && media.length === 0) {
      return NextResponse.json({ error: 'Post content or media required' }, { status: 400 });
    }

    // Create the post with community association
    const post = await Post.create({
      user: userId,
      community: communityId,
      content,
      media,
      mediaType: mediaType || null,
    });

    // Populate the created post for response
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'fullName email avatar role')
      .populate('community', 'name imageUrl');

    return NextResponse.json({ post: populatedPost });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
