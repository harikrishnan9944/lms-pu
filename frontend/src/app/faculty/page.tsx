import { Suspense } from 'react';
import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FacultyDashboard } from '@/components/faculty/FacultyDashboard';

export default async function FacultyPage() {
  const session = await requireUserWithRole(['FACULTY', 'ADMIN']);

  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading Faculty Portal...</div>}>
      <DashboardLayout user={session}>
        <FacultyDashboard user={session} />
      </DashboardLayout>
    </Suspense>
  );
}
