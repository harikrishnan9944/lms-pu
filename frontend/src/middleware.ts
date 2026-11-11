import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lms_pu_secure_jwt_secret_key_2026_auth_module'
);

const COOKIE_NAME = 'lms_auth_session';

const ROLE_ROUTES: { pathPrefix: string; roles: string[] }[] = [
  { pathPrefix: '/admin', roles: ['ADMIN'] },
  { pathPrefix: '/program-coordinator', roles: ['PROGRAM_COORDINATOR'] },
  { pathPrefix: '/faculty', roles: ['FACULTY'] },
  { pathPrefix: '/mentor', roles: ['MENTOR', 'ADMIN'] },
  { pathPrefix: '/student', roles: ['STUDENT'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: any = null;

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      session = verified.payload;
    } catch {
      session = null;
    }
  }

  // 1. If accessing login page when already authenticated
  if (pathname === '/login' || pathname === '/') {
    // Allow intentional navigation to role selection or switch
    if (request.nextUrl.searchParams.has('switch') || request.nextUrl.searchParams.has('home')) {
      return NextResponse.next();
    }

    if (session && session.role && session.status === 'ACTIVE') {
      const rolePaths: Record<string, string> = {
        ADMIN: '/admin',
        PROGRAM_COORDINATOR: '/program-coordinator',
        FACULTY: '/faculty',
        MENTOR: '/mentor',
        STUDENT: '/student',
      };
      const redirectPath = rolePaths[session.role as string] || '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // 2. Check protected routes
  for (const routeConfig of ROLE_ROUTES) {
    if (pathname.startsWith(routeConfig.pathPrefix)) {
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (session.status !== 'ACTIVE') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'inactive');
        return NextResponse.redirect(loginUrl);
      }

      // Check role access
      if (!routeConfig.roles.includes(session.role)) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/program-coordinator/:path*',
    '/faculty/:path*',
    '/mentor/:path*',
    '/student/:path*',
  ],
};
