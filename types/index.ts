export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  university?: string;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
} 