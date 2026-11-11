'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  fetchMentorMenteesAction,
  fetchMenteeDetailedActivityAction,
  fetchMentorRecentActivitiesAction,
  saveMentoringMeetingAction,
  autoAssignMentorsAction,
} from '@/app/actions/userActions';
import {
  Users,
  GraduationCap,
  CheckSquare,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Search,
  Sparkles,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Activity,
  Layers,
  Send,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

export interface MentorDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
    qualification?: string;
    programme?: string;
    department?: string;
    mobile?: string;
  };
}

export function MentorDashboard({ user }: MentorDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'activities' | 'performance' | 'attendance' | 'sessions' | 'messages'
  >('overview');

  useEffect(() => {
    if (
      tabParam &&
      ['overview', 'students', 'activities', 'performance', 'attendance', 'sessions', 'messages'].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Data States
  const [mentees, setMentees] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-assign loading
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'assessment' | 'assignment' | 'attendance' | 'resource'>('all');
  const [activityStudentFilter, setActivityStudentFilter] = useState<string>('all');

  // Selected Mentee Modal Details
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailedMentee, setDetailedMentee] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState<'profile' | 'assessments' | 'assignments' | 'attendance' | 'resources' | 'sessions'>('profile');

  // Mentoring Form in Modal
  const [meetingInfoInput, setMeetingInfoInput] = useState('');
  const [meetingNotesInput, setMeetingNotesInput] = useState('');
  const [historyEntryInput, setHistoryEntryInput] = useState('');
  const [isSavingMeeting, setIsSavingMeeting] = useState(false);

  // Direct Message State
  const [messageRecipient, setMessageRecipient] = useState<any | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [menteesData, activitiesData] = await Promise.all([
        fetchMentorMenteesAction(user.id),
        fetchMentorRecentActivitiesAction(user.id),
      ]);
      setMentees(menteesData || []);
      setRecentActivities(activitiesData || []);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load mentor data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Mentee Detail Inspection
  const handleOpenMenteeDetail = async (studentId: string, initialTab: 'profile' | 'assessments' | 'assignments' | 'attendance' | 'resources' | 'sessions' = 'profile') => {
    setSelectedStudentId(studentId);
    setDetailModalTab(initialTab);
    setDetailLoading(true);
    try {
      const details = await fetchMenteeDetailedActivityAction(studentId);
      setDetailedMentee(details);
      if (details?.mentoring) {
        setMeetingInfoInput(details.mentoring.meetingInfo || '');
        setMeetingNotesInput(details.mentoring.notes || '');
      } else {
        setMeetingInfoInput(`Academic Mentoring Review with ${user.name}`);
        setMeetingNotesInput('');
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load mentee activity details.', type: 'error' });
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle Save Meeting Notes
  const handleSaveMentoringSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsSavingMeeting(true);
    try {
      const res = await saveMentoringMeetingAction({
        studentId: selectedStudentId,
        meetingInfo: meetingInfoInput,
        notes: meetingNotesInput,
        historyEntry: historyEntryInput.trim() ? historyEntryInput.trim() : undefined,
      });
      if (res.success) {
        setToast({ message: 'Mentoring guidance notes updated successfully!', type: 'success' });
        setHistoryEntryInput('');
        // Refresh details
        const updated = await fetchMenteeDetailedActivityAction(selectedStudentId);
        setDetailedMentee(updated);
        loadData();
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update mentoring notes.', type: 'error' });
    } finally {
      setIsSavingMeeting(false);
    }
  };

  // Handle Auto-Assign Trigger
  const handleAutoAssign = async () => {
    setIsSyncing(true);
    try {
      const res = await autoAssignMentorsAction();
      if (res.success) {
        setToast({ message: res.message || '10-student mentor batch assignment verified & synchronized!', type: 'success' });
        loadData();
      } else {
        setToast({ message: res.message || 'Could not auto-assign.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error executing auto-assign.', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered Mentees
  const filteredMentees = mentees.filter((m) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.studentId?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q)
    );
  });

  // Filtered Activities
  const filteredActivities = recentActivities.filter((act) => {
    if (activityFilter !== 'all' && act.type !== activityFilter) return false;
    if (activityStudentFilter !== 'all' && act.studentName !== activityStudentFilter) return false;
    return true;
  });

  // Calculate Overall Metrics
  const totalMentees = mentees.length;
  const avgAttendance = totalMentees > 0
    ? Math.round(mentees.reduce((acc, m) => acc + (m.attendanceRate || 0), 0) / totalMentees)
    : 100;
  const avgScore = totalMentees > 0
    ? Math.round(mentees.reduce((acc, m) => acc + (m.averageScore || 0), 0) / totalMentees)
    : 85;
  const totalAssignments = mentees.reduce((acc, m) => acc + (m.assignmentsSubmitted || 0), 0);
  const totalAssessments = mentees.reduce((acc, m) => acc + (m.assessmentsCompleted || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* TOP HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-teal-800/40 shadow-xl relative overflow-hidden">
        {/* Ambient Light Orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Periyar University ODL • Academic Mentorship Module</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Assigned Mentee Batch Manager. Continuous monitoring of student activities, performance, assessments, and attendance (10 students per sequential batch).
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-teal-300">
                <Building className="w-4 h-4 text-teal-400" />
                Department: {user.department || 'Computer Applications (MCA)'}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                {user.email}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-[11px]">
                Active Batch: {totalMentees} / 10 Mentees
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleAutoAssign}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-700/30 transition-all border border-teal-400/30"
              title="Ensure all 10 students are systematically organized and paired with mentors"
            >
              <Sparkles className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Auto-Assign / Verify Batch (10/Mentor)'}</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 10-SLOT VISUAL BATCH PROGRESS BAR */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Sequential 10-Student Mentee Allocation:</span>
            </span>
            <span className="text-teal-300 font-bold">
              {totalMentees} of 10 Slots Allocated ({Math.min(100, Math.round((totalMentees / 10) * 100))}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => {
              const studentInSlot = mentees[idx];
              const isFilled = !!studentInSlot;
              return (
                <div
                  key={idx}
                  onClick={() => studentInSlot && handleOpenMenteeDetail(studentInSlot.id)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-teal-950/60 border-teal-500/50 hover:border-teal-300 hover:bg-teal-900/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-60'
                  }`}
                  title={isFilled ? `Slot #${idx + 1}: ${studentInSlot.name}` : `Slot #${idx + 1}: Available for next student`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-0.5">
                    Slot #{idx + 1}
                  </div>
                  {isFilled ? (
                    <div>
                      <p className="text-xs font-bold text-white truncate">{studentInSlot.name.split(' ')[0]}</p>
                      <span className="text-[10px] font-mono text-teal-300/80">{studentInSlot.studentId || `PU#${idx + 1}`}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Unfilled</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>My Mentees (10 Students)</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
            {totalMentees}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'activities'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Activity Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'performance'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Academic Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Monitoring</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Mentoring Sessions & Notes</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Mentees</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalMentees} / 10</h3>
                <p className="text-xs text-teal-600 mt-1 font-medium">Batch #1 Allocation</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Avg Attendance</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{avgAttendance}%</h3>
                <p className="text-xs text-emerald-600 mt-1 font-medium">Class Participation</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Assessment Mark</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{avgScore}%</h3>
                <p className="text-xs text-sky-600 mt-1 font-medium">{totalAssessments} Tests Completed</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments Turn-In</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalAssignments}</h3>
                <p className="text-xs text-purple-600 mt-1 font-medium">Submissions Received</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Roster Grid: 10 Students in Order */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span>My 10 Assigned Mentees (Sequential Batch 1)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any mentee to open their complete activity profile, test results, attendance and history.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 self-start"
              >
                <span>View Full List & Filters</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {mentees.map((student, idx) => (
                <div
                  key={student.id}
                  onClick={() => handleOpenMenteeDetail(student.id)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                        Slot #{student.batchIndex || idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{student.studentId}</span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700">
                          {student.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">{student.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Attendance:</span>
                      <span className="font-bold text-emerald-600">{student.attendanceRate}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Avg Score:</span>
                      <span className="font-bold text-sky-600">{student.averageScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Live Stream Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>Recent Mentee Activity Live Feed</span>
                </h3>
                <p className="text-xs text-slate-500">Real-time actions taken across all 10 students</p>
              </div>
              <button
                onClick={() => setActiveTab('activities')}
                className="text-xs font-bold text-teal-600 hover:text-teal-800"
              >
                View Full Tracker
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentActivities.slice(0, 6).map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                      {act.type === 'assessment' ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : act.type === 'assignment' ? (
                        <FileText className="w-4 h-4 text-purple-600" />
                      ) : act.type === 'attendance' ? (
                        <Calendar className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{act.studentName}</span> • <span className="font-semibold text-slate-700">{act.title}</span>
                      <p className="text-[11px] text-slate-500">{act.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">{act.timestamp}</span>
                    {act.statusBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {act.statusBadge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY MENTEES (10 STUDENTS) */}
      {/* ============================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search bar & batch info banner */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Filter by name, register ID, email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>
            <div className="text-xs text-slate-600 font-semibold self-end sm:self-auto flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                10 Mentees Policy: 1 Mentor per 10 Students
              </span>
            </div>
          </div>

          {/* Mentee Detailed Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredMentees.map((mentee) => (
              <div
                key={mentee.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-teal-400 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-teal-600/20">
                      {mentee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{mentee.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                          Mentee #{mentee.batchIndex} of 10
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Reg: {mentee.studentId}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Attendance</span>
                    <span className="text-sm font-extrabold text-emerald-600">{mentee.attendanceRate}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Marks</span>
                    <span className="text-sm font-extrabold text-sky-600">{mentee.averageScore}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Assignments</span>
                    <span className="text-sm font-extrabold text-purple-600">{mentee.assignmentsSubmitted} Sub</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Resources</span>
                    <span className="text-sm font-extrabold text-amber-600">{mentee.resourcesViewed} Read</span>
                  </div>
                </div>

                {/* Contact and Program info */}
                <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Programme & Sem:</span>
                    <span className="font-semibold text-slate-800">{mentee.programme} • {mentee.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-mono text-slate-700">{mentee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile:</span>
                    <span>{mentee.mobile}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span>Academic Standing:</span>
                    <span className="font-semibold text-teal-700">{mentee.academicInfo}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenMenteeDetail(mentee.id, 'profile')}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Complete Activities & Details</span>
                  </button>

                  <button
                    onClick={() => handleOpenMenteeDetail(mentee.id, 'sessions')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Mentoring notes & sessions"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Session Notes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ACTIVITY TRACKER */}
      {/* ============================================================== */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>Mentee Activity Tracker (All 10 Students)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Detailed timeline of tests taken, assignments submitted, attendance, and study materials read.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Activity Types</option>
                <option value="assessment">Assessments</option>
                <option value="assignment">Assignments</option>
                <option value="attendance">Class Attendance</option>
                <option value="resource">Study Materials</option>
              </select>

              <select
                value={activityStudentFilter}
                onChange={(e) => setActivityStudentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All 10 Students</option>
                {mentees.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-xs font-medium">
                No activity records found matching filters.
              </p>
            ) : (
              filteredActivities.map((act) => (
                <div key={act.id} className="py-4 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                      {act.type === 'assessment' ? (
                        <CheckSquare className="w-5 h-5 text-sky-600" />
                      ) : act.type === 'assignment' ? (
                        <FileText className="w-5 h-5 text-purple-600" />
                      ) : act.type === 'attendance' ? (
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{act.studentName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          {act.type}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 mt-0.5">{act.title}</p>
                      <p className="text-[11px] text-slate-500">{act.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 font-mono block">{act.timestamp}</span>
                    {act.statusBadge && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
                        {act.statusBadge}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ACADEMIC PERFORMANCE */}
      {/* ============================================================== */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              <span>Mentee Academic Performance & Marks Overview</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparative assessment and assignment achievement across the 10 assigned students.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Tests Taken</th>
                  <th className="py-3 px-4">Assessment Avg</th>
                  <th className="py-3 px-4">Assignments Done</th>
                  <th className="py-3 px-4">Status & Health</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mentees.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-teal-700">#{m.batchIndex || idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{m.studentId}</td>
                    <td className="py-3.5 px-4">{m.assessmentsCompleted} Completed</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sky-700">{m.averageScore}%</span>
                    </td>
                    <td className="py-3.5 px-4">{m.assignmentsSubmitted} Submissions</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        m.averageScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.averageScore >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.averageScore >= 80 ? 'Exemplary' : m.averageScore >= 60 ? 'Satisfactory' : 'Needs Guidance'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenMenteeDetail(m.id, 'assessments')}
                        className="text-xs font-bold text-teal-600 hover:text-teal-800"
                      >
                        Inspect Marks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ATTENDANCE MONITORING */}
      {/* ============================================================== */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Mentee Attendance & Participation Tracker</span>
            </h3>
            <p className="text-xs text-slate-500">
              UGC/DEB mandatory minimum 75% attendance threshold monitoring.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Attended Classes</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mentees.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-teal-700">#{m.batchIndex || idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{m.studentId}</td>
                    <td className="py-3.5 px-4">{m.attendedClasses || 0} / {m.totalClasses || 0} Sessions</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800">{m.attendanceRate}%</span>
                        <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${m.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        m.attendanceRate >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {m.attendanceRate >= 75 ? 'Eligible for Exam' : 'Shortage Warning'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenMenteeDetail(m.id, 'attendance')}
                        className="text-xs font-bold text-teal-600 hover:text-teal-800"
                      >
                        View Dates
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: MENTORING SESSIONS & NOTES */}
      {/* ============================================================== */}
      {activeTab === 'sessions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Select Mentee for Guidance</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select one of your 10 students to record counseling notes, evaluation feedback, or schedule sessions.
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {mentees.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpenMenteeDetail(m.id, 'sessions')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Reg: {m.studentId}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Academic Mentorship Policy & Instructions</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                <h4 className="font-bold text-teal-900 mb-1">Batch Allocation Policy (10 Students / Mentor):</h4>
                <p>
                  Each academic mentor is assigned a batch of exactly 10 students in sequential order. Mentors conduct monthly reviews, evaluate continuous internal assessments, track attendance thresholds (min 75%), and record counseling history.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Responsibilities:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Review student assignment and quiz marks regularly.</li>
                  <li>Schedule periodic 1-on-1 counseling meetings or Google Meet review sessions.</li>
                  <li>Document academic action plans for learners with attendance shortage or low marks.</li>
                  <li>Provide feedback and assistance to coordinate with faculty members.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COMPREHENSIVE MENTEE DETAIL MODAL / DRAWER */}
      {/* ============================================================== */}
      {selectedStudentId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shrink-0 relative">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {detailLoading || !detailedMentee ? (
                <div className="py-4 text-center text-teal-300 font-medium text-xs">Loading complete student activities...</div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                      {detailedMentee.student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white">{detailedMentee.student.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                          Assigned Mentee
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        Register No: {detailedMentee.student.studentId || 'PU2026MCA'} • {detailedMentee.student.programme || 'MCA'} ({detailedMentee.student.semester || 'Semester 3'})
                      </p>
                      <p className="text-[11px] text-teal-200 mt-1">
                        Assigned Mentor: {detailedMentee.student.mentorName || user.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sub-Tabs */}
            <div className="bg-slate-100/80 px-6 py-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto shrink-0">
              <button
                onClick={() => setDetailModalTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'profile' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile & Summary
              </button>
              <button
                onClick={() => setDetailModalTab('assessments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'assessments' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assessments & Quizzes ({detailedMentee?.assessments?.length || 0})
              </button>
              <button
                onClick={() => setDetailModalTab('assignments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'assignments' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assignments ({detailedMentee?.assignments?.length || 0})
              </button>
              <button
                onClick={() => setDetailModalTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'attendance' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendance Logs ({detailedMentee?.attendance?.length || 0})
              </button>
              <button
                onClick={() => setDetailModalTab('resources')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'resources' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Study Materials Read ({detailedMentee?.resourceViews?.length || 0})
              </button>
              <button
                onClick={() => setDetailModalTab('sessions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  detailModalTab === 'sessions' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mentoring Notes & Meetings
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {detailLoading || !detailedMentee ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading activity data...</div>
              ) : (
                <>
                  {/* SUB-TAB 1: PROFILE & OVERALL SUMMARY */}
                  {detailModalTab === 'profile' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                          <span className="text-[10px] font-bold uppercase text-emerald-700">Attendance Rate</span>
                          <h4 className="text-2xl font-extrabold text-emerald-800 mt-1">
                            {detailedMentee.attendanceStats?.percentage || 100}%
                          </h4>
                          <span className="text-[10px] text-emerald-600">
                            {detailedMentee.attendanceStats?.present} of {detailedMentee.attendanceStats?.total} Present
                          </span>
                        </div>

                        <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 text-center">
                          <span className="text-[10px] font-bold uppercase text-sky-700">Tests Completed</span>
                          <h4 className="text-2xl font-extrabold text-sky-800 mt-1">
                            {detailedMentee.assessments?.length || 0}
                          </h4>
                          <span className="text-[10px] text-sky-600">Quizzes & Evaluations</span>
                        </div>

                        <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-center">
                          <span className="text-[10px] font-bold uppercase text-purple-700">Assignments</span>
                          <h4 className="text-2xl font-extrabold text-purple-800 mt-1">
                            {detailedMentee.assignments?.length || 0}
                          </h4>
                          <span className="text-[10px] text-purple-600">Tasks Submitted</span>
                        </div>

                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-center">
                          <span className="text-[10px] font-bold uppercase text-amber-700">Resources Read</span>
                          <h4 className="text-2xl font-extrabold text-amber-800 mt-1">
                            {detailedMentee.resourceViews?.length || 0}
                          </h4>
                          <span className="text-[10px] text-amber-600">Lecture Materials</span>
                        </div>
                      </div>

                      {/* Personal & Academic Profile */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Learner Demographic & Registration Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block">Full Name:</span>
                            <span className="font-semibold text-slate-900">{detailedMentee.student.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Email Address:</span>
                            <span className="font-mono text-slate-900">{detailedMentee.student.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Mobile:</span>
                            <span className="text-slate-900">{detailedMentee.student.mobile || '+91 9876543210'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Residential Address:</span>
                            <span className="text-slate-900">{detailedMentee.student.address || 'Tamil Nadu, India'}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-500 block">Academic Background:</span>
                            <span className="font-semibold text-teal-800">{detailedMentee.student.academicInfo || 'Regular Enrolled Student'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mentoring Info Snapshot */}
                      <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 space-y-2 text-xs">
                        <h4 className="font-bold text-teal-900 text-xs uppercase tracking-wider">Active Mentorship Guidance Record</h4>
                        <p className="text-slate-700">
                          {detailedMentee.mentoring?.meetingInfo || 'Assigned to Academic Mentor for continuous progress monitoring.'}
                        </p>
                        {detailedMentee.mentoring?.notes && (
                          <p className="text-slate-600 italic">
                            Mentor Note: {detailedMentee.mentoring.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: ASSESSMENTS */}
                  {detailModalTab === 'assessments' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">Assessments & Quiz Submissions</h4>
                      {detailedMentee.assessments?.length === 0 ? (
                        <p className="text-slate-400 text-xs py-8 text-center">No assessments completed yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {detailedMentee.assessments.map((a: any) => (
                            <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                              <div>
                                <h5 className="font-bold text-slate-900 text-sm">{a.title}</h5>
                                <p className="text-slate-500 mt-0.5">Course: {a.courseName}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  Submitted on: {new Date(a.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-extrabold text-sky-700">
                                  {a.score} / {a.maxMarks}
                                </span>
                                <span className="block text-[11px] font-bold text-emerald-600">
                                  {a.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: ASSIGNMENTS */}
                  {detailModalTab === 'assignments' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">Assignment Tasks & Submissions</h4>
                      {detailedMentee.assignments?.length === 0 ? (
                        <p className="text-slate-400 text-xs py-8 text-center">No assignments submitted yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {detailedMentee.assignments.map((asg: any) => (
                            <div key={asg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-slate-900 text-sm">{asg.title}</h5>
                                  <p className="text-slate-500">Course: {asg.courseName}</p>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  {asg.status}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                                <span>Submission Date: {asg.submissionDate}</span>
                                {asg.marks !== undefined && asg.marks !== null && (
                                  <span className="font-bold text-slate-900">Marks: {asg.marks}</span>
                                )}
                              </div>
                              {asg.feedback && (
                                <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                                  Evaluator Feedback: {asg.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 4: ATTENDANCE */}
                  {detailModalTab === 'attendance' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm">Class Attendance Log</h4>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Overall: {detailedMentee.attendanceStats?.percentage || 100}%
                        </span>
                      </div>

                      {detailedMentee.attendance?.length === 0 ? (
                        <p className="text-slate-400 text-xs py-8 text-center">No attendance records yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {detailedMentee.attendance.map((att: any) => (
                            <div key={att.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">{att.courseName}</span>
                                <p className="text-[11px] text-slate-500">
                                  Date: {att.date} • Recorded by: {att.recordedBy || 'Faculty'}
                                </p>
                                {att.remarks && <p className="text-[11px] text-slate-600 italic">{att.remarks}</p>}
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                att.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {att.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 5: RESOURCES */}
                  {detailModalTab === 'resources' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">Accessed Learning Modules & Materials</h4>
                      {detailedMentee.resourceViews?.length === 0 ? (
                        <p className="text-slate-400 text-xs py-8 text-center">No study materials read yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {detailedMentee.resourceViews.map((rv: any) => (
                            <div key={rv.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs bg-slate-50">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-4 h-4 text-amber-600" />
                                <div>
                                  <span className="font-bold text-slate-900">{rv.title}</span>
                                  <p className="text-[11px] text-slate-500">{rv.courseName} • {rv.subject}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Viewed {new Date(rv.viewedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 6: SESSIONS & NOTES FORM */}
                  {detailModalTab === 'sessions' && (
                    <div className="space-y-6">
                      <form onSubmit={handleSaveMentoringSession} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-teal-600" />
                          <span>Record Mentoring Guidance & Schedule Meeting</span>
                        </h4>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Meeting Schedule & Platform Link (Google Meet / Room)
                          </label>
                          <input
                            type="text"
                            value={meetingInfoInput}
                            onChange={(e) => setMeetingInfoInput(e.target.value)}
                            placeholder="e.g. Monthly Review on Friday 4 PM via Google Meet: meet.google.com/xyz-abc"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Mentor Guidance Notes & Progress Evaluation
                          </label>
                          <textarea
                            rows={3}
                            value={meetingNotesInput}
                            onChange={(e) => setMeetingNotesInput(e.target.value)}
                            placeholder="Record student strengths, areas for improvement, exam preparations..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Add New Session Log Entry (Appended to History)
                          </label>
                          <input
                            type="text"
                            value={historyEntryInput}
                            onChange={(e) => setHistoryEntryInput(e.target.value)}
                            placeholder="e.g. Conducted 1-on-1 counseling regarding Semester 3 project topics."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingMeeting}
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20"
                        >
                          {isSavingMeeting ? 'Saving Guidance Notes...' : 'Save Mentoring Updates'}
                        </button>
                      </form>

                      {/* Mentoring Session History */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Historical Mentoring Sessions & Milestones
                        </h4>
                        {detailedMentee.mentoring?.history?.length === 0 ? (
                          <p className="text-slate-400 text-xs">No prior session records logged.</p>
                        ) : (
                          <div className="space-y-2">
                            {detailedMentee.mentoring?.history?.map((h: string, idx: number) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                                <span className="text-slate-800">{h}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
