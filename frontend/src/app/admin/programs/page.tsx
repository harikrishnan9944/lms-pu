import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminPrograms } from '@/components/admin/AdminPrograms';

export default async function AdminProgramsPage() {
  const session = await requireUserWithRole(['ADMIN', 'PROGRAM_COORDINATOR']);

  return (
    <DashboardLayout user={session}>
      <AdminPrograms />
    </DashboardLayout>
  );
}
