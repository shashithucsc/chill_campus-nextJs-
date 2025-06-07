import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { apiService } from '@/services/api';

export const usePosts = (initialPage = 1) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts(page);
      console.log('API Response:', response);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const postsData = Array.isArray(response.data) ? response.data : [];
        console.log('Posts data:', postsData);
        setPosts(postsData);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    try {
      const response = await apiService.createPost(content);
      if (response.error) {
        setError(response.error);
        return false;
      }
      if (response.data) {
        setPosts((prev) => [response.data!, ...prev]);
        return true;
      }
    } catch (err) {
      setError('Failed to create post');
      return false;
    }
    return false;
  };

  const likePost = async (postId: string) => {
    try {
      const response = await apiService.likePost(postId);
      if (response.error) {
        setError(response.error);
        return false;
      }
      if (response.data) {
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? response.data! : post))
        );
        return true;
      }
    } catch (err) {
      setError('Failed to like post');
      return false;
    }
    return false;
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  return {
    posts,
    loading,
    error,
    page,
    setPage,
    createPost,
    likePost,
    refreshPosts: fetchPosts,
  };
}; 