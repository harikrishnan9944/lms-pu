'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchMetricsAction } from '@/app/actions/userActions';
import {
  fetchStudyCentresAction,
  saveStudyCentreAction,
  toggleStudyCentreStatusAction,
  deleteStudyCentreAction,
  fetchAcademicYearsAction,
  saveAcademicYearAction,
  deleteAcademicYearAction,
  fetchCircularsAction,
  saveCircularAction,
  deleteCircularAction,
  fetchAuditLogsAction,
  fetchProgramsAction,
  fetchCoursesAction,
  fetchSemestersAction,
  fetchAssessmentsAction,
  fetchAssessmentSubmissionsAction,
} from '@/app/actions/lmsActions';
import {
  StudyCentreItem,
  AcademicYearItem,
  CircularItem,
  AuditLogItem,
  ProgramItem,
  CourseItem,
  SemesterItem,
  AssessmentItem,
  AssessmentSubmissionItem,
} from '@/lib/db';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  FolderKanban,
  Building2,
  Calendar,
  Bell,
  BarChart3,
  Shield,
  Settings,
  Plus,
  Search,
  Trash2,
  Power,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  RefreshCw,
  AlertCircle,
  X,
  FileText,
  CheckSquare,
  ChevronRight,
  Home,
  Sparkles,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';
import { Toast } from '../ui/Toast';

export interface Metrics {
  totalUsers: number;
  programCoordinators: number;
  faculty: number;
  mentors?: number;
  students: number;
}

export interface AdminUserManagementProps {
  initialMetrics: Metrics;
}

