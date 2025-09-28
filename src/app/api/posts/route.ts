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
  try {
    console.log('🚀 POST /api/posts - Starting request');
    
    // Connect to database first
    const conn = await dbConnect();
    if (!conn) {
      console.error('❌ Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    console.log('✅ Database connected');
    
    // Ensure all models are registered
    registerAllModels();
    console.log('✅ Models registered');
    
    // Try to get session from custom session system first
    let session = await getSession();
    console.log('🔐 Custom session check:', !!session);
    
    // If that fails, try NextAuth session as fallback
    if (!session || !session.user || !(session.user as any).id) {
      try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/lib/auth');
        const nextAuthSession = await getServerSession(authOptions);
        console.log('🔐 NextAuth session check:', !!nextAuthSession);
        
        if (nextAuthSession && nextAuthSession.user) {
          // Convert NextAuth session to our format
          session = {
            user: {
              id: (nextAuthSession.user as any).id,
              email: nextAuthSession.user.email || '',
              fullName: nextAuthSession.user.name || 'User',
              role: (nextAuthSession.user as any).role || 'user'
            }
          };
          console.log('✅ Using NextAuth session for user:', session.user.id);
        }
      } catch (nextAuthError) {
        console.warn('⚠️ NextAuth session check failed:', nextAuthError);
      }
      
      // If still no session, check middleware headers
      if (!session || !session.user || !(session.user as any).id) {
        const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
        if (needsSync) {
          const userId = req.headers.get('X-User-Id');
          const userEmail = req.headers.get('X-User-Email');
          const userName = req.headers.get('X-User-Name');
          
          console.log('🔐 Middleware session data:', { userId, userEmail, userName });
          
          if (userId && userEmail) {
            try {
              // Get the user from the database to have complete data
              const user = await User.findById(userId).select('-password');
              if (user) {
                // Create a session that matches our custom session format
                session = {
                  user: {
                    id: userId,
                    email: userEmail,
                    fullName: user.fullName || userName || 'User',
                    role: user.role || 'user'
                  }
                };
                console.log('✅ Using middleware session for user:', session.user.id);
              }
            } catch (userFetchError) {
              console.error('❌ Failed to fetch user from middleware data:', userFetchError);
            }
          }
        }
      }
    }
    
    // If we still don't have a session, return unauthorized
    if (!session || !session.user || !(session.user as any).id) {
      console.error('❌ No valid session found - all methods failed');
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please log in to create posts',
        debug: {
          customSession: false,
          nextAuthSession: false,
          middlewareSession: false,
        }
      }, { status: 401 });
    }
    
    console.log('✅ Session validated for user:', (session.user as any).id);
    
    // Parse form data
    let form;
    try {
      form = await req.formData();
      console.log('✅ Form data parsed');
    } catch (formError) {
      console.error('❌ Error parsing form data:', formError);
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    
    const content = form.get('content') as string;
    const mediaType = form.get('mediaType') as string | null;
    const media: string[] = [];
    
    console.log('📝 Post data:', { content: content?.length, mediaType });

    // Handle file upload
    const file = form.get('media');
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const fileInfo = {
        name: (file as any).name,
        type: (file as any).type,
        size: (file as any).size
      };
      
      console.log('📁 Processing file upload:', fileInfo);
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg'
      ];
      
      if (!allowedTypes.includes(fileInfo.type)) {
        console.error('❌ Invalid file type:', fileInfo.type);
        return NextResponse.json({ 
          error: 'Invalid file type', 
          message: 'Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed',
          allowedTypes
        }, { status: 400 });
      }
      
      // Validate file size (4MB limit for Vercel)
      const maxSize = 4 * 1024 * 1024; // 4MB
      if (fileInfo.size > maxSize) {
        console.error('❌ File too large:', fileInfo.size);
        return NextResponse.json({ 
          error: 'File too large', 
          message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
          currentSize: `${(fileInfo.size / 1024 / 1024).toFixed(2)}MB`,
          maxSize: `${maxSize / 1024 / 1024}MB`
        }, { status: 400 });
      }
      
      try {
        console.log('🔄 Converting file to buffer...');
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('✅ File buffer created, size:', buffer.length);
        
        if (buffer.length === 0) {
          throw new Error('File buffer is empty');
        }
        
        // Determine folder and resource type based on media type
        let folder = 'chill-campus/posts';
        let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
        
        if (mediaType === 'image' || fileInfo.type.startsWith('image/')) {
          folder = 'chill-campus/posts/images';
          resourceType = 'image';
        } else if (mediaType === 'video' || fileInfo.type.startsWith('video/')) {
          folder = 'chill-campus/posts/videos';
          resourceType = 'video';
        }
        
        console.log('☁️ Uploading to Cloudinary:', { folder, resourceType, bufferSize: buffer.length });
        
        const uploadResult = await uploadToCloudinary(buffer, {
          folder,
          originalName: fileInfo.name,
          resourceType,
          maxFileSize: maxSize,
        });
        
        console.log('✅ Cloudinary upload successful:', {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          format: uploadResult.format,
          bytes: uploadResult.bytes
        });
        
        media.push(uploadResult.url);
      } catch (uploadError) {
        console.error('❌ File upload process failed:', uploadError);
        console.error('❌ Upload error name:', (uploadError as Error).name);
        console.error('❌ Upload error stack:', (uploadError as Error).stack);
        
        // Log environment variables status for debugging
        const envStatus = {
          CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        };
        console.error('❌ Environment status:', envStatus);
        
        // Provide specific error messages
        let errorMessage = 'File upload failed';
        let errorDetails = (uploadError as Error).message;
        let errorCode = 'UPLOAD_ERROR';
        
        if (errorDetails.includes('timeout')) {
          errorMessage = 'Upload timeout - file may be too large or connection slow';
          errorCode = 'TIMEOUT_ERROR';
        } else if (errorDetails.includes('Invalid buffer')) {
          errorMessage = 'Invalid file - file may be corrupted';
          errorCode = 'BUFFER_ERROR';
        } else if (errorDetails.includes('quota') || errorDetails.includes('limit')) {
          errorMessage = 'Storage quota exceeded';
          errorCode = 'QUOTA_ERROR';
        } else if (errorDetails.includes('Missing Cloudinary') || errorDetails.includes('configuration')) {
          errorMessage = 'Server configuration error';
          errorDetails = 'Cloudinary credentials missing or invalid';
          errorCode = 'CONFIG_ERROR';
        } else if (errorDetails.includes('unauthorized') || errorDetails.includes('401')) {
          errorMessage = 'Invalid Cloudinary credentials';
          errorCode = 'AUTH_ERROR';
        } else if (errorDetails.includes('network') || errorDetails.includes('ECONNRESET')) {
          errorMessage = 'Network connection error';
          errorCode = 'NETWORK_ERROR';
        }
        
        return NextResponse.json({ 
          error: errorMessage, 
          details: errorDetails,
          errorCode,
          timestamp: new Date().toISOString(),
          fileInfo: {
            name: fileInfo.name,
            type: fileInfo.type,
            size: `${(fileInfo.size / 1024).toFixed(2)}KB`,
            bufferCreated: true,
          },
          environment: envStatus,
          debugUrl: `${process.env.NEXTAUTH_URL || 'https://chill-campus-2025.vercel.app'}/api/debug/upload`
        }, { status: 500 });
      }
    } else if (file && typeof file === 'string') {
      media.push(file);
      console.log('✅ Using existing media URL:', file);
    }

    if (!content && media.length === 0) {
      console.error('❌ No content or media provided');
      return NextResponse.json({ error: 'Post content or media required' }, { status: 400 });
    }
    
    try {
      console.log('💾 Creating post in database');
      const post = await Post.create({
        user: (session.user as any).id,
        content,
        media,
        mediaType: mediaType || null,
      });
      console.log('✅ Post created successfully:', post._id);
      
      return NextResponse.json({ post });
    } catch (dbError) {
      console.error('❌ Database error creating post:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create post', 
        details: (dbError as Error).message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/posts:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
