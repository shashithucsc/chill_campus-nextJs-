import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.json({ error: 'Invalid activation link.' }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email, activationToken: token });
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired activation link.' }, { status: 400 });
  }

  user.isActive = true;
  user.activationToken = '';
  await user.save();

  // Optionally, redirect to login page or show a success message
  return NextResponse.json({ message: 'Account activated successfully. You can now log in.' });
}
