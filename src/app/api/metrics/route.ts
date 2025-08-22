import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Community from '@/models/Community';
import Post from '@/models/Post';
// import Comment from '@/models/Comment';
import Report from '@/models/Report';

export async function GET() {
  await dbConnect();

  const totalUsers = await User.countDocuments();
  const totalCommunities = await Community.countDocuments();
  const totalPosts = await Post.countDocuments();
  const reportedPosts = await Report.countDocuments();
  const newSignupsWeek = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  // Count comments from posts' comments arrays
  const posts = await Post.find({}, { comments: 1 }).lean();
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

  return NextResponse.json({
    totalUsers,
    totalCommunities,
    totalPosts,
    reportedPosts,
    newSignupsWeek,
    totalComments,
  });
}
