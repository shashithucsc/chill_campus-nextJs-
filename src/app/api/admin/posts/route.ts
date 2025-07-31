import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Community from '@/models/Community';
import Report from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const community = searchParams.get('community') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Lookup user information
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      
      // Lookup community information
      {
        $lookup: {
          from: 'communities',
          localField: 'community',
          foreignField: '_id',
          as: 'communityInfo'
        }
      },
      {
        $addFields: {
          communityInfo: { $arrayElemAt: ['$communityInfo', 0] }
        }
      },
      
      // Lookup reports for this post
      {
        $lookup: {
          from: 'reports',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$postId'] },
                    { $eq: ['$type', 'Post'] }
                  ]
                }
              }
            }
          ],
          as: 'reports'
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ['$likes', []] } },
          commentsCount: { $size: { $ifNull: ['$comments', []] } },
          reportsCount: { $size: '$reports' },
          hasMedia: { 
            $and: [
              { $ne: ['$media', null] },
              { $gt: [{ $size: { $ifNull: ['$media', []] } }, 0] }
            ]
          },
          status: {
            $cond: {
              if: { $eq: ['$disabled', true] },
              then: 'Disabled',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$reports' }, 0] },
                  then: 'Reported',
                  else: 'Published'
                }
              }
            }
          },
          reportReasons: {
            $map: {
              input: '$reports',
              as: 'report',
              in: '$$report.reason'
            }
          }
        }
      }
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { content: { $regex: search, $options: 'i' } },
            { 'author.fullName': { $regex: search, $options: 'i' } },
            { 'communityInfo.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add community filter
    if (community && community !== 'All') {
      pipeline.push({
        $match: { 'communityInfo.name': community }
      });
    }

    // Add status filter
    if (status && status !== 'All') {
      if (status === 'Reported') {
        pipeline.push({
          $match: { reportsCount: { $gt: 0 }, disabled: { $ne: true } }
        });
      } else if (status === 'Published') {
        pipeline.push({
          $match: { reportsCount: 0, disabled: { $ne: true } }
        });
      } else if (status === 'Disabled') {
        pipeline.push({
          $match: { disabled: true }
        });
      }
    }

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Post.aggregate(countPipeline);
    const totalPosts = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({
      $sort: { [sortBy]: sortDirection }
    });

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute aggregation
    const posts = await Post.aggregate(pipeline);

    // Transform data for frontend
    const transformedPosts = posts.map(post => ({
      id: post._id.toString(),
      content: post.content,
      authorName: post.author.fullName,
      authorAvatar: post.author.avatar || '',
      authorId: post.author._id.toString(),
      communityName: post.communityInfo?.name || 'General',
      communityId: post.communityInfo?._id?.toString() || null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likes: post.likesCount,
      comments: post.commentsCount,
      status: post.status,
      reportReasons: post.reportReasons,
      reportsCount: post.reportsCount,
      hasMedia: post.hasMedia,
      media: post.media || [], // Return full media array
      mediaUrl: post.media && post.media.length > 0 ? post.media[0] : null,
      mediaType: post.mediaType,
      disabled: post.disabled || false,
      disabledBy: post.disabledBy,
      disabledAt: post.disabledAt,
      disableReason: post.disableReason
    }));

    // Get statistics
    const stats = await Post.aggregate([
      {
        $lookup: {
          from: 'reports',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$post', '$$postId'] },
                    { $eq: ['$type', 'Post'] }
                  ]
                }
              }
            }
          ],
          as: 'reports'
        }
      },
      {
        $addFields: {
          isReported: { $gt: [{ $size: '$reports' }, 0] },
          isDisabled: { $eq: ['$disabled', true] }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$isReported', false] },
                    { $ne: ['$disabled', true] }
                  ]
                }, 
                1, 0
              ]
            }
          },
          reportedPosts: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$isReported', true] },
                    { $ne: ['$disabled', true] }
                  ]
                }, 
                1, 0
              ]
            }
          },
          disabledPosts: {
            $sum: { $cond: [{ $eq: ['$disabled', true] }, 1, 0] }
          }
        }
      }
    ]);

    const statistics = stats.length > 0 ? stats[0] : {
      totalPosts: 0,
      publishedPosts: 0,
      reportedPosts: 0,
      disabledPosts: 0
    };

    // Get communities for filter dropdown
    const communities = await Community.find({ status: 'Active' })
      .select('name')
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page < Math.ceil(totalPosts / limit),
        hasPrevPage: page > 1
      },
      stats: statistics,
      communities: communities.map(c => ({
        id: c._id.toString(),
        name: c.name
      }))
    });

  } catch (error) {
    console.error('Admin Posts API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
