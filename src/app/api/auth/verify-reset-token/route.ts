import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get('token');
    const token = rawToken ? decodeURIComponent(rawToken).trim() : null;
    
    console.log('Verifying token:', token);
    
    if (!token) {
      console.log('Token is missing in the request');
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('Hashed token for verification:', hashedToken);
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
    });
    
    if (!user) {
      console.log('No user found with matching token or token expired');
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }
    
    console.log('Valid token found for user:', user.email);
    return NextResponse.json({ message: 'Valid token' });
  } catch (error) {
    console.error('Error in verify-reset-token route:', error);
    return NextResponse.json({ message: 'An error occurred while verifying token' }, { status: 500 });
  }
}
