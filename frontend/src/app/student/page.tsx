import { Suspense } from 'react';
import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { findUserById } from '@/lib/db';

export default async function StudentPage() {
  const session = await requireUserWithRole(['STUDENT', 'ADMIN']);
  const fullUser = await findUserById(session.id);

  const studentUser = {
    id: fullUser?.id || session.id,
    name: fullUser?.name || session.name,
    email: fullUser?.email || session.email,
    username: fullUser?.username || session.username,
    role: fullUser?.role || session.role,
    status: fullUser?.status || session.status,
    studentId: (fullUser?.studentId || (session as any).studentId || 'PU2026MCA918') as string,
    programme: (fullUser?.programme || (session as any).programme || 'MCA') as string,
    semester: (fullUser?.semester || (session as any).semester || 'Semester 1') as string,
    mobile: (fullUser?.mobile || '') as string,
    address: (fullUser?.address || '') as string,
    academicInfo: (fullUser?.academicInfo || '') as string,
    imageUrl: (fullUser?.imageUrl || (session as any).imageUrl || '') as string,
  };

  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading Student Portal...</div>}>
      <DashboardLayout user={studentUser}>
        <StudentDashboard user={studentUser} />
      </DashboardLayout>
    </Suspense>
  );
}

