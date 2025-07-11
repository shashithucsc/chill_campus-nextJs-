import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

// This middleware runs on all API routes
export async function middleware(request: NextRequest) {
  // Only run this middleware for API routes that require authentication
  const path = request.nextUrl.pathname;
  
  // Skip middleware for auth-related routes to avoid circular dependencies
  if (path.startsWith('/api/auth') || path === '/api/login' || path === '/api/signup') {
    return NextResponse.next();
  }
  
  // For protected API routes, check both sessions
  if (path.startsWith('/api/')) {
    // Check if we have a NextAuth session
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // If the user has a NextAuth session but not a custom session, sync them
    if (token && !request.cookies.has('session')) {
      // Need to call the login API to create a custom session
      // We'll add a special header to indicate this request comes from middleware
      const response = NextResponse.next();
      response.headers.set('X-Needs-Session-Sync', 'true');
      response.headers.set('X-User-Id', token.id as string);
      response.headers.set('X-User-Email', token.email as string);
      response.headers.set('X-User-Name', token.name as string);
      return response;
    }
  }
  
  return NextResponse.next();
}

// Only run this middleware on API routes
export const config = {
  matcher: [
    '/api/:path*'
  ],
};
