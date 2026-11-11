import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

export type UserRole = 'ADMIN' | 'PROGRAM_COORDINATOR' | 'FACULTY' | 'MENTOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserSessionPayload {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  studentId?: string;
  programme?: string;
  semester?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lms_pu_secure_jwt_secret_key_2026_auth_module'
);

const COOKIE_NAME = 'lms_auth_session';

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Compare plain text password against hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token for user session
 */
export async function generateToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token string
 */
export async function verifyToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Create HTTP-only cookie with JWT session token
 */
export async function setSessionCookie(payload: UserSessionPayload): Promise<void> {
  const token = await generateToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Get and verify user session from cookies (Server Components / Server Actions)
 */
export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

/**
 * Clear authentication session cookie (Logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Helper to get redirect path based on user role
 */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PROGRAM_COORDINATOR':
      return '/program-coordinator';
    case 'FACULTY':
      return '/faculty';
    case 'MENTOR':
      return '/mentor';
    case 'STUDENT':
      return '/student';
    default:
      return '/login';
  }
}
