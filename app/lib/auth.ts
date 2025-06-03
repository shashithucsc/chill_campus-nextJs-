import { cookies } from 'next/headers';

export interface User {
  _id: string;
  name: string;
  email: string;
  university: string;
}

export const setUserSession = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserSession = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const clearUserSession = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getUserSession();
}; 