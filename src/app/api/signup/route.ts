// /app/api/signup/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendActivationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { fullName, email, password, confirmPassword, university } = body;

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword || !university) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');

    // Create new user (inactive by default)
    const _newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      university,
      role: 'student',
      isActive: false,
      activationToken,
    });

    // Send activation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const activationLink = `${baseUrl}/api/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
    await sendActivationEmail(email, activationLink);

    return NextResponse.json(
      { message: 'User registered successfully. Please check your email to activate your account.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
