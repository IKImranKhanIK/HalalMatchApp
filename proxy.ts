/**
 * Proxy for Route Protection (Next.js 16)
 * Protects admin routes with NextAuth
 * Protects participant routes with session check
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function proxy(request: NextRequest) {
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
    // Check for participant JWT token in cookies
    const participantToken = request.cookies.get('participant_token');

    if (!participantToken) {
      // Redirect to participant login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }

    // Token verification is handled by the API routes
    // This is just a basic check for the presence of the token
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/select/:path*', '/my-selections/:path*'],
};