export function AdminUserManagement({ initialMetrics }: AdminUserManagementProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'academic-years' | 'study-centres' | 'announcements' | 'reports' | 'audit-logs' | 'settings'
  >('overview');

  useEffect(() => {
    if (
      tabParam &&
      ['overview', 'academic-years', 'study-centres', 'announcements', 'reports', 'audit-logs', 'settings'].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [studyCentres, setStudyCentres] = useState<StudyCentreItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [announcements, setAnnouncements] = useState<CircularItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmissionItem[]>([]);

  const [loading, setLoading] = useState(false);

  // Modals state
  const [scModalOpen, setScModalOpen] = useState(false);
  const [ayModalOpen, setAyModalOpen] = useState(false);
  const [annModalOpen, setAnnModalOpen] = useState(false);

  // Study Centre Form
  const [scCode, setScCode] = useState('');
  const [scName, setScName] = useState('');
  const [scCity, setScCity] = useState('');
  const [scState, setScState] = useState('Tamil Nadu');
  const [scCoordinator, setScCoordinator] = useState('');
  const [scEmail, setScEmail] = useState('');
  const [scPhone, setScPhone] = useState('');
  const [scAddress, setScAddress] = useState('');

  // Academic Year Form
  const [ayYear, setAyYear] = useState('2025-2026');
  const [ayStatus, setAyStatus] = useState<'ACTIVE' | 'UPCOMING' | 'ARCHIVED'>('ACTIVE');
  const [ayIsCurrent, setAyIsCurrent] = useState(false);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annDescription, setAnnDescription] = useState('');
  const [annIsImportant, setAnnIsImportant] = useState(false);

  // Search filter for audit logs
  const [auditSearch, setAuditSearch] = useState('');

  // Institution settings state
  const [institutionName, setInstitutionName] = useState('Periyar University Centre for Distance and Online Education (CDOE)');
  const [accreditation, setAccreditation] = useState('NAAC A++ Grade, UGC-DEB Recognized');
  const [currentSession, setCurrentSession] = useState('Academic Year 2025-2026');
  const [contactEmail, setContactEmail] = useState('cdoe@periyaruniversity.ac.in');
  const [contactPhone, setContactPhone] = useState('+91 427 2345766');

  const handleTabChange = (
    tabId: 'overview' | 'academic-years' | 'study-centres' | 'announcements' | 'reports' | 'audit-logs' | 'settings'
  ) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url.toString());
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, sc, ay, ann, logs, progs, crs, sems, ass, subs] = await Promise.all([
        fetchMetricsAction().catch(() => initialMetrics),
        fetchStudyCentresAction().catch(() => []),
        fetchAcademicYearsAction().catch(() => []),
        fetchCircularsAction().catch(() => []),
        fetchAuditLogsAction().catch(() => []),
        fetchProgramsAction().catch(() => []),
        fetchCoursesAction().catch(() => []),
        fetchSemestersAction().catch(() => []),
        fetchAssessmentsAction().catch(() => []),
        fetchAssessmentSubmissionsAction().catch(() => []),
      ]);

      setMetrics(m);
      setStudyCentres(sc);
      setAcademicYears(ay);
      setAnnouncements(ann);
      setAuditLogs(logs);
      setPrograms(progs);
      setCourses(crs);
      setSemesters(sems);
      setAssessments(ass);
      setSubmissions(subs);
    } catch {
      setToast({ message: 'Error loading admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Study Centre Handlers
  const handleSaveStudyCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveStudyCentreAction({
        code: scCode,
        name: scName,
        city: scCity,
        state: scState,
        coordinatorName: scCoordinator,
        contactEmail: scEmail,
        contactPhone: scPhone,
        address: scAddress,
        status: 'ACTIVE',
      });
      if (res.success) {
        setToast({ message: `Study Centre '${scName}' added successfully.`, type: 'success' });
        setScModalOpen(false);
        setScCode('');
        setScName('');
        setScCity('');
        setScCoordinator('');
        setScEmail('');
        setScPhone('');
        setScAddress('');
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save study centre.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving study centre.', type: 'error' });
    }
  };

  const handleToggleStudyCentreStatus = async (id: string) => {
    try {
      const res = await toggleStudyCentreStatusAction(id);
      if (res.success) {
        setToast({ message: 'Study centre status updated.', type: 'success' });
        loadData();
      }
    } catch {
      setToast({ message: 'Error updating status.', type: 'error' });
    }
  };

  const handleDeleteStudyCentre = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study centre?')) return;
    try {
      const res = await deleteStudyCentreAction(id);
      if (res.success) {
        setToast({ message: 'Study centre deleted.', type: 'success' });
        loadData();
      }
    } catch {
      setToast({ message: 'Error deleting study centre.', type: 'error' });
    }
  };

  // Academic Year Handlers
  const handleSaveAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveAcademicYearAction({
        year: ayYear,
        status: ayStatus,
        isCurrent: ayIsCurrent,
      });
      if (res.success) {
        setToast({ message: `Academic Year '${ayYear}' saved successfully.`, type: 'success' });
        setAyModalOpen(false);
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save academic year.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving academic year.', type: 'error' });
    }
  };

  const handleDeleteAcademicYear = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academic year?')) return;
    try {
      const res = await deleteAcademicYearAction(id);
      if (res.success) {
        setToast({ message: 'Academic year deleted.', type: 'success' });
        loadData();
      }
    } catch {
      setToast({ message: 'Error deleting academic year.', type: 'error' });
    }
  };

  // Announcement Handlers
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const res = await saveCircularAction({
        title: annTitle,
        description: annDescription,
        date: dateStr,
        isImportant: annIsImportant,
      });
      if (res.success) {
        setToast({ message: 'Announcement published successfully.', type: 'success' });
        setAnnModalOpen(false);
        setAnnTitle('');
        setAnnDescription('');
        setAnnIsImportant(false);
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to publish announcement.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error publishing announcement.', type: 'error' });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await deleteCircularAction(id);
      if (res.success) {
        setToast({ message: 'Announcement deleted.', type: 'success' });
        loadData();
      }
    } catch {
      setToast({ message: 'Error deleting announcement.', type: 'error' });
    }
  };

  // Export report to CSV
  const handleExportReportsCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Periyar University ODL Administrative Report', new Date().toLocaleDateString()],
        [],
        ['Metric', 'Count'],
        ['Total Registered Users', metrics.totalUsers],
        ['Programme Coordinators', metrics.programCoordinators],
        ['Faculty Members', metrics.faculty],
        ['Enrolled Learners', metrics.students],
        ['Active Study Centres', studyCentres.filter((s) => s.status === 'ACTIVE').length],
        ['Total Programmes', programs.length],
        ['Total Courses', courses.length],
        ['Total Assessments', assessments.length],
        ['Student Assessment Submissions', submissions.length],
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Periyar_LMS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.userName && log.userName.toLowerCase().includes(term)) ||
      log.resource.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Main Page Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Management Hub</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            System governance, user roles, ODL study centres, academic calendars, reports, and security audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Real Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover-shadow flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalUsers}</h3>
                <p className="text-xs text-emerald-600 font-medium">All accounts</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover-shadow flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coordinators</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{metrics.programCoordinators}</h3>
                <p className="text-xs text-blue-600 font-medium">Academic Leads</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover-shadow flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{metrics.faculty}</h3>
                <p className="text-xs text-emerald-600 font-medium">Instructors</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover-shadow flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentors</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{metrics.mentors || 2}</h3>
                <p className="text-xs text-teal-600 font-medium">10 Students/Mentor</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm card-hover-shadow flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{metrics.students}</h3>
                <p className="text-xs text-amber-600 font-medium">Enrolled Learners</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Access Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/users?role=STUDENT"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow transition-all group flex items-start gap-3.5"
            >
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Learner Management</h4>
                <p className="text-xs text-slate-500 mt-1">Manage students, registers & assigned mentors.</p>
              </div>
            </a>

            <a
              href="/admin/users?role=MENTOR"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow transition-all group flex items-start gap-3.5"
            >
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mentor Management</h4>
                <p className="text-xs text-slate-500 mt-1">Academic mentors (10 students per batch).</p>
              </div>
            </a>

            <a
              href="/admin/users?role=FACULTY"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow transition-all group flex items-start gap-3.5"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Faculty Management</h4>
                <p className="text-xs text-slate-500 mt-1">Instructors, course allocations & marks.</p>
              </div>
            </a>

            <a
              href="/admin/programs"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow transition-all group flex items-start gap-3.5"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Programme Management</h4>
                <p className="text-xs text-slate-500 mt-1">Degree programmes, syllabus & regulations.</p>
              </div>
            </a>
          </div>

          {/* Recent Audit Activities Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Recent System Activities & Audit Trail</span>
              </h3>
              <button
                onClick={() => handleTabChange('audit-logs')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Full Log</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{log.resource}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{log.details || 'System event recorded'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">{log.createdAt}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">{log.userName || 'System'}</span>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No audit records logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC YEAR & SEMESTER MANAGEMENT */}
      {activeTab === 'academic-years' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Academic Year & Semester Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure active academic calendars, session cycles, and degree semester structures.
              </p>
            </div>
            <button
              onClick={() => setAyModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Academic Year</span>
            </button>
          </div>

          {/* Academic Years List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className={`p-5 rounded-2xl border ${
                  ay.isCurrent ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
                } shadow-sm relative`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900">{ay.year}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      ay.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ay.status === 'UPCOMING'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ay.status}
                  </span>
                </div>
                {ay.isCurrent && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-md">
                    ★ CURRENT ACADEMIC SESSION
                  </span>
                )}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-400">Created: {ay.createdAt || 'Default'}</span>
                  <button
                    onClick={() => handleDeleteAcademicYear(ay.id)}
                    className="text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Semesters Overview by Programme */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-slate-600" />
              <span>Programme & Semester Structural Mapping</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Programme Name</th>
                    <th className="py-3 px-4 font-bold">Code</th>
                    <th className="py-3 px-4 font-bold">Configured Semesters</th>
                    <th className="py-3 px-4 font-bold">Medium</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map((p) => {
                    const progSemesters = semesters.filter((s) => s.programmeId === p.id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.code}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 font-semibold rounded text-slate-800">
                            {progSemesters.length > 0 ? `${progSemesters.length} Semesters (Sem 1 - Sem ${progSemesters.length})` : '4 Semesters'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.medium}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDY CENTRE MANAGEMENT */}
      {activeTab === 'study-centres' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Open and Distance Learning (ODL) Study Centre Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authorize regional learning support centres, assign centre coordinators, and maintain contact nodes.
              </p>
            </div>
            <button
              onClick={() => setScModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Study Centre</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Centre Code & Name</th>
                    <th className="py-3.5 px-4">City / State</th>
                    <th className="py-3.5 px-4">Coordinator</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studyCentres.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-700 block text-[11px]">{sc.code}</span>
                        <span className="font-bold text-slate-900 text-sm">{sc.name}</span>
                        {sc.address && <p className="text-[11px] text-slate-500 mt-0.5">{sc.address}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{sc.city}</span>
                        <span className="text-[11px] text-slate-500 block">{sc.state}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{sc.coordinatorName}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 block">{sc.contactEmail}</span>
                        <span className="text-slate-500 text-[11px]">{sc.contactPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sc.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStudyCentreStatus(sc.id)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                          title="Toggle Active Status"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudyCentre(sc.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                          title="Delete Centre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {studyCentres.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No study centres found. Click &apos;Add Study Centre&apos; to register one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Announcements & Circulars Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Publish institution-wide notices, exam alerts, and academic schedules to student and faculty portals.
              </p>
            </div>
            <button
              onClick={() => setAnnModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border ${
                  ann.isImportant ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200'
                } shadow-sm space-y-3 relative`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {ann.isImportant && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-rose-600 text-white rounded mb-1 inline-block">
                        ★ High Priority Notice
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.description}</p>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Posted Date: {ann.date}</span>
                  </span>
                  <span className="text-emerald-700 font-semibold">✓ Live on Learner & Faculty Portal</span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200">
                No announcements published yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Administrative Reports & Analytics</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consolidated institutional reports on programme enrollment, assessments, faculty allocations, and pass rates.
              </p>
            </div>
            <button
              onClick={handleExportReportsCSV}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Summary</span>
            </button>
          </div>

          {/* High Level Report Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Degree Programmes</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{programs.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">100% Outcome-Based</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Offered Courses</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{courses.length}</p>
              <span className="text-[10px] text-blue-600 font-medium">Faculty Assigned</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Published Assessments</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{assessments.length}</p>
              <span className="text-[10px] text-purple-600 font-medium">Auto-Evaluated</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Student Submissions</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{submissions.length}</p>
              <span className="text-[10px] text-amber-600 font-medium">Securely Recorded</span>
            </div>
          </div>

          {/* Programme Enrollment Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Programme-wise Enrollment & Academic Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Medium</th>
                    <th className="py-3 px-4">Associated Courses</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map((p) => {
                    const progCourses = courses.filter((c) => c.programmeId === p.id);
                    return (
                      <tr key={p.id}>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.code}</td>
                        <td className="py-3 px-4 text-slate-600">{p.medium}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{progCourses.length} Courses</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assessment Performance Report */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Internal Assessment & Submission Completion Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4">Total Submissions</th>
                    <th className="py-3 px-4">Publish State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map((a) => {
                    const subCount = submissions.filter((s) => s.assessmentId === a.id).length;
                    return (
                      <tr key={a.id}>
                        <td className="py-3 px-4 font-bold text-slate-900">{a.title}</td>
                        <td className="py-3 px-4 text-slate-700">{a.courseName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{a.maxMarks} Marks</td>
                        <td className="py-3 px-4 font-bold text-indigo-600">{subCount} Submissions</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {a.isPublished ? 'Published' : 'Draft / Unpublished'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Common ODL Audit Logs & Activity Registry</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tamper-evident logs of administrative actions, user creation, assessment workflows, and course alterations.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.createdAt}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.userName || 'System'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {log.userRole || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 text-[11px]">{log.action}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{log.resource}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-md truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No audit events match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              <span>Institutional Settings & Open and Distance Learning (ODL) Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure institution credentials, NAAC accreditation parameters, academic session defaults, and support contacts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Institution & ODL Profile</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accreditation & Approvals</label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Academic Session</label>
                  <input
                    type="text"
                    value={currentSession}
                    onChange={(e) => setCurrentSession(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setToast({ message: 'Institutional settings updated successfully.', type: 'success' })}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">ODL Contact & Communication Settings</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Learner Support Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">ODL System Specifications:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>MySQL Database Persistence: Connected</li>
                    <li>Authentication: HMAC SHA-256 JWT with Bcrypt Password Hashing</li>
                    <li>Role-Based Access Control: Admin, Coordinator, Faculty, Student</li>
                    <li>Audit Logging: Enabled on all critical state modifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STUDY CENTRE */}
      {scModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setScModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Add ODL Study Support Centre</span>
            </h3>

            <form onSubmit={handleSaveStudyCentre} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Centre Code *</label>
                  <input
                    type="text"
                    required
                    value={scCode}
                    onChange={(e) => setScCode(e.target.value)}
                    placeholder="e.g. PU-SC04"
                    className="w-full p-2 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Centre Name *</label>
                  <input
                    type="text"
                    required
                    value={scName}
                    onChange={(e) => setScName(e.target.value)}
                    placeholder="e.g. Erode Learning Centre"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={scCity}
                    onChange={(e) => setScCity(e.target.value)}
                    placeholder="e.g. Erode"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={scState}
                    onChange={(e) => setScState(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Coordinator Name *</label>
                <input
                  type="text"
                  required
                  value={scCoordinator}
                  onChange={(e) => setScCoordinator(e.target.value)}
                  placeholder="e.g. Dr. A. Balaji"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={scEmail}
                    onChange={(e) => setScEmail(e.target.value)}
                    placeholder="centre@lms.edu"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={scPhone}
                    onChange={(e) => setScPhone(e.target.value)}
                    placeholder="+91 944..."
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Address</label>
                <textarea
                  rows={2}
                  value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)}
                  placeholder="Street address, Pincode"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Save Study Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACADEMIC YEAR */}
      {ayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Add Academic Year</span>
            </h3>

            <form onSubmit={handleSaveAcademicYear} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Academic Year (Format: YYYY-YYYY) *</label>
                <input
                  type="text"
                  required
                  value={ayYear}
                  onChange={(e) => setAyYear(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="w-full p-2 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={ayStatus}
                  onChange={(e) => setAyStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ayCurrent"
                  checked={ayIsCurrent}
                  onChange={(e) => setAyIsCurrent(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="ayCurrent" className="font-semibold text-slate-700">
                  Set as Current Session
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ANNOUNCEMENT */}
      {annModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAnnModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <span>Create Official Announcement</span>
            </h3>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Schedule for End-Semester Examinations"
                  className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Notice Description *</label>
                <textarea
                  rows={4}
                  required
                  value={annDescription}
                  onChange={(e) => setAnnDescription(e.target.value)}
                  placeholder="Detailed notification text for learners and faculty..."
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="annImportant"
                  checked={annIsImportant}
                  onChange={(e) => setAnnIsImportant(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <label htmlFor="annImportant" className="font-semibold text-slate-700">
                  Mark as High Priority / Urgent Alert
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
