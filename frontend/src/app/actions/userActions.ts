'use server';

import {
  createUser,
  getPaginatedUsers,
  updateUserStatus,
  updateUser,
  resetUserPassword,
  deleteUser,
  getDashboardCounts,
  GetUsersOptions,
  autoAssignStudentsToMentors,
  getMentorMentees,
  getMenteeDetailedActivity,
  getMentorRecentActivities,
  saveMentoringMeeting,
} from '@/lib/db';
import { getSession, hashPassword, UserRole, UserStatus } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function checkAdminAuthorization() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN' || session.status !== 'ACTIVE') {
    throw new Error('Unauthorized. Admin access required.');
  }
  return session;
}

export async function checkMentorOrAdminAuthorization() {
  const session = await getSession();
  if (!session || (session.role !== 'MENTOR' && session.role !== 'ADMIN') || session.status !== 'ACTIVE') {
    throw new Error('Unauthorized. Mentor or Admin access required.');
  }
  return session;
}

export async function checkAdminOrCoordinatorAuthorization() {
  const session = await getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'PROGRAM_COORDINATOR') || session.status !== 'ACTIVE') {
    throw new Error('Unauthorized. Admin or Programme Coordinator access required.');
  }
  return session;
}

export async function checkAnyAuthenticatedUser() {
  const session = await getSession();
  if (!session || session.status !== 'ACTIVE') {
    throw new Error('Unauthorized session.');
  }
  return session;
}

export async function fetchUsersAction(options: GetUsersOptions) {
  await checkAnyAuthenticatedUser();
  return await getPaginatedUsers(options);
}

export async function fetchMetricsAction() {
  await checkAdminOrCoordinatorAuthorization();
  return await getDashboardCounts();
}

export async function createUserAction(formData: {
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  qualification?: string;
  programme?: string;
  subject?: string;
  mobile?: string;
  studentId?: string;
  semester?: string;
  address?: string;
  academicInfo?: string;
  imageUrl?: string;
}) {
  try {
    await checkAdminAuthorization();

    const { name, email, username, password, role, status, qualification, programme, subject, mobile, studentId, semester, address, academicInfo, imageUrl } = formData;

    if (!name || !name.trim()) return { success: false, error: 'Full name is required.' };
    if (!email || !email.trim()) return { success: false, error: 'Email address is required.' };
    if (!username || !username.trim()) return { success: false, error: 'Username is required.' };
    if (!password || password.length < 6)
      return { success: false, error: 'Temporary password must be at least 6 characters long.' };

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (mobile && mobile.trim() && !/^[+0-9\s-]{8,15}$/.test(mobile.trim())) {
      return { success: false, error: 'Please enter a valid mobile phone number.' };
    }

    // Allow creation of all roles including Admin


    const passwordHash = await hashPassword(password);
    const newUser = await createUser({
      name: name.trim(),
      email: email.trim(),
      username: username.trim(),
      passwordHash,
      role,
      status: status || 'ACTIVE',
      qualification,
      programme,
      subject,
      mobile,
      studentId,
      semester,
      address,
      academicInfo,
      imageUrl,
    });

    revalidatePath('/admin');
    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create user account.' };
  }
}

export async function toggleUserStatusAction(userId: string, currentStatus: UserStatus) {
  try {
    await checkAdminAuthorization();

    const newStatus: UserStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    await updateUserStatus(userId, newStatus);
    revalidatePath('/admin');
    return { success: true, newStatus };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update user status.' };
  }
}

export async function updateUserAction(
  userId: string,
  data: {
    name: string;
    email: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    qualification?: string;
    programme?: string;
    subject?: string;
    mobile?: string;
    studentId?: string;
    semester?: string;
    address?: string;
    academicInfo?: string;
    imageUrl?: string;
  }
) {
  try {
    await checkAdminOrCoordinatorAuthorization();

    if (!data.name.trim()) return { success: false, error: 'Name cannot be empty.' };
    if (!data.email.trim()) return { success: false, error: 'Email cannot be empty.' };
    if (!data.username.trim()) return { success: false, error: 'Username cannot be empty.' };

    await updateUser(userId, data);

    revalidatePath('/admin');
    revalidatePath('/program-coordinator');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update user.' };
  }
}

export async function resetPasswordAction(userId: string, newPassword: string) {
  try {
    await checkAdminAuthorization();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const passwordHash = await hashPassword(newPassword);
    await resetUserPassword(userId, passwordHash);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reset password.' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await checkAdminAuthorization();

    await deleteUser(userId);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete user account.' };
  }
}

export async function autoAssignMentorsAction() {
  try {
    await checkAdminOrCoordinatorAuthorization();
    const result = await autoAssignStudentsToMentors();
    revalidatePath('/admin');
    revalidatePath('/mentor');
    return result;
  } catch (err: any) {
    return { success: false, message: err.message || 'Auto-assignment failed.' };
  }
}

export async function fetchMentorMenteesAction(mentorId?: string) {
  const session = await checkMentorOrAdminAuthorization();
  const targetId = mentorId || session.id;
  return await getMentorMentees(targetId);
}

export async function fetchMenteeDetailedActivityAction(studentId: string) {
  await checkMentorOrAdminAuthorization();
  return await getMenteeDetailedActivity(studentId);
}

export async function fetchMentorRecentActivitiesAction(mentorId?: string) {
  const session = await checkMentorOrAdminAuthorization();
  const targetId = mentorId || session.id;
  return await getMentorRecentActivities(targetId);
}

export async function saveMentoringMeetingAction(data: {
  studentId: string;
  meetingInfo: string;
  notes?: string;
  historyEntry?: string;
}) {
  await checkMentorOrAdminAuthorization();
  const result = await saveMentoringMeeting(data);
  revalidatePath('/mentor');
  revalidatePath('/student');
  return { success: true, result };
}
