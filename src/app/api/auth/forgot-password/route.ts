import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Find user by email (case insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    
    // If no user found, we still return success to prevent email enumeration attacks
    if (!user) {
      console.log('No user found with email:', email);
      return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
    }
    
    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Hash the token for storage
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    console.log('Generated reset token:', resetToken);
    console.log('Hashed token for storage:', hashedToken);
    
    // Update user with reset token info
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Get base URL with fallbacks to handle various deployment scenarios
    let baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    
    // If baseUrl is still undefined or contains 'undefined', fallback to localhost
    if (!baseUrl || baseUrl.includes('undefined')) {
      console.warn('Warning: NEXTAUTH_URL and NEXT_PUBLIC_APP_URL are not properly set. Using localhost fallback.');
      baseUrl = 'http://localhost:3000';
    }
    
    // Ensure baseUrl doesn't have trailing slash
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    console.log('Generated reset URL:', resetUrl);
    
    // Send email
    await sendPasswordResetEmail(user.email, resetUrl);
    
    return NextResponse.json({ message: 'If your email is registered, you will receive a password reset link shortly.' });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    return NextResponse.json({ message: 'An error occurred while processing your request' }, { status: 500 });
  }
}
