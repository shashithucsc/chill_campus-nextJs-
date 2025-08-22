import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { token: rawToken, password } = await req.json();
    
    // Clean the token: decode URL components and trim whitespace
    const token = rawToken ? decodeURIComponent(rawToken).trim() : null;
    
    console.log('Reset password request received with token:', token);
    
    if (!token || !password) {
      console.log('Missing token or password in request');
      return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }
    
    // Password validation
    if (password.length < 8) {
      console.log('Password too short');
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('Hashed token for password reset:', hashedToken);
    
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
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log('Password successfully reset for user:', user.email);
    
    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in reset-password route:', error);
    return NextResponse.json({ message: 'An error occurred while resetting password' }, { status: 500 });
  }
}
