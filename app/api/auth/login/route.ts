import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    console.log('Login attempt started');
    const { email, password } = await req.json();
    console.log('Received login request for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      console.log('Attempting to connect to database...');
      await connectToDatabase();
      console.log('Database connection successful');
    } catch (error: any) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { message: 'Database connection error', details: error.message },
        { status: 500 }
      );
    }

    // Find user by email and explicitly select password field
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    console.log('User found:', { 
      id: user._id, 
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Verify password
    console.log('Verifying password...');
    if (!user.password) {
      console.error('User password is undefined');
      return NextResponse.json(
        { message: 'Invalid user data' },
        { status: 500 }
      );
    }

    try {
      console.log('Comparing passwords...');
      const isValidPassword = await user.matchPassword(password);
      console.log('Password comparison result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Invalid password');
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
      console.log('Password verified successfully');
    } catch (error: any) {
      console.error('Password comparison error:', error);
      return NextResponse.json(
        { message: 'Error verifying password' },
        { status: 500 }
      );
    }

    // Remove password from response
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
    };

    console.log('Login successful for user:', userWithoutPassword);
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Login error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        message: 'Error processing login request',
        details: error.message
      },
      { status: 500 }
    );
  }
} 