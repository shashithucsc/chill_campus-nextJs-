'use client';

import { usePosts } from '@/hooks/usePosts';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function Feed() {
  const { posts, loading, error, createPost, likePost } = usePosts();

  if (loading) {
    return <div className="text-center py-4">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  // Ensure posts is an array before mapping
  const postsArray = Array.isArray(posts) ? posts : [];

  if (postsArray.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <CreatePost onCreatePost={createPost} />
        <div className="text-center py-4 text-gray-500">
          No posts yet. Be the first to post!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <CreatePost onCreatePost={createPost} />
      <div className="space-y-4 mt-4">
        {postsArray.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={() => likePost(post._id)}
          />
        ))}
      </div>
    </div>
  );
} 