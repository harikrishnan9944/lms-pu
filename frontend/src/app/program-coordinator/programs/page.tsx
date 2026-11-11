import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminPrograms } from '@/components/admin/AdminPrograms';

export default async function ProgramCoordinatorProgramsPage() {
  const session = await requireUserWithRole(['PROGRAM_COORDINATOR', 'ADMIN']);

  return (
    <DashboardLayout user={session}>
      <AdminPrograms />
    </DashboardLayout>
  );
}
