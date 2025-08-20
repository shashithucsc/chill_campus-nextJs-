import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import mongoose from 'mongoose';

// GET - Get current user's favorite users
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;
    
    // Find current user and populate favorites
    const user = await User.findById(currentUserId)
      .populate('favorites', 'fullName email avatar bio university role')
      .select('favorites');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      favorites: user.favorites || []
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add user to favorites
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Can't add yourself to favorites
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'You cannot add yourself to favorites' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Initialize favorites array if it doesn't exist
    if (!currentUser.favorites) {
      currentUser.favorites = [];
    }

    // Check if already in favorites
    const isAlreadyFavorite = currentUser.favorites.some(
      (id: any) => id.toString() === userId
    );

    if (isAlreadyFavorite) {
      return NextResponse.json(
        { error: 'User is already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    currentUser.favorites.push(new mongoose.Types.ObjectId(userId));
    await currentUser.save();

    return NextResponse.json({
      success: true,
      message: 'User added to favorites'
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE - Remove user from favorites
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Remove from favorites
    if (currentUser.favorites) {
      currentUser.favorites = currentUser.favorites.filter(
        (id: any) => id.toString() !== userId
      );
      await currentUser.save();
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from favorites'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
