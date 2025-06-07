import { API_ROUTES } from '@/constants';
import { ApiResponse, Post } from '@/types';

export const apiService = {
  async getPosts(page: number = 1, limit: number = 10): Promise<ApiResponse<Post[]>> {
    try {
      const response = await fetch(`${API_ROUTES.POSTS}?page=${page}&limit=${limit}`);
      const data = await response.json();
      console.log('Raw API Response:', data);
      
      if (data.posts && Array.isArray(data.posts)) {
        return { data: data.posts };
      } else {
        console.error('Unexpected API response format:', data);
        return { error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Failed to fetch posts' };
    }
  },

  async createPost(content: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(API_ROUTES.POSTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to create post' };
    }
  },

  async likePost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_ROUTES.POSTS}/${postId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to like post' };
    }
  },

  async addComment(postId: string, content: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_ROUTES.POSTS}/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Failed to add comment' };
    }
  },
}; 