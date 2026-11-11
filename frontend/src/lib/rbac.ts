import { UserRole, getSession } from './auth';
import { redirect } from 'next/navigation';

export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/program-coordinator': ['PROGRAM_COORDINATOR', 'ADMIN'],
  '/faculty': ['FACULTY', 'ADMIN'],
  '/mentor': ['MENTOR', 'ADMIN'],
  '/student': ['STUDENT', 'ADMIN'],
};

/**
 * Server Component Helper to enforce authentication and required role(s)
 */
export async function requireUserWithRole(allowedRoles: UserRole[]) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.status !== 'ACTIVE') {
    redirect('/login?error=inactive');
  }

  if (!allowedRoles.includes(session.role)) {
    redirect('/access-denied');
  }

  return session;
}
