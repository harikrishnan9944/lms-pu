import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminCourses } from '@/components/admin/AdminCourses';

export default async function AdminCoursesPage() {
  const session = await requireUserWithRole(['ADMIN', 'PROGRAM_COORDINATOR']);

  return (
    <DashboardLayout user={session}>
      <AdminCourses />
    </DashboardLayout>
  );
}
