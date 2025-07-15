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
    
    // If the user has a NextAuth session, always provide the headers
    // This ensures session info is available even if custom session expires
    if (token) {
      console.log("Middleware: NextAuth session found for API route:", path);
      
      // Add session info headers to all API requests when user is authenticated
      const response = NextResponse.next();
      response.headers.set('X-Needs-Session-Sync', 'true');
      response.headers.set('X-User-Id', token.id as string);
      response.headers.set('X-User-Email', token.email as string);
      response.headers.set('X-User-Name', token.name as string);
      return response;
    } else {
      console.log("Middleware: No NextAuth session for API route:", path);
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
