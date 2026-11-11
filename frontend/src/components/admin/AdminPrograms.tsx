'use client';

import React, { useState, useEffect } from 'react';
import { fetchProgramsAction, saveProgramAction, deleteProgramAction } from '@/app/actions/lmsActions';
import { ProgramItem } from '@/lib/db';
import { FolderKanban, Plus, Search, Filter, Edit, Trash2, Power, Eye, X, CheckCircle2 } from 'lucide-react';
import { Toast } from '../ui/Toast';

export function AdminPrograms() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProg, setSelectedProg] = useState<ProgramItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [medium, setMedium] = useState('English');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [calendarYear, setCalendarYear] = useState('2026');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProgramsAction();
      setPrograms(data);
    } catch {
      setToast({ message: 'Failed to load programmes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedProg(null);
    setName('');
    setCode('');
    setEligibility('');
    setMedium('English');
    setAcademicYear('2025-2026');
    setCalendarYear('2026');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prog: ProgramItem) => {
    setSelectedProg(prog);
    setName(prog.name);
    setCode(prog.code);
    setEligibility(prog.eligibility);
    setMedium(prog.medium);
    setAcademicYear(prog.academicYear || '2025-2026');
    setCalendarYear(prog.calendarYear || '2026');
    setStatus(prog.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await saveProgramAction({
        id: selectedProg?.id,
        name,
        code,
        eligibility,
        medium,
        academicYear,
        calendarYear,
        status,
      });

      if (!res.success) {
        setToast({ message: res.error || 'Failed to save programme.', type: 'error' });
      } else {
        setToast({ message: `Programme '${name}' saved successfully.`, type: 'success' });
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error saving programme.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (prog: ProgramItem) => {
    try {
      const newStatus = prog.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await saveProgramAction({ ...prog, status: newStatus });
      setToast({ message: `Programme status changed to ${newStatus}.`, type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to update status.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this programme?')) return;
    try {
      await deleteProgramAction(id);
      setToast({ message: 'Programme deleted.', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to delete programme.', type: 'error' });
    }
  };

  const filtered = programs.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sky-600" />
            Programme Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic degree programmes, codes, eligibility criteria, and medium of instruction.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Programme</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programme name or code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Programme Name</th>
              <th className="p-3.5">Academic Year</th>
              <th className="p-3.5">Calendar Year</th>
              <th className="p-3.5">Medium</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-slate-400">Loading programmes...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-slate-400">No programmes found.</td>
              </tr>
            ) : (
              filtered.map((prog) => (
                <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-sky-700 bg-sky-50/50 rounded-lg">{prog.code}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{prog.name}</td>
                  <td className="p-3.5 text-xs font-bold text-indigo-700">
                    <span className="px-2 py-0.5 bg-indigo-50 rounded border border-indigo-200">{prog.academicYear || '2025-2026'}</span>
                  </td>
                  <td className="p-3.5 text-xs font-bold text-amber-700">
                    <span className="px-2 py-0.5 bg-amber-50 rounded border border-amber-200">{prog.calendarYear || '2026'}</span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-600">{prog.medium}</td>
                  <td className="p-3.5 text-xs text-slate-500 max-w-xs truncate">{prog.eligibility}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      prog.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {prog.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => { setSelectedProg(prog); setIsViewModalOpen(true); }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(prog)}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"
                      title="Edit Programme"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(prog)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                      title="Toggle Active/Inactive"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prog.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedProg ? 'Edit Programme' : 'Create Programme'}
              </h3>
              <p className="text-xs text-slate-500">Specify degree programme title, code, eligibility criteria, and medium of instruction.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Programme Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MCA, MBA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Examples:</span>
                  <button
                    type="button"
                    onClick={() => { setName('MCA (Master of Computer Applications)'); setCode('010'); setEligibility('Bachelor Degree with Mathematics at 10+2 level or Graduation'); }}
                    className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold hover:bg-sky-100 border border-sky-200/60 transition-colors"
                  >
                    MCA (010)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setName('MBA (Master of Business Administration)'); setCode('020'); setEligibility('Any recognized Bachelor degree with 50% marks'); }}
                    className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 border border-indigo-200/60 transition-colors"
                  >
                    MBA (020)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="2024-2025">2024 - 2025</option>
                    <option value="2025-2026">2025 - 2026</option>
                    <option value="2026-2027">2026 - 2027</option>
                    <option value="2027-2028">2027 - 2028</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calendar Year / Admission Batch *</label>
                  <select
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="2025">2025 (Calendar Year)</option>
                    <option value="2026">2026 (Calendar Year)</option>
                    <option value="2027">2027 (Calendar Year)</option>
                    <option value="2025 Jan Admission">2025 January Admission Batch</option>
                    <option value="2025 July Admission">2025 July Admission Batch</option>
                    <option value="2026 Jan Admission">2026 January Admission Batch</option>
                    <option value="2026 July Admission">2026 July Admission Batch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Programme Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 010"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  rows={3}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. Any Bachelor degree with Mathematics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medium of Instruction</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Bilingual">Bilingual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedProg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">Programme Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 font-medium">Name:</span> <strong className="text-slate-900">{selectedProg.name}</strong></p>
              <p><span className="text-slate-500 font-medium">Code:</span> <code className="bg-slate-100 px-2 py-0.5 rounded">{selectedProg.code}</code></p>
              <p><span className="text-slate-500 font-medium">Medium:</span> {selectedProg.medium}</p>
              <p><span className="text-slate-500 font-medium">Eligibility:</span> {selectedProg.eligibility}</p>
              <p><span className="text-slate-500 font-medium">Status:</span> {selectedProg.status}</p>
            </div>
            <button onClick={() => setIsViewModalOpen(false)} className="w-full py-2 bg-slate-900 text-white rounded-xl font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
