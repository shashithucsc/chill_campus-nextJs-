import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.category || !data.description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a community with this name already exists
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp('^' + data.name.trim() + '$', 'i') }
    });

    if (existingCommunity) {
      return NextResponse.json(
        { success: false, message: 'A community with this name already exists' },
        { status: 400 }
      );
    }

    // Create the community
    const community = await Community.create({
      ...data,
      name: data.name.trim(),
      createdBy: session.user.id,
      members: [session.user.id] // Add creator as first member
    });

    return NextResponse.json(
      { success: true, message: 'Community created successfully', community },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create community error:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A community with this name already exists' },
        { status: 400 }
      );
    }

    // Log the actual error for debugging
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyValue: error.keyValue
    });

    return NextResponse.json(
      { success: false, message: 'Failed to create community: ' + error.message },
      { status: 500 }
    );
  }
}
