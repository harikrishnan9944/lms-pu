'use client';

import React, { useState, useEffect } from 'react';
import { fetchApplicationsAction, updateApplicationStatusAction } from '@/app/actions/lmsActions';
import { ApplicationItem } from '@/lib/db';
import { FileCheck, Search, Filter, CheckCircle2, XCircle, Clock, UserPlus, ArrowRight } from 'lucide-react';
import { Toast } from '../ui/Toast';

export function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchApplicationsAction();
      setApplications(data);
    } catch {
      setToast({ message: 'Failed to load applications.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: ApplicationItem['status']) => {
    try {
      const res = await updateApplicationStatusAction(appId, newStatus);
      if (res.success) {
        if (newStatus === 'Account Created') {
          setToast({ message: 'Application approved & LMS Student account created automatically!', type: 'success' });
        } else {
          setToast({ message: `Application status updated to '${newStatus}'.`, type: 'success' });
        }
        loadData();
      } else {
        setToast({ message: 'Failed to update application status.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error updating application status.', type: 'error' });
    }
  };

  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Submitted</span>;
      case 'Under Verification':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Under Verification</span>;
      case 'Verified':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Verified</span>;
      case 'Pending Approval':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Pending Approval</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Approved</span>;
      case 'Account Created':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-sm">Account Created</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const filtered = applications.filter((a) => {
    const matchesSearch = a.applicantName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-purple-600" />
            Application & Admission Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student applications: Submission → Verification → Admission Approval → LMS Account Creation
          </p>
        </div>
      </div>

      {/* Workflow Stepper Guide */}
      <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between overflow-x-auto text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800"><Clock className="w-3.5 h-3.5 text-slate-500" /> Submitted</span>
        <ArrowRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        <span className="flex items-center gap-1.5 font-semibold text-amber-700">Under Verification</span>
        <ArrowRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        <span className="flex items-center gap-1.5 font-semibold text-blue-700">Verified</span>
        <ArrowRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        <span className="flex items-center gap-1.5 font-semibold text-purple-700">Approved</span>
        <ArrowRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
        <span className="flex items-center gap-1.5 font-bold text-emerald-700"><UserPlus className="w-3.5 h-3.5 text-emerald-600" /> LMS Account Created</span>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Verified">Verified</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Account Created">Account Created</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="p-3.5">App ID</th>
              <th className="p-3.5">Applicant Name</th>
              <th className="p-3.5">Programme</th>
              <th className="p-3.5">Applied Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Workflow Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400">Loading applications...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400">No applications found.</td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-slate-600">{app.id}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{app.applicantName}</div>
                    <div className="text-xs text-slate-400">{app.email} • {app.mobile}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{app.programme}</td>
                  <td className="p-3.5 text-xs text-slate-500">{app.appliedDate}</td>
                  <td className="p-3.5">{getStatusBadge(app.status)}</td>
                  <td className="p-3.5 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationItem['status'])}
                      className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="Submitted">1. Submitted</option>
                      <option value="Under Verification">2. Under Verification</option>
                      <option value="Verified">3. Verified</option>
                      <option value="Pending Approval">4. Pending Approval</option>
                      <option value="Approved">5. Approved</option>
                      <option value="Account Created">6. Create LMS Account</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
