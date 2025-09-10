import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { registerAllModels } from '@/lib/registerModels';
import Post from '@/models/Post';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔍 GET /api/posts - Starting request (attempt ${retryCount + 1}/${maxRetries})`);
      const conn = await dbConnect();
      if (!conn) {
        console.error('❌ Database connection failed');
        if (retryCount === maxRetries - 1) {
          return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }
        retryCount++;
        console.log(`🔄 Retrying database connection... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
        continue;
      }
      console.log('✅ Database connected');
      
      // Ensure all models are registered
      registerAllModels();
      
      // Get query parameters
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      console.log('🧩 Query params:', { userId });
      
      // Build query filter
      const filter: any = {};
      if (userId) {
        filter.user = userId;
      }
      
      console.log('🔎 Finding posts with filter:', filter);
      
      try {
        // First check if any posts exist to avoid population errors
        const postsExist = await Post.exists(filter);
        console.log(`📊 Posts exist check:`, postsExist);
        
        if (!postsExist) {
          console.log('📊 No posts found');
          return NextResponse.json({ posts: [] });
        }
        
        // Create a query and add population steps one by one to isolate any issues
        let query = Post.find(filter).sort({ createdAt: -1 });
        
        // First try to populate just the user
        try {
          query = query.populate({
            path: 'user',
            select: 'fullName email avatar role',
            match: { _id: { $exists: true } }
          });
        } catch (userPopulateError) {
          console.error('❌ Error populating user:', userPopulateError);
          // Continue without user population
        }
        
        // Then try to populate community separately
        try {
          query = query.populate({
            path: 'community',
            select: '_id name avatar coverImage',
            match: { _id: { $exists: true } }
          });
        } catch (communityPopulateError) {
          console.error('❌ Error populating community:', communityPopulateError);
          // Continue without community population
        }
        
        // Execute the query with timeout
        const posts = await Promise.race([
          query.exec(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 30000) // 30 second timeout
          )
        ]) as any[];
        
        console.log(`📊 Found ${posts.length} posts`);
        
        // Sanitize the posts before sending (in case of missing references)
        const sanitizedPosts = posts.map(post => {
          const postObj = post.toObject();
          
          // If user wasn't populated, set a default
          if (!postObj.user) {
            postObj.user = {
              _id: 'deleted',
              fullName: 'Deleted User',
              email: '',
              avatar: '',
              role: 'student'
            };
          }
          
          // If community wasn't populated but exists as an ID, set a default
          if (postObj.community && typeof postObj.community === 'string') {
            postObj.community = {
              _id: postObj.community,
              name: 'Unknown Community',
              avatar: '/images/default-community-banner.jpg'
            };
          }
          
          return postObj;
        });
        
        return NextResponse.json({ posts: sanitizedPosts });
      } catch (queryError) {
        console.error('❌ Error querying posts:', queryError);
        
        // Check if it's a connection reset error
        if (queryError instanceof Error && 
            (queryError.message.includes('ECONNRESET') || 
             queryError.message.includes('connection was forcibly closed') ||
             queryError.message.includes('Query timeout'))) {
          
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`🔄 Connection error, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
            continue;
          }
        }
        
        return NextResponse.json({ 
          error: 'Error querying posts', 
          message: (queryError as Error).message 
        }, { status: 500 });
      }
    } catch (error) {
      console.error(`❌ Error in GET /api/posts (attempt ${retryCount + 1}):`, error);
      
      // Check if it's a connection error that we should retry
      if (error instanceof Error && 
          (error.message.includes('ECONNRESET') || 
           error.message.includes('connection was forcibly closed') ||
           error.message.includes('MongoServerSelectionError'))) {
        
        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`🔄 Server error, retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
          continue;
        }
      }
      
      return NextResponse.json({ 
        error: 'Internal Server Error', 
        message: (error as Error).message 
      }, { status: 500 });
    }
  }
  
  // If we get here, all retries failed
  return NextResponse.json({ 
    error: 'Service temporarily unavailable', 
    message: 'Please try again later' 
  }, { status: 503 });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  
  // Ensure all models are registered
  registerAllModels();
  
  // Try to get session from custom session system
  let session = await getSession();
  
  // If that fails, check for session sync headers from middleware
  if (!session || !session.user || !(session.user as any).id) {
    // Check if the middleware indicated we have NextAuth session but need to sync
    const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
    if (needsSync) {
      const userId = req.headers.get('X-User-Id');
      const userEmail = req.headers.get('X-User-Email');
      const userName = req.headers.get('X-User-Name');
      
      if (userId && userEmail) {
        // Get the user from the database to have complete data
        const user = await User.findById(userId).select('-password');
        if (user) {
          // Create a mock session that matches our custom session format
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
  
  // If we still don't have a session, return unauthorized
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await req.formData();
  const content = form.get('content') as string;
  const mediaType = form.get('mediaType') as string | null;
  const media: string[] = [];

  // Handle file upload
  const file = form.get('media');
  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine folder and resource type based on media type
    let folder = 'chill-campus/posts';
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    
    if (mediaType === 'image' || (file as any).type?.startsWith('image/')) {
      folder = 'chill-campus/posts/images';
      resourceType = 'image';
    } else if (mediaType === 'video' || (file as any).type?.startsWith('video/')) {
      folder = 'chill-campus/posts/videos';
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

  if (!content && media.length === 0) {
    return NextResponse.json({ error: 'Post content or media required' }, { status: 400 });
  }
  const post = await Post.create({
    user: (session.user as any).id,
    content,
    media,
    mediaType: mediaType || null,
  });
  return NextResponse.json({ post });
}
