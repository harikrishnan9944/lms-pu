import { Suspense } from 'react';
import { requireUserWithRole } from '@/lib/rbac';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MentorDashboard } from '@/components/mentor/MentorDashboard';

export default async function MentorPage() {
  const session = await requireUserWithRole(['MENTOR', 'ADMIN']);

  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading Mentor Portal...</div>}>
      <DashboardLayout user={session}>
        <MentorDashboard user={session} />
      </DashboardLayout>
    </Suspense>
  );
}
