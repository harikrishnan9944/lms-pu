import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminCourses } from '@/components/admin/AdminCourses';

export default async function ProgramCoordinatorCoursesPage() {
  const session = await requireUserWithRole(['PROGRAM_COORDINATOR', 'ADMIN']);

  return (
    <DashboardLayout user={session}>
      <AdminCourses />
    </DashboardLayout>
  );
}
