import { requireUserWithRole } from '@/lib/rbac';
import { getDashboardCounts } from '@/lib/db';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManagementView } from '@/components/admin/UserManagementView';

export default async function UserManagementPage() {
  const session = await requireUserWithRole(['ADMIN']);
  const initialMetrics = await getDashboardCounts();

  return (
    <DashboardLayout user={session}>
      <UserManagementView initialMetrics={initialMetrics} />
    </DashboardLayout>
  );
}
