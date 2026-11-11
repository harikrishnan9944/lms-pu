import { Suspense } from 'react';
import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgramCoordinatorDashboard } from '@/components/program-coordinator/ProgramCoordinatorDashboard';

export default async function ProgramCoordinatorPage() {
  const session = await requireUserWithRole(['PROGRAM_COORDINATOR', 'ADMIN']);

  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading Programme Coordinator Portal...</div>}>
      <DashboardLayout user={session}>
        <ProgramCoordinatorDashboard user={session} />
      </DashboardLayout>
    </Suspense>
  );
}
