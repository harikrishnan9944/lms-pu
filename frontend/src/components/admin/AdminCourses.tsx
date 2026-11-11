'use client';

import React, { useState, useEffect } from 'react';
import { fetchCoursesAction, saveCourseAction, deleteCourseAction, fetchProgramsAction } from '@/app/actions/lmsActions';
import { fetchUsersAction } from '@/app/actions/userActions';
import { CourseItem, ProgramItem } from '@/lib/db';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Power, Eye, X, CheckSquare, ShieldCheck, UserCheck, Key, FileCheck } from 'lucide-react';
import { Toast } from '../ui/Toast';

export function AdminCourses() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [facultyList, setFacultyList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [progFilter, setProgFilter] = useState('ALL');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Form state - 8 Core Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [subject, setSubject] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [assessment, setAssessment] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Admission & Workflow Fields
  const [appSubmission, setAppSubmission] = useState(true);
  const [verificationRequired, setVerificationRequired] = useState(true);
  const [admissionApproval, setAdmissionApproval] = useState(true);
  const [lmsAccountCreation, setLmsAccountCreation] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [crsData, progData, usersData] = await Promise.all([
        fetchCoursesAction(),
        fetchProgramsAction(),
        fetchUsersAction({ role: 'FACULTY', limit: 100 }),
      ]);
      setCourses(crsData);
      setPrograms(progData);
      setFacultyList(usersData.users.map((u) => ({ id: u.id, name: u.name })));
    } catch {
      setToast({ message: 'Failed to load courses.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedCourse(null);
    setName('');
    setCode('');
    setProgrammeId(programs[0]?.id || '');
    setSemester('Semester 1');
    setSubject('');
    setFacultyId(facultyList[0]?.id || '');
    setAssessment('Midterm 30%, Lab 20%, Endterm 50%');
    setStatus('ACTIVE');
    setAppSubmission(true);
    setVerificationRequired(true);
    setAdmissionApproval(true);
    setLmsAccountCreation(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crs: CourseItem) => {
    setSelectedCourse(crs);
    setName(crs.name);
    setCode(crs.code);
    setProgrammeId(crs.programmeId);
    setSemester(crs.semester);
    setSubject(crs.subject);
    setFacultyId(crs.facultyId);
    setAssessment(crs.assessment);
    setStatus(crs.status);
    setAppSubmission(crs.appSubmission ?? true);
    setVerificationRequired(crs.verificationRequired ?? true);
    setAdmissionApproval(crs.admissionApproval ?? true);
    setLmsAccountCreation(crs.lmsAccountCreation ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const progObj = programs.find((p) => p.id === programmeId);
    const facObj = facultyList.find((f) => f.id === facultyId);

    try {
      const res = await saveCourseAction({
        id: selectedCourse?.id,
        name,
        code,
        programmeId,
        programmeName: progObj?.name || 'MCA',
        semester,
        subject,
        facultyId,
        facultyName: facObj?.name || 'Assigned Faculty',
        assessment,
        status,
        appSubmission,
        verificationRequired,
        admissionApproval,
        lmsAccountCreation,
      });

      if (!res.success) {
        setToast({ message: res.error || 'Failed to save course.', type: 'error' });
      } else {
        setToast({ message: `Course '${name}' saved successfully.`, type: 'success' });
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error saving course.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourseAction(id);
      setToast({ message: 'Course deleted.', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to delete course.', type: 'error' });
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchesProg = progFilter === 'ALL' || c.programmeId === progFilter;
    return matchesSearch && matchesProg;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Course & Workflow Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Courses with Programme selection, Semester, Subjects, Assessment, and Admission Workflows.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course name or code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={progFilter}
            onChange={(e) => setProgFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">All Programmes</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="p-3.5">Course Code</th>
              <th className="p-3.5">Course Name</th>
              <th className="p-3.5">Programme & Semester</th>
              <th className="p-3.5">Subject</th>
              <th className="p-3.5">Assessment</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400">Loading courses...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400">No courses found.</td>
              </tr>
            ) : (
              filtered.map((crs) => (
                <tr key={crs.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-emerald-700 bg-emerald-50/50 rounded-lg">{crs.code}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{crs.name}</td>
                  <td className="p-3.5 text-xs text-slate-600">
                    <div className="font-semibold text-slate-800">{crs.programmeName}</div>
                    <div className="text-[11px] text-slate-500">{crs.semester}</div>
                  </td>
                  <td className="p-3.5 text-xs text-slate-600">{crs.subject}</td>
                  <td className="p-3.5 text-xs text-slate-500 max-w-xs truncate">{crs.assessment}</td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => { setSelectedCourse(crs); setIsViewModalOpen(true); }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(crs)}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(crs.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Course"
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

      {/* Create / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                {selectedCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill in the required course metadata and configure admission & workflow triggers.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Select Programme */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">1. Select Programme *</label>
                <select
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — {p.medium}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2 & Course Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MCA301"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Advanced Software Engineering & Architecture"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Field 3: Subjects */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">3. Subjects / Specialization *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Software Architecture, Microservices & Cloud Computing"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Faculty Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Faculty</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Field 4: Assessment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">4. Assessment Criteria</label>
                <input
                  type="text"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="e.g. Midterm 30%, Lab Assignments 20%, Endterm 50%"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Admission & Workflow Settings Header */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-emerald-800">
                  Admission & Workflow Steps
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  {/* Field 5: Application Submission */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={appSubmission}
                      onChange={(e) => setAppSubmission(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>5. Application Submission</span>
                  </label>

                  {/* Field 6: Verification */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={verificationRequired}
                      onChange={(e) => setVerificationRequired(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>6. Verification</span>
                  </label>

                  {/* Field 7: Admission Approval */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={admissionApproval}
                      onChange={(e) => setAdmissionApproval(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>7. Admission Approval</span>
                  </label>

                  {/* Field 8: LMS Account Creation */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={lmsAccountCreation}
                      onChange={(e) => setLmsAccountCreation(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <Key className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>8. LMS Account Creation</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Course Modal */}
      {isViewModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Course Details
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Course Code</span>
                <code className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">{selectedCourse.code}</code>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Course Name</span>
                <span className="font-semibold text-slate-900">{selectedCourse.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Programme</span>
                <span className="font-medium text-slate-800">{selectedCourse.programmeName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Semester</span>
                <span className="font-medium text-slate-800">{selectedCourse.semester}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Subjects</span>
                <span className="font-medium text-slate-800">{selectedCourse.subject}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500 font-medium">Assessment</span>
                <span className="font-medium text-slate-800">{selectedCourse.assessment}</span>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Enabled Workflow Steps</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Application Submission
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Verification
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Admission Approval
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> LMS Account Creation
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setIsViewModalOpen(false)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold shadow-sm text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
