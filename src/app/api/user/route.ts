import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    // Check for explicit userId in query params first
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');
    let userId: string | null = null;
    
    if (queryUserId && mongoose.Types.ObjectId.isValid(queryUserId)) {
      console.log('Using userId from query param:', queryUserId);
      userId = queryUserId;
    } else {
      // Try to get session from custom session system
      const session = await getSession();
      console.log('Custom session data:', session);

      // If that fails, check for session sync headers from middleware
      if (!session || !session.user || typeof session.user !== 'object' || !(session.user as any).id) {
        // Check if the middleware indicated we have NextAuth session but need to sync
        const needsSync = req.headers.get('X-Needs-Session-Sync') === 'true';
        if (needsSync) {
          const headerUserId = req.headers.get('X-User-Id');
          const userEmail = req.headers.get('X-User-Email');
          const userName = req.headers.get('X-User-Name');
          
          console.log('Session sync headers:', { headerUserId, userEmail, userName });
          
          if (headerUserId && mongoose.Types.ObjectId.isValid(headerUserId)) {
            userId = headerUserId;
            console.log('Using user ID from request headers:', headerUserId);
          }
        }
      } else if ((session?.user as any)?.id && mongoose.Types.ObjectId.isValid((session.user as any).id)) {
        userId = (session.user as any).id;
        console.log('Using user ID from custom session:', userId);
      }
    }
    
    // If we still don't have a userId, return not authenticated
    if (!userId) {
      console.log('No valid userId found');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    
    // Find user by string ID
    const user = await User.findOne({ _id: userId }).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const responseData = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      university: user.university || '',
      avatar: user.avatar || ''
    };
    console.log('Returning user data:', responseData);

    return NextResponse.json({ user: responseData });
  } catch (error) {
    console.error('Error in /api/user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const form = await req.formData();
    const fullName = form.get('fullName') as string;
    let avatarUrl = null;
    const avatarFile = form.get('avatar');
    if (avatarFile && typeof avatarFile === 'object' && 'arrayBuffer' in avatarFile) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const ext = (avatarFile as any).name?.split('.').pop() || 'jpg';
      const fileName = `${userId}-avatar.${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
      await fs.writeFile(uploadPath, buffer);
      avatarUrl = `/uploads/${fileName}`;
    }
    const update: any = {};
    if (fullName) update.fullName = fullName;
    if (avatarUrl) update.avatar = avatarUrl;
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}