import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Community from '@/models/Community';
import Message from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'posts', 'users', 'communities', 'messages'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        error: 'Query must be at least 2 characters long' 
      }, { status: 400 });
    }

    await dbConnect();

    const searchRegex = new RegExp(query, 'i');
    const results: any = {
      posts: [],
      users: [],
      communities: [],
      messages: [],
      total: 0
    };

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: searchRegex }
        ],
        disabled: false
      })
      .populate('user', 'fullName avatar email')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      results.posts = posts
        .filter(post => post.user) // Filter out posts without user data
        .map(post => ({
          _id: post._id,
          content: post.content,
          user: post.user,
          community: post.community,
          createdAt: post.createdAt,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
          type: 'post'
        }));
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { fullName: searchRegex },
          { email: searchRegex }
        ]
      })
      .select('fullName email avatar createdAt')
      .sort({ fullName: 1 })
      .limit(limit)
      .lean();

      results.users = users
        .filter(user => user.fullName) // Filter out users without fullName
        .map(user => ({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          type: 'user'
        }));
    }

    // Search communities
    if (type === 'all' || type === 'communities') {
      const communities = await Community.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('createdBy', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      results.communities = communities
        .filter(community => community.name) // Filter out communities without name
        .map(community => ({
          _id: community._id,
          name: community.name,
          description: community.description,
          coverImage: community.coverImage,
          memberCount: community.members?.length || 0,
          createdBy: community.createdBy,
          createdAt: community.createdAt,
          type: 'community'
        }));
    }

    // Search messages (only in communities the user is a member of)
    if (type === 'all' || type === 'messages') {
      // First get user's communities
      const userCommunities = await Community.find({
        members: session.user.id
      }).select('_id');

      const communityIds = userCommunities.map(c => c._id);

      const messages = await Message.find({
        community: { $in: communityIds },
        content: searchRegex
      })
      .populate('sender', 'fullName avatar')
      .populate('community', 'name')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

      results.messages = messages
        .filter(message => message.sender && message.community) // Filter out messages without sender or community
        .map(message => ({
          _id: message._id,
          content: message.content,
          sender: message.sender,
          community: message.community,
          timestamp: message.timestamp,
          type: 'message'
        }));
    }

    // Calculate total results
    results.total = results.posts.length + results.users.length + 
                   results.communities.length + results.messages.length;

    // If searching for 'all', limit results per category
    if (type === 'all') {
      results.posts = results.posts.slice(0, 3);
      results.users = results.users.slice(0, 3);
      results.communities = results.communities.slice(0, 3);
      results.messages = results.messages.slice(0, 3);
    }

    return NextResponse.json({
      success: true,
      query,
      results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// Quick search endpoint for autocomplete
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await request.json();
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    await dbConnect();
    
    const searchRegex = new RegExp(query, 'i');
    const suggestions: any[] = [];

    // Get quick suggestions from different categories
    const [users, communities, posts] = await Promise.all([
      User.find({ fullName: searchRegex })
        .select('fullName avatar')
        .limit(3)
        .lean(),
      
      Community.find({ name: searchRegex })
        .select('name coverImage')
        .limit(3)
        .lean(),
      
      Post.find({ content: searchRegex })
        .select('content')
        .limit(3)
        .lean()
    ]);

    // Format suggestions with safety checks
    users.forEach(user => {
      if (user.fullName) {
        suggestions.push({
          type: 'user',
          id: user._id,
          text: user.fullName,
          avatar: user.avatar,
          category: 'Users'
        });
      }
    });

    communities.forEach(community => {
      if (community.name) {
        suggestions.push({
          type: 'community',
          id: community._id,
          text: community.name,
          avatar: community.coverImage,
          category: 'Communities'
        });
      }
    });

    posts.forEach(post => {
      if (post.content) {
        suggestions.push({
          type: 'post',
          id: post._id,
          text: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
          category: 'Posts'
        });
      }
    });

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Quick search error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
