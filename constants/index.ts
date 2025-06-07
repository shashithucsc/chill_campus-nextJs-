export const API_ROUTES = {
  POSTS: '/api/posts',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const POSTS_PER_PAGE = 10;

export const DEFAULT_AVATAR = '/default-avatar.png'; 