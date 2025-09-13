// /app/api/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendActivationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    console.log('🚀 POST /api/signup - Starting registration');
    
    // Connect to database first
    const conn = await dbConnect();
    if (!conn) {
      console.error('❌ Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    console.log('✅ Database connected');
    
    const body = await req.json();
    console.log('📝 Registration attempt for:', body.email);

    const { fullName, email, password, confirmPassword, university } = body;

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword || !university) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    console.log('🔒 Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    console.log('🎫 Generated activation token');

    // Create new user (inactive by default)
    console.log('👤 Creating new user');
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      university,
      role: 'student',
      isActive: false,
      activationToken,
    });

    console.log('✅ User created successfully:', newUser._id);

    // Send activation email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const activationLink = `${baseUrl}/api/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
      
      console.log('📧 Sending activation email to:', email);
      await sendActivationEmail(email, activationLink);
      console.log('✅ Activation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send activation email:', emailError);
      // Don't fail the registration if email fails, user can request resend
      console.log('⚠️ User created but email failed, continuing...');
    }

    return NextResponse.json(
      { message: 'User registered successfully. Please check your email to activate your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Signup Error:', error);
    
    // Check for specific MongoDB errors
    if ((error as any).code === 11000) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    
    // Check for validation errors
    if ((error as any).name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json({ error: 'Validation error', details: validationErrors }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Registration failed'
    }, { status: 500 });
  }
}
