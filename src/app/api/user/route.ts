import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    console.log('Session data:', session);

    if (!session || !session.user || typeof session.user !== 'object') {
      console.log('No valid session found');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const userData = session.user as SessionUser;
    if (!userData.id) {
      console.log('No user ID in session');
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    await dbConnect();
    
    // Find user by string ID
    const user = await User.findOne({ _id: userData.id }).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const responseData = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
    console.log('Returning user data:', responseData);

    return NextResponse.json({ user: responseData });
  } catch (error) {
    console.error('Error in /api/user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
} 