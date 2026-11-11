import { requireUserWithRole } from '@/lib/rbac';
import { getDashboardCounts } from '@/lib/db';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';

export default async function AdminDashboardPage() {
  const session = await requireUserWithRole(['ADMIN']);
  const initialMetrics = await getDashboardCounts();

  return (
    <DashboardLayout user={session}>
      <AdminUserManagement initialMetrics={initialMetrics} />
    </DashboardLayout>
  );
}
