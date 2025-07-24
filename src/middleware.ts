import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This middleware runs on protected routes and API routes
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for auth-related routes to avoid circular dependencies
  if (path.startsWith('/api/auth') || path === '/api/login' || path === '/api/signup') {
    return NextResponse.next();
  }
  
  // Check for admin routes
  if (path.startsWith('/Admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    if (token.role !== 'admin') {
      // Not an admin, redirect to unauthorized or home
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Admin user, allow access
    return NextResponse.next();
  }
  
  // Check for user home routes (require any authenticated user)
  if (path.startsWith('/home')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    if (token.role === 'admin') {
      // Admin should go to admin dashboard, not user home
      return NextResponse.redirect(new URL('/Admin/Dashboard', request.url));
    }
    
    // Regular user, allow access
    return NextResponse.next();
  }
  
  // For protected API routes, check authentication and add headers
  if (path.startsWith('/api/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // If the user has a NextAuth session, always provide the headers
    if (token) {
      console.log("Middleware: NextAuth session found for API route:", path);
      
      // Add session info headers to all API requests when user is authenticated
      const response = NextResponse.next();
      response.headers.set('X-Needs-Session-Sync', 'true');
      response.headers.set('X-User-Id', token.id as string);
      response.headers.set('X-User-Email', token.email as string);
      response.headers.set('X-User-Name', token.name as string);
      response.headers.set('X-User-Role', token.role as string);
      return response;
    } else {
      console.log("Middleware: No NextAuth session for API route:", path);
    }
  }
  
  return NextResponse.next();
}

// Run middleware on both protected routes and API routes
export const config = {
  matcher: [
    '/Admin/:path*',
    '/home/:path*',
    '/api/:path*'
  ],
};
