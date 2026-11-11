import { getSession, getRoleDashboardPath } from '@/lib/auth';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default async function AccessDeniedPage() {
  const session = await getSession();
  const dashboardPath = session ? getRoleDashboardPath(session.role) : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-500 mt-2">
            You don't have permission to access this page. Your role ({session?.role || 'Guest'}) does not grant administrative privileges for this resource.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={dashboardPath}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
