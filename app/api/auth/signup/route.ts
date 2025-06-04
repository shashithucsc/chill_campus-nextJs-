import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, email, password, university } = await req.json();

    // Debug: Log environment variables (without sensitive data)
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'MONGODB_URI is set' : 'MONGODB_URI is not set',
    });

    // Validate input
    if (!name || !email || !password || !university) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      return NextResponse.json(
        { message: 'Error checking existing user' },
        { status: 500 }
      );
    }

    // Create new user
    try {
      console.log('Creating new user...');
      const user = new User({
        name,
        email,
        password,
        university,
      });

      // Save the user
      await user.save();
      console.log('User created successfully:', { id: user._id, email: user.email });

      // Verify the user was created with password
      const savedUser = await User.findOne({ email }).select('+password');
      console.log('Verifying saved user:', {
        id: savedUser?._id,
        email: savedUser?.email,
        hasPassword: !!savedUser?.password,
        passwordLength: savedUser?.password?.length
      });

      // Verify the saved password can be compared
      if (savedUser?.password) {
        const verifySavedPassword = await savedUser.matchPassword(password);
        console.log('Saved password verification result:', verifySavedPassword);
        
        if (!verifySavedPassword) {
          throw new Error('Password verification failed after save');
        }
      }

      // Remove password from response
      const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
      };

      return NextResponse.json(
        { message: 'User created successfully', user: userWithoutPassword },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return NextResponse.json(
          { message: messages.join(', ') },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Error creating user' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        message: 'Error processing request',
        details: error.message
      },
      { status: 500 }
    );
  }
} 