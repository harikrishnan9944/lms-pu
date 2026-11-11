'use me';
// Note: We use 'use server' inside server actions in Next.js App Router
'use server';

import { findUserByEmailOrUsername } from '@/lib/db';
import { verifyPassword, setSessionCookie, clearSessionCookie, getRoleDashboardPath } from '@/lib/auth';
import { redirect } from 'next/navigation';

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  redirectUrl?: string;
}

export async function loginAction(prevState: any, formData: FormData): Promise<ActionResult> {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;
  const expectedRole = formData.get('role') as string;

  if (!identifier || !identifier.trim()) {
    return { success: false, error: 'Email or Username is required.' };
  }

  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  try {
    const user = await findUserByEmailOrUsername(identifier);

    if (!user) {
      return { success: false, error: 'Invalid email/username or password.' };
    }

    // Optional: Validate role portal match if role provided
    if (expectedRole && user.role !== expectedRole) {
      const prettyRole = user.role.replace('_', ' ');
      return {
        success: false,
        error: `This account is registered as ${prettyRole}. Please go back and select the ${prettyRole} Portal card.`,
      };
    }

    // Check account status
    if (user.status === 'INACTIVE') {
      return {
        success: false,
        error: 'Your account is currently inactive. Please contact the administrator.',
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email/username or password.' };
    }

    // Create secure HTTP-only session cookie
    await setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      studentId: user.studentId || undefined,
      programme: user.programme || undefined,
      semester: user.semester || undefined,
      imageUrl: user.imageUrl || undefined,
    });

    const redirectUrl = getRoleDashboardPath(user.role);
    return { success: true, redirectUrl };
  } catch (err: any) {
    console.error('Login action error:', err);
    return { success: false, error: 'An unexpected server error occurred. Please try again.' };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
