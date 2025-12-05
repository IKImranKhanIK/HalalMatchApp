/**
 * Middleware for Route Protection
 * Protects admin routes with NextAuth
 * Protects participant routes with session check
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check authentication
    const session = await auth();

    if (!session) {
      // Redirect to login
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect participant routes
  if (pathname.startsWith('/select') || pathname.startsWith('/my-selections')) {
    // Check for participant session in cookies or localStorage
    // Note: localStorage check needs to be done client-side
    // We'll redirect to login if no session found
    const participantSession = request.cookies.get('participant_session');

    if (!participantSession) {
      // Redirect to participant login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/select/:path*', '/my-selections/:path*'],
};
