import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db'; 
import User from '@/models/User';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email); // Debug log

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found'); // Debug log
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password'); // Debug log
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    console.log('Creating session for user:', user._id.toString());
    // Create session with string ID
    await createSession({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });

    // Return user data without sensitive information
    const userData = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
    console.log('Login successful, returning user data:', userData); // Debug log

    return NextResponse.json({ 
      message: 'Login successful', 
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
