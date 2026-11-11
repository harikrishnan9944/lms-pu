'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  fetchProgramsAction,
  fetchPapersAction,
  fetchCoursesAction,
  fetchLearningResourcesAction,
  recordResourceViewAction,
  fetchAssessmentsAction,
  fetchAssignmentsAction,
  submitAssignmentAction,
  fetchInternalMarksAction,
  fetchSchedulesAction,
  fetchFeeActivitiesAction,
  fetchDiscussionsAction,
  createDiscussionAction,
  replyToDiscussionAction,
  fetchCircularsAction,
  fetchMessagesAction,
  sendMessageAction,
  fetchMentoringInfoAction,
  fetchNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  fetchCertificatesAction,
  fetchSupportTicketsAction,
  createSupportTicketAction,
  fetchContactDirectoryAction,
  updateSelfProfileAction,
  fetchPaperUnitsAction,
  submitAssessmentAction,
  fetchStudentSubmissionsAction,
  fetchStudentAttendanceSummaryAction,
} from '@/app/actions/lmsActions';
import {
  ProgramItem,
  PaperItem,
  CourseItem,
  LearningResourceItem,
  AssessmentItem,
  AssessmentSubmissionItem,
  QuizQuestion,
  SubmissionAnswersPayload,
  AssignmentItem,
  ScheduleItem,
  FeeActivityItem,
  ForumItem,
  CircularItem,
  MessageItem,
  MentoringItem,
  NotificationItem,
  CertificateItem,
  SupportTicketItem,
  ContactDirectoryItem,
  PaperUnitItem,
  AttendanceRecordItem,
} from '@/lib/db';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FolderArchive,
  CreditCard,
  Video,
  MessageSquare,
  FileText,
  CheckSquare,
  Bell,
  Award,
  HelpCircle,
  User,
  PhoneCall,
  Search,
  Download,
  Send,
  Plus,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Eye,
  Check,
  Home,
  Mail,
  Phone,
  UploadCloud,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';
import { Toast } from '../ui/Toast';
import { StudentIDCard } from './StudentIDCard';

export interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
    studentId?: string;
    programme?: string;
    semester?: string;
    mobile?: string;
    address?: string;
    academicInfo?: string;
    imageUrl?: string;
  };
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');


  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'my-program'
    | 'fee'
    | 'my-courses'
    | 'resources'
    | 'live-classes'
    | 'attendance'
    | 'forums'
    | 'assignments'
    | 'assessments'
    | 'circulars'
    | 'messages'
    | 'mentoring'
    | 'notifications'
    | 'certificates'
    | 'tickets'
    | 'profile'
    | 'directory'
  >('dashboard');

  useEffect(() => {
    const validTabs = [
      'dashboard',
      'my-program',
      'fee',
      'my-courses',
      'resources',
      'live-classes',
      'attendance',
      'forums',
      'assignments',
      'assessments',
      'circulars',
      'messages',
      'mentoring',
      'notifications',
      'certificates',
      'tickets',
      'profile',
      'directory',
    ];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [fees, setFees] = useState<FeeActivityItem[]>([]);
  const [forums, setForums] = useState<ForumItem[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    totalSessions: number;
    attendedSessions: number;
    percentage: number;
    records: AttendanceRecordItem[];
  }>({
    totalSessions: 0,
    attendedSessions: 0,
    percentage: 100,
    records: [],
  });
  const [circulars, setCirculars] = useState<CircularItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [mentoring, setMentoring] = useState<MentoringItem | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [directory, setDirectory] = useState<ContactDirectoryItem[]>([]);
  const [allPrograms, setAllPrograms] = useState<ProgramItem[]>([]);
  const [allPapers, setAllPapers] = useState<PaperItem[]>([]);
  const [programmeTab, setProgrammeTab] = useState<'my-programme' | 'all-programmes'>('my-programme');
  const [selectedProgramModal, setSelectedProgramModal] = useState<ProgramItem | null>(null);

  // Assessment Quiz & Result State
  const [studentSubmissions, setStudentSubmissions] = useState<AssessmentSubmissionItem[]>([]);
  const [activeQuizModal, setActiveQuizModal] = useState<{ assessment: AssessmentItem; questions: QuizQuestion[] } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [viewStudentResultModal, setViewStudentResultModal] = useState<{
    submission: AssessmentSubmissionItem;
    answersPayload: SubmissionAnswersPayload | null;
    assessmentTitle: string;
  } | null>(null);

  const handleStartAssessment = (ass: AssessmentItem) => {
    let questions: QuizQuestion[] = [];
    try {
      questions = JSON.parse(ass.questions || '[]');
    } catch {
      questions = [];
    }

    if (questions.length === 0) {
      setToast({ message: 'This assessment has no available questions yet.', type: 'error' });
      return;
    }

    const initialAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {};
    questions.forEach((q) => {
      initialAnswers[q.id] = null;
    });

    setSelectedAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setActiveQuizModal({ assessment: ass, questions });
  };

  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleConfirmSubmitAssessment = async () => {
    if (!activeQuizModal) return;
    setIsSubmittingQuiz(true);
    try {
      const res = await submitAssessmentAction(activeQuizModal.assessment.id, selectedAnswers);
      if (res.success && res.submission) {
        let payload: SubmissionAnswersPayload | null = null;
        try {
          payload = JSON.parse(res.submission.answers);
        } catch {
          payload = null;
        }

        setConfirmSubmitModal(false);
        setActiveQuizModal(null);
        setToast({ message: 'Assessment submitted successfully!', type: 'success' });

        setViewStudentResultModal({
          submission: res.submission,
          answersPayload: payload,
          assessmentTitle: activeQuizModal.assessment.title,
        });

        loadData();
      } else {
        setToast({ message: res.error || 'Failed to submit assessment.', type: 'error' });
      }
    } catch {
      setToast({ message: 'An error occurred while submitting the assessment.', type: 'error' });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleOpenStudentResult = (ass: AssessmentItem, sub: AssessmentSubmissionItem) => {
    let payload: SubmissionAnswersPayload | null = null;
    try {
      payload = JSON.parse(sub.answers);
    } catch {
      payload = null;
    }

    setViewStudentResultModal({
      submission: sub,
      answersPayload: payload,
      assessmentTitle: ass.title,
    });
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Interactive Forms
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionFileSize, setSubmissionFileSize] = useState('');
  const [submissionComments, setSubmissionComments] = useState('');
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);

  const [forumModal, setForumModal] = useState(false);
  const [newForumTitle, setNewForumTitle] = useState('');
  const [newForumContent, setNewForumContent] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const [msgModal, setMsgModal] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const [ticketModal, setTicketModal] = useState(false);
  const [tktSubject, setTktSubject] = useState('');
  const [tktCategory, setTktCategory] = useState('Academic Query');
  const [tktDesc, setTktDesc] = useState('');
  const [tktPriority, setTktPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  // Profile Edit State
  const [profileMobile, setProfileMobile] = useState(user.mobile || '');
  const [profileAddress, setProfileAddress] = useState(user.address || '');

  // Syllabus View Modal
  const [viewSyllabusModal, setViewSyllabusModal] = useState<{ open: boolean; paperName: string; paperCode: string; units: PaperUnitItem[] } | null>(null);

  // Resource Filter & Video Modal State
  const [resourceFileTypeFilter, setResourceFileTypeFilter] = useState<'ALL' | 'Video Link' | 'PDF' | 'Notes'>('ALL');
  const [resourceUnitFilter, setResourceUnitFilter] = useState<'ALL' | '1' | '2' | '3' | '4' | '5'>('ALL');
  const [videoPlayerModal, setVideoPlayerModal] = useState<{ open: boolean; title: string; url: string; notes?: string; paperName?: string; semesterName?: string } | null>(null);

  // Active Selected Semester Filter for Student Portal
  const currentSem = user.semester || 'Semester 1';
  const [selectedSemester, setSelectedSemester] = useState<string>(currentSem);

  useEffect(() => {
    setSelectedSemester(user.semester || 'Semester 1');
  }, [user.semester]);

  const userProg = user.programme || 'MCA';

  // Filter courses for student's enrolled programme and selected semester
  const filteredCourses = courses.filter((c) => {
    const matchProg = !c.programmeName || c.programmeName.toLowerCase().includes(userProg.toLowerCase()) || userProg.toLowerCase().includes(c.programmeName.toLowerCase());
    const matchSem = !c.semester || c.semester === selectedSemester;
    return matchProg && matchSem;
  });

  const enrolledCourseIds = new Set(filteredCourses.map((c) => c.id));
  const enrolledCourseNames = new Set(filteredCourses.map((c) => c.name.toLowerCase()));

  // Filter learning resources uploaded by faculty for enrolled courses, program, & semester
  const filteredResources = resources.filter((r) => {
    if (resourceFileTypeFilter !== 'ALL' && r.fileType !== resourceFileTypeFilter) {
      return false;
    }
    if (resourceUnitFilter !== 'ALL' && String(r.unitNumber || 1) !== resourceUnitFilter) {
      return false;
    }
    if (r.programmeName && userProg) {
      const pMatch = r.programmeName.toLowerCase().includes(userProg.toLowerCase()) || userProg.toLowerCase().includes(r.programmeName.toLowerCase());
      if (!pMatch) return false;
    }
    if (r.semesterName && selectedSemester) {
      if (r.semesterName !== selectedSemester) return false;
    }
    if (!r.programmeName && !r.semesterName) {
      if (r.courseId || r.courseName) {
        const matchCourse = enrolledCourseIds.has(r.courseId) || enrolledCourseNames.has(r.courseName.toLowerCase());
        if (!matchCourse) return false;
      }
    }
    return true;
  });

  // Filter assignments created by faculty for enrolled courses
  const filteredAssignments = assignments.filter((a) => {
    if (!a.courseId && !a.courseName) return true;
    return enrolledCourseIds.has(a.courseId) || enrolledCourseNames.has(a.courseName.toLowerCase());
  });

  // Filter live schedules created by faculty
  const filteredSchedules = schedules.filter((s) => {
    if (!s.courseId && !s.courseName) return true;
    return enrolledCourseIds.has(s.courseId) || enrolledCourseNames.has(s.courseName.toLowerCase());
  });

  // Filter online assessments
  const filteredAssessments = assessments.filter((a) => {
    if (!a.courseId && !a.courseName) return true;
    return enrolledCourseIds.has(a.courseId) || enrolledCourseNames.has(a.courseName.toLowerCase());
  });

  const loadData = async () => {
    try {
      const [crs, res, ass, asg, sch, fe, frm, circ, msg, ment, notif, cert, tkt, dir, stdSubs, attSummary, progs, paps] = await Promise.all([
        fetchCoursesAction(),
        fetchLearningResourcesAction(),
        fetchAssessmentsAction(),
        fetchAssignmentsAction(),
        fetchSchedulesAction(),
        fetchFeeActivitiesAction(),
        fetchDiscussionsAction(),
        fetchCircularsAction(),
        fetchMessagesAction(),
        fetchMentoringInfoAction(),
        fetchNotificationsAction(),
        fetchCertificatesAction(),
        fetchSupportTicketsAction(),
        fetchContactDirectoryAction(),
        fetchStudentSubmissionsAction(),
        fetchStudentAttendanceSummaryAction().catch(() => ({ totalSessions: 0, attendedSessions: 0, percentage: 100, records: [] })),
        fetchProgramsAction().catch(() => []),
        fetchPapersAction().catch(() => []),
      ]);
      setCourses(crs);
      setResources(res);
      setAssessments(ass);
      setAssignments(asg);
      setSchedules(sch);
      setFees(fe);
      setForums(frm);
      setCirculars(circ);
      setMessages(msg);
      setMentoring(ment);
      setNotifications(notif);
      setCertificates(cert);
      setTickets(tkt);
      setDirectory(dir);
      setStudentSubmissions(stdSubs);
      setAttendanceSummary(attSummary);
      setAllPrograms(progs);
      setAllPapers(paps);
    } catch {
      setToast({ message: 'Error loading student data.', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmittingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSubmissionUrl(data.url);
        setSubmissionFileName(data.fileName || file.name);
        setSubmissionFileSize(data.fileSize || '');
        setToast({ message: `File "${data.fileName || file.name}" uploaded successfully.`, type: 'success' });
      } else {
        setToast({ message: data.error || 'Upload failed.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error uploading file.', type: 'error' });
    } finally {
      setIsSubmittingFile(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId) return;
    if (!submissionUrl) {
      setToast({ message: 'Please upload or provide an assignment file before submitting.', type: 'error' });
      return;
    }
    const res = await submitAssignmentAction(
      submittingAssignmentId,
      submissionUrl,
      submissionComments,
      submissionFileName,
      submissionFileSize
    );
    if (res.success) {
      setToast({ message: 'Assignment solution submitted successfully!', type: 'success' });
      setSubmittingAssignmentId(null);
      setSubmissionUrl('');
      setSubmissionFileName('');
      setSubmissionFileSize('');
      setSubmissionComments('');
      loadData();
    } else {
      setToast({ message: res.error || 'Failed to submit assignment.', type: 'error' });
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createDiscussionAction({
      courseId: courses[0]?.id || 'crs_1',
      courseName: courses[0]?.name || 'MCA General',
      subject: 'General Academic Discussion',
      title: newForumTitle,
      content: newForumContent,
    });
    if (res.success) {
      setToast({ message: 'Discussion topic created.', type: 'success' });
      setForumModal(false);
      setNewForumTitle('');
      setNewForumContent('');
      loadData();
    }
  };

  const handleReplyDiscussion = async (forumId: string) => {
    const text = replyText[forumId];
    if (!text || !text.trim()) return;
    const res = await replyToDiscussionAction(forumId, text);
    if (res.success) {
      setReplyText({ ...replyText, [forumId]: '' });
      loadData();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await sendMessageAction('usr_fac_1', 'Arun Kumar', msgSubject, msgBody);
    if (res.success) {
      setToast({ message: 'Message sent to faculty.', type: 'success' });
      setMsgModal(false);
      setMsgSubject('');
      setMsgBody('');
      loadData();
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createSupportTicketAction(tktSubject, tktCategory, tktDesc, tktPriority);
    if (res.success) {
      setToast({ message: 'Support ticket submitted successfully.', type: 'success' });
      setTicketModal(false);
      setTktSubject('');
      setTktDesc('');
      loadData();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSelfProfileAction({ mobile: profileMobile, address: profileAddress });
    if (res.success) {
      setToast({ message: 'Profile information updated.', type: 'success' });
    } else {
      setToast({ message: res.error || 'Failed to update profile.', type: 'error' });
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Program & Semester Quick Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center border border-amber-200 shadow-inner">
            <GraduationCap className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">{user.programme || 'MCA (Master of Computer Applications)'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">Reg: {user.studentId || 'PU2026MCA101'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enrolled Student Cohort • Current Enrolled: <strong className="text-amber-800 font-bold">{currentSem}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Viewing Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            >
              {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                <option key={sem} value={sem}>
                  {sem} {sem === currentSem ? '(Current Enrolled)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* OFFICIAL DIGITAL STUDENT IDENTITY CARD */}
          <StudentIDCard user={user} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming Classes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-600" />
                Upcoming Live Classes
              </h3>
              {schedules.slice(0, 2).map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{s.courseName}</div>
                  <div className="text-slate-500">{s.date} • {s.startTime}</div>
                  <a href={s.meetingLink} target="_blank" rel="noreferrer" className="inline-block mt-1 font-bold text-sky-600 hover:underline">
                    Join Live Class →
                  </a>
                </div>
              ))}
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Pending Assignments
              </h3>
              {assignments.slice(0, 2).map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{a.title}</div>
                  <div className="text-slate-500">Due: {a.dueDate} • Max Marks: {a.maxMarks}</div>
                  <button onClick={() => setActiveTab('assignments')} className="mt-1 text-purple-600 font-semibold hover:underline">
                    Submit Solution →
                  </button>
                </div>
              ))}
            </div>

            {/* Notifications preview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                Recent Announcements
              </h3>
              {notifications.slice(0, 2).map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-slate-500">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROGRAMMES & ACADEMIC INFORMATION (SECTION 2 REQUIREMENTS) */}
      {activeTab === 'my-program' && (
        <div className="space-y-6">
          {/* Header & Section Navigation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span>Programmes & Academic Information Access</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View your enrolled programme details, explore all available university programmes, inspect associated courses, and connect with course coordinators and mentors.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setProgrammeTab('my-programme')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  programmeTab === 'my-programme'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Enrolled Programme
              </button>
              <button
                onClick={() => setProgrammeTab('all-programmes')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  programmeTab === 'all-programmes'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Available Programmes ({allPrograms.length})
              </button>
            </div>
          </div>

          {/* VIEW: MY ENROLLED PROGRAMME */}
          {programmeTab === 'my-programme' && (
            <div className="space-y-6">
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Programme Details Card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-mono">
                        Programme Code: {allPrograms.find(p => p.name === user.programme)?.code || '010'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {user.programme || 'Master of Computer Applications (MCA)'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Department of Computer Science & Applications • Periyar University
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs">
                      Active Enrollment
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Enrolled Semester</span>
                      <strong className="text-slate-900 text-sm">{selectedSemester}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Student ID / Roll No</span>
                      <strong className="text-indigo-700 font-mono text-sm">{user.studentId || user.username || 'PU-STU-001'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Academic Year</span>
                      <strong className="text-slate-900 text-sm">{(user as any).academicYear || '2024-2026'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Medium</span>
                      <strong className="text-slate-900 text-sm">English</strong>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-indigo-900">Academic Status & Performance:</span>
                      <p className="text-indigo-700 mt-0.5">{user.academicInfo || 'CGPA 3.85 | All Core Modules In Good Standing'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-indigo-500 block">Attendance Standing</span>
                      <span className="font-black text-indigo-950 text-base">{attendanceSummary.percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Assigned Mentor Card */}
                <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                        ASSIGNED MENTOR
                      </span>
                      <User className="w-5 h-5 text-teal-400" />
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">
                        {mentoring?.mentorName || (user as any).mentorName || 'Dr. K. Senthil Kumar'}
                      </h4>
                      <p className="text-xs text-teal-300">Academic Mentor & Student Counselor</p>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-slate-800 text-slate-300">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-teal-400" />
                        <span>{mentoring?.mentorEmail || 'mentor@periyaruniversity.ac.in'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-teal-400" />
                        <span>{mentoring?.mentorContact || '+91 98765 43210'}</span>
                      </p>
                      <p className="text-[11px] text-teal-200/80 pt-1">
                        <strong>Meeting Hours:</strong> {mentoring?.meetingInfo || 'Wednesdays 3:00 PM - 4:00 PM (Room 204)'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('mentoring')}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>View Mentoring Portal</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Associated Courses & Course Coordinator Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span>Associated Courses & Course Coordinator Directory</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curriculum courses mapped to {selectedSemester} with designated faculty course coordinators.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
                    {filteredCourses.length} Courses Enrolled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.length === 0 ? (
                    <div className="col-span-2 p-8 text-center bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
                      No courses mapped for {selectedSemester}. Please select another semester from above.
                    </div>
                  ) : (
                    filteredCourses.map((crs) => {
                      const coordUser = directory.find(d => d.name.toLowerCase() === crs.facultyName.toLowerCase());
                      return (
                        <div key={crs.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-3 shadow-xs">
                          <div className="flex justify-between items-start gap-2 border-b pb-2">
                            <div>
                              <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-slate-900 text-white">
                                {crs.code}
                              </span>
                              <h4 className="font-extrabold text-slate-900 text-sm mt-1">{crs.name}</h4>
                              <p className="text-xs text-slate-500">{crs.subject}</p>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 rounded">
                              {selectedSemester}
                            </span>
                          </div>

                          {/* Course Coordinator Details */}
                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Designated Course Coordinator:</span>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                                {(crs.facultyName || 'F')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{crs.facultyName || 'Faculty Coordinator'}</p>
                                <p className="text-[10px] text-slate-400">{coordUser?.email || 'coordinator@periyaruniversity.ac.in'}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                              <span>Department: Computer Science</span>
                              <span>Contact: {coordUser?.phone || '+91 94444 12345'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500 font-semibold">Assessment: {crs.assessment || 'Continuous Evaluation'}</span>
                            <button
                              onClick={() => setActiveTab('resources')}
                              className="text-indigo-600 font-bold hover:underline"
                            >
                              Access Learning Resources →
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ALL AVAILABLE PROGRAMMES */}
          {programmeTab === 'all-programmes' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>Explore all degree programmes offered across university departments and faculties.</span>
                <span className="font-bold text-slate-800">{allPrograms.length} Programmes Offered</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPrograms.map((prog) => {
                  const progPapers = allPapers.filter(p => p.programmeId === prog.id);
                  const isCurrent = prog.name === user.programme || prog.code === '010';

                  return (
                    <div
                      key={prog.id}
                      className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                        isCurrent ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2.5 py-0.5 text-xs font-mono font-black rounded bg-slate-900 text-white">
                            {prog.code}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Your Programme
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{prog.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{prog.department || 'Centre for Distance and Online Education'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                          <p><strong>Eligibility:</strong> {prog.eligibility || 'Graduate degree with Mathematics / Statistics'}</p>
                          <p><strong>Medium:</strong> {prog.medium || 'English'}</p>
                          <p><strong>Academic Year:</strong> {prog.academicYear || '2025-2026'}</p>
                          <p><strong>Associated Courses:</strong> <strong className="text-indigo-700">{progPapers.length} Courses</strong></p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProgramModal(prog)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Programme Curriculum Details</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MY COURSES */}
      {activeTab === 'my-courses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Registered Courses ({selectedSemester})</h3>
              <p className="text-xs text-slate-500">Viewing assigned faculty and detailed syllabus for {user.programme || 'MCA'}</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
              {filteredCourses.length} Courses Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-white rounded-2xl border text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No courses listed for {selectedSemester}</p>
                <p className="text-xs">Switch semester using the selector above to view other semester courses.</p>
              </div>
            ) : (
              filteredCourses.map((crs) => (
                <div key={crs.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">{crs.code}</span>
                    <h3 className="font-bold text-slate-900 text-base">{crs.name}</h3>
                    <div className="p-2.5 bg-slate-50 rounded-xl border space-y-1">
                      <p className="text-xs font-bold text-slate-800">Assigned Faculty: {crs.facultyName}</p>
                      <p className="text-xs text-slate-500">{crs.subject}</p>
                    </div>
                    <div className="pt-2 border-t flex justify-between text-xs font-semibold text-amber-700">
                      <span>Assessment: {crs.assessment}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const units = await fetchPaperUnitsAction(crs.id);
                        setViewSyllabusModal({
                          open: true,
                          paperName: crs.name,
                          paperCode: crs.code,
                          units,
                        });
                      } catch {
                        setToast({ message: 'Error loading course syllabus.', type: 'error' });
                      }
                    }}
                    className="w-full mt-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Detailed Syllabus</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. LEARNING RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-600" />
                <span>Learning Resources & Video Lectures Hub</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Faculty video lectures, study materials & PDFs uploaded for {userProg} • {selectedSemester}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Unit Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                <span className="text-[11px] text-slate-500 font-bold px-2">Unit:</span>
                {(['ALL', '1', '2', '3', '4', '5'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setResourceUnitFilter(u)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      resourceUnitFilter === u ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {u === 'ALL' ? 'All Units' : `Unit ${u}`}
                  </button>
                ))}
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setResourceFileTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    resourceFileTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({resources.length})
                </button>
                <button
                  onClick={() => setResourceFileTypeFilter('Video Link')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    resourceFileTypeFilter === 'Video Link' ? 'bg-rose-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Videos</span>
                </button>
                <button
                  onClick={() => setResourceFileTypeFilter('PDF')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    resourceFileTypeFilter === 'PDF' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDFs</span>
                </button>
                <button
                  onClick={() => setResourceFileTypeFilter('Notes')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    resourceFileTypeFilter === 'Notes' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-amber-600'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Notes</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed space-y-2">
                <Video className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No resources found for {selectedSemester}</p>
                <p className="text-xs">Switch your semester or unit filter selection to explore all faculty uploads.</p>
              </div>
            ) : (
              filteredResources.map((res) => (
                <div key={res.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Top Header Tag */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 ${
                        res.fileType === 'Video Link' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}>
                        {res.fileType === 'Video Link' ? <Video className="w-3 h-3 text-rose-600" /> : <FileText className="w-3 h-3 text-sky-600" />}
                        <span>{res.fileType}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {res.uploadedAt}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">{res.title}</h4>

                    {/* Program, Semester, Paper details */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[11px] flex items-center gap-1">
                          🎓 {res.programmeName || userProg}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md font-bold text-[11px] flex items-center gap-1">
                          📅 {res.semesterName || selectedSemester}
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px] flex items-center gap-1">
                          🏷️ Unit {res.unitNumber || 1}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="truncate">{res.paperName || res.subject || res.courseName}</span>
                      </div>
                    </div>

                    {/* Description / Notes */}
                    {res.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/50 p-2 rounded-lg">
                        "{res.notes}"
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t">
                    {res.fileType === 'Video Link' ? (
                      <button
                        onClick={() => {
                          recordResourceViewAction(res.id).catch(console.error);
                          setVideoPlayerModal({
                            open: true,
                            title: res.title,
                            url: res.fileUrl,
                            notes: res.notes,
                            paperName: res.paperName || res.subject || res.courseName,
                            semesterName: res.semesterName || selectedSemester,
                          });
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>▶ Watch Video Lecture</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          recordResourceViewAction(res.id).catch(console.error);
                          setVideoPlayerModal({
                            open: true,
                            title: res.title,
                            url: res.fileUrl,
                            notes: res.notes,
                            paperName: res.paperName || res.subject || res.courseName,
                            semesterName: res.semesterName || selectedSemester,
                          });
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View / Preview Material</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. LIVE CLASSES */}
      {activeTab === 'live-classes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Live Virtual Classes & Lab Meetings</h2>
          <div className="space-y-3">
            {filteredSchedules.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">No live classes scheduled for {selectedSemester}.</div>
            ) : (
              filteredSchedules.map((sch) => (
                <div key={sch.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{sch.courseName}</h4>
                    <p className="text-slate-500">{sch.subject} • Date: {sch.date} • Time: {sch.startTime} - {sch.endTime}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded font-semibold ${sch.status === 'Live' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      Status: {sch.status}
                    </span>
                  </div>
                  {sch.meetingLink && (
                    <a href={sch.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700">
                      Join Class Now
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE & PARTICIPATION */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Attendance & Class Participation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor your personal attendance records, class participation metrics, and exam eligibility status.
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${
                attendanceSummary.percentage >= 75
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {attendanceSummary.percentage >= 75 ? '✓ Exam Eligible (>=75%)' : '⚠ Below 75% Requirement'}
            </span>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Sessions</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{attendanceSummary.totalSessions}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Sessions Attended</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{attendanceSummary.attendedSessions}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Absent / Missed</span>
              <p className="text-2xl font-black text-rose-900 mt-1">
                {Math.max(0, attendanceSummary.totalSessions - attendanceSummary.attendedSessions)}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Attendance Rate</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{attendanceSummary.percentage}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Cumulative Attendance Progress</span>
              <span className="text-indigo-700 font-bold font-mono">{attendanceSummary.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  attendanceSummary.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${attendanceSummary.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Minimum 75% attendance in scheduled classes and laboratory sessions is required to be eligible for end-semester examinations.
            </p>
          </div>

          {/* Detailed Attendance Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Course / Subject</th>
                  <th className="px-4 py-3">Session Date</th>
                  <th className="px-4 py-3">Attendance Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceSummary.records.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{att.courseName}</td>
                    <td className="px-4 py-3 text-slate-500">{att.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{att.remarks || 'Regular class session'}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{att.recordedBy || 'Faculty'}</td>
                  </tr>
                ))}
                {attendanceSummary.records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No attendance sessions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Course Assignments</h2>
              <p className="text-xs text-slate-500">Assignments created by assigned faculty for your programme & semester</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full">
              {filteredAssignments.length} Assignments
            </span>
          </div>

          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed">
                No assignments posted for {selectedSemester}.
              </div>
            ) : (
              filteredAssignments.map((asg) => {
                const mySub = asg.submissions.find((s) => s.studentId === user.id);
                const unitLabel = asg.unitName || (typeof asg.unitNumber === 'number' ? `Unit ${asg.unitNumber}` : 'Unit 1');
                const isPastDue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;

                // Determine accurate student submission status
                let subStatus: 'Not Submitted' | 'Submitted' | 'Late Submission' | 'Reviewed' = 'Not Submitted';
                if (mySub) {
                  if (mySub.marks !== undefined || mySub.status === 'Reviewed' || mySub.status === 'Evaluated') {
                    subStatus = 'Reviewed';
                  } else if (mySub.status === 'Late Submission' || mySub.status === 'Late') {
                    subStatus = 'Late Submission';
                  } else {
                    subStatus = 'Submitted';
                  }
                }

                return (
                  <div key={asg.id} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:border-slate-300 transition-all">
                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {unitLabel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800">
                            {asg.courseName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            Objective Assignment
                          </span>
                          {asg.allowResubmission && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Resubmissions Allowed
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-slate-900 text-base mt-1">{asg.title}</h3>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          subStatus === 'Reviewed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : subStatus === 'Late Submission'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : subStatus === 'Submitted'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {subStatus === 'Reviewed' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        {subStatus === 'Late Submission' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {subStatus === 'Submitted' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        {subStatus === 'Not Submitted' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                        <span>Status: {subStatus}</span>
                      </span>
                    </div>

                    {/* Timing & Total Marks Strip */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {asg.startDate && (
                        <span>
                          <strong>Start Date:</strong> {asg.startDate.replace('T', ' ')}
                        </span>
                      )}
                      <span className={isPastDue ? 'text-rose-600 font-bold' : ''}>
                        <strong>Due Date:</strong> {asg.dueDate.replace('T', ' ')} {isPastDue && '(Deadline Passed)'}
                      </span>
                      <span>
                        <strong>Total Marks:</strong> <strong className="text-slate-900">{asg.maxMarks}</strong>
                      </span>
                    </div>

                    {/* Description & Detailed Instructions */}
                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {asg.description && (
                        <p className="font-semibold text-slate-800">
                          <strong>Description:</strong> {asg.description}
                        </p>
                      )}
                      {(asg.detailedDescription || asg.instructions) && (
                        <div className="pt-1 whitespace-pre-line leading-relaxed text-slate-700">
                          <strong>Detailed Instructions:</strong>
                          <div className="mt-1 p-3 bg-white rounded-lg border border-slate-200/80 font-sans">
                            {asg.detailedDescription || asg.instructions}
                          </div>
                        </div>
                      )}
                      {asg.additionalInstructions && (
                        <p className="text-amber-800 italic pt-1">
                          <strong>Additional Note:</strong> {asg.additionalInstructions}
                        </p>
                      )}
                    </div>

                    {/* Attached Resources Download (Requirement 3: Download attached assignment resources) */}
                    {(asg.attachmentUrl || (asg.resources && asg.resources.length > 0)) && (
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs flex flex-wrap items-center justify-between gap-3">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span>Staff Attached Assignment Resources:</span>
                        </span>
                        <a
                          href={asg.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{asg.resources?.[0]?.name || asg.attachmentUrl?.split('/').pop() || 'Download Resource File'}</span>
                        </a>
                      </div>
                    )}

                    {/* Evaluated Marks & Faculty Feedback */}
                    {mySub && (
                      <div className="p-4 bg-emerald-50/70 rounded-xl text-xs space-y-2 border border-emerald-200">
                        <div className="flex justify-between items-center text-emerald-900 font-bold">
                          <span>
                            ✓ Submission Recorded on{' '}
                            {mySub.submissionDate?.includes('T')
                              ? mySub.submissionDate.split('T')[0] + ' ' + mySub.submissionDate.split('T')[1].slice(0, 5)
                              : mySub.submissionDate}
                          </span>
                          {mySub.marks !== undefined && (
                            <span className="text-sm bg-emerald-200/80 text-emerald-900 px-3 py-0.5 rounded-full font-black">
                              Grade: {mySub.marks} / {asg.maxMarks}
                            </span>
                          )}
                        </div>

                        {mySub.fileUrl && (
                          <div className="flex items-center gap-2 pt-1 text-slate-600">
                            <span>Your Uploaded File:</span>
                            <a
                              href={mySub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="font-bold text-indigo-700 hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>{mySub.fileName || 'View Submitted File'}</span>
                            </a>
                          </div>
                        )}

                        {mySub.comments && (
                          <p className="text-slate-600 italic">
                            <strong>Your Comments:</strong> "{mySub.comments}"
                          </p>
                        )}

                        {mySub.feedback && (
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-slate-800 mt-1">
                            <strong className="text-emerald-900 block mb-0.5">Faculty Evaluation Feedback:</strong>
                            <p className="leading-relaxed">{mySub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Section / Form */}
                    <div className="pt-2 border-t">
                      {submittingAssignmentId === asg.id ? (
                        <form onSubmit={handleAssignmentSubmit} className="p-4 bg-purple-50/40 rounded-2xl border border-purple-200 space-y-3.5 text-xs">
                          <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                            <h4 className="font-bold text-purple-950 flex items-center gap-1.5">
                              <UploadCloud className="w-4 h-4 text-purple-600" />
                              <span>Submit Your Assignment File</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingAssignmentId(null);
                                setSubmissionUrl('');
                                setSubmissionFileName('');
                                setSubmissionFileSize('');
                                setSubmissionComments('');
                              }}
                              className="text-slate-400 hover:text-slate-600 font-bold"
                            >
                              ✕ Close
                            </button>
                          </div>

                          {/* File Upload Selector (Accept PDF, DOC, DOCX, etc.) */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-slate-700">
                              Upload Assignment File (PDF, DOC, DOCX, ZIP, Images up to 25MB) <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-sm shrink-0">
                                <UploadCloud className="w-4 h-4" />
                                <span>{isSubmittingFile ? 'Uploading...' : 'Choose File'}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                                  onChange={handleStudentFileUpload}
                                  className="hidden"
                                  disabled={isSubmittingFile}
                                />
                              </label>

                              <div className="flex-1 w-full">
                                <input
                                  type="text"
                                  placeholder="Or paste direct submission link / URL..."
                                  value={submissionUrl}
                                  onChange={(e) => setSubmissionUrl(e.target.value)}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                                />
                              </div>
                            </div>

                            {submissionUrl && (
                              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-purple-200 text-xs">
                                <span className="font-semibold text-purple-900 truncate">
                                  📎 {submissionFileName || submissionUrl} {submissionFileSize && `(${submissionFileSize})`}
                                </span>
                                <span className="text-emerald-600 font-bold text-[11px]">Ready to Submit</span>
                              </div>
                            )}
                          </div>

                          {/* Optional Submission Comments (Requirement 3: Add submission comments optional) */}
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Submission Comments / Notes (Optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Add optional notes for the faculty reviewer (e.g. key assumptions made, special implementation notes)..."
                              value={submissionComments}
                              onChange={(e) => setSubmissionComments(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setSubmittingAssignmentId(null)}
                              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!submissionUrl || isSubmittingFile}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                            >
                              {mySub ? 'Update / Resubmit Solution' : 'Confirm & Submit Assignment'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          {mySub ? (
                            asg.allowResubmission ? (
                              <button
                                onClick={() => {
                                  setSubmittingAssignmentId(asg.id);
                                  setSubmissionUrl(mySub.fileUrl || '');
                                  setSubmissionFileName(mySub.fileName || '');
                                  setSubmissionComments(mySub.comments || '');
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                              >
                                Replace / Resubmit Assignment
                              </button>
                            ) : (
                              <div className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Assignment Submitted. Resubmission is not enabled by staff.</span>
                              </div>
                            )
                          ) : (
                            <button
                              onClick={() => {
                                setSubmittingAssignmentId(asg.id);
                                setSubmissionUrl('');
                                setSubmissionFileName('');
                                setSubmissionFileSize('');
                                setSubmissionComments('');
                              }}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>Upload & Submit Assignment</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 7. ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Subjective Section
              </span>
              <span className="text-xs text-slate-400">Academic Assessment Portal</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Scheduled Subjective Course Assessments</h2>
            <p className="text-xs text-slate-500">Access scheduled subjective assessments, review problem rubrics, and inspect evaluation results.</p>
          </div>
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">No assessments scheduled for {selectedSemester}.</div>
            ) : (
              filteredAssessments.map((ass) => {
                const existingSub = studentSubmissions.find((s) => s.assessmentId === ass.id);
                return (
                  <div key={ass.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ass.title}</h4>
                        {existingSub && (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              existingSub.percentage >= 40
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Status: {existingSub.percentage >= 40 ? 'PASS' : 'FAIL'}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-1">
                        {ass.courseName} • Date: {ass.date} • Duration: {ass.duration} • Total Marks: {ass.maxMarks}
                      </p>
                      {existingSub && (
                        <p className="text-xs font-semibold text-emerald-700 mt-1">
                          Completed • Score: {existingSub.score}/{existingSub.maxMarks} ({existingSub.percentage}%)
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {existingSub ? (
                        <button
                          onClick={() => handleOpenStudentResult(ass, existingSub)}
                          className="px-4 py-2 bg-sky-50 text-sky-700 border border-sky-200 font-semibold rounded-xl hover:bg-sky-100 flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Result</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(ass)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Start Assessment</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 8. FEE ACTIVITY */}
      {activeTab === 'fee' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Fee Activity & Payment Receipts</h2>
          <div className="space-y-3">
            {fees.map((fe) => (
              <div key={fe.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{fe.feeType}</h4>
                  <p className="text-slate-500">Amount: <strong>₹{fe.amount.toLocaleString()}</strong> • Due Date: {fe.dueDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${fe.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {fe.status}
                  </span>
                  {fe.receiptUrl && <a href={fe.receiptUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-semibold hover:underline">Download Receipt</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DISCUSSION FORUMS */}
      {activeTab === 'forums' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">Subject Discussion Forums</h2>
            <button onClick={() => setForumModal(true)} className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl">
              Create Discussion
            </button>
          </div>

          <div className="space-y-6">
            {forums.map((frm) => (
              <div key={frm.id} className="p-5 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{frm.title}</h3>
                  <p className="text-xs text-slate-500">{frm.courseName} • Author: {frm.authorName} ({frm.authorRole}) • {frm.createdAt}</p>
                  <p className="text-xs text-slate-700 mt-2">{frm.content}</p>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">Replies ({frm.replies.length})</h4>
                  {frm.replies.map((rep) => (
                    <div key={rep.id} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-slate-900">{rep.authorName} ({rep.authorRole}):</span>
                      <p className="text-slate-700">{rep.content}</p>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyText[frm.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [frm.id]: e.target.value })}
                      placeholder="Write a reply..."
                      className="flex-1 p-2 border rounded-xl text-xs"
                    />
                    <button onClick={() => handleReplyDiscussion(frm.id)} className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. CIRCULARS */}
      {activeTab === 'circulars' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">University Circulars & Announcements</h2>
          <div className="space-y-3">
            {circulars.map((circ) => (
              <div key={circ.id} className="p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{circ.title}</h4>
                  {circ.isImportant && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Important</span>}
                </div>
                <p className="text-slate-500">Published: {circ.date}</p>
                <p className="text-slate-700">{circ.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">Faculty & Coordinator Messages</h2>
            <button onClick={() => setMsgModal(true)} className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl">New Message</button>
          </div>

          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{m.subject}</h4>
                <p className="text-slate-500">From: {m.senderName} • Sent: {m.sentAt}</p>
                <p className="text-slate-700 mt-2">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. MENTORING */}
      {activeTab === 'mentoring' && mentoring && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-sm">
          <h2 className="text-lg font-bold text-slate-900">Academic Mentoring Module</h2>
          <p><span className="text-slate-500">Mentor Name:</span> <strong>{mentoring.mentorName}</strong></p>
          <p><span className="text-slate-500">Contact:</span> {mentoring.mentorContact}</p>
          <p><span className="text-slate-500">Meeting Info:</span> {mentoring.meetingInfo}</p>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase">Mentoring Session History</h4>
            {mentoring.history.map((h, i) => <p key={i} className="text-slate-700">• {h}</p>)}
          </div>
        </div>
      )}

      {/* 13. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">Notifications Center</h2>
            <button onClick={async () => { await markAllNotificationsAsReadAction(); loadData(); }} className="text-xs font-semibold text-sky-600 hover:underline">
              Mark All as Read
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border text-xs flex justify-between items-center ${n.isRead ? 'bg-white border-slate-200' : 'bg-sky-50/70 border-sky-200'}`}>
                <div>
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <p className="text-slate-600 mt-0.5">{n.message}</p>
                </div>
                {!n.isRead && (
                  <button onClick={async () => { await markNotificationAsReadAction(n.id); loadData(); }} className="px-3 py-1 bg-sky-600 text-white font-semibold rounded-lg text-[11px]">
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Issued Course & Programme Certificates</h2>
          <div className="space-y-3">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.certificateName}</h4>
                  <p className="text-slate-500">ID: {c.certificateId} • Issue Date: {c.issueDate}</p>
                </div>
                <a href={c.downloadUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl">View / Download</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900">Student Support Tickets</h2>
            <button onClick={() => setTicketModal(true)} className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl">Create Ticket</button>
          </div>

          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{t.subject}</h4>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">{t.status}</span>
                </div>
                <p className="text-slate-500">Category: {t.category} • Priority: {t.priority}</p>
                <p className="text-slate-700">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-xl mx-auto space-y-6 text-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">My Student Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input type="text" disabled value={user.name} className="w-full p-2.5 bg-slate-100 border rounded-xl text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input type="text" disabled value={user.email} className="w-full p-2.5 bg-slate-100 border rounded-xl text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (Permitted Edit)</label>
              <input type="text" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address (Permitted Edit)</label>
              <input type="text" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} className="w-full p-2.5 border rounded-xl" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-semibold rounded-xl shadow">Save Profile Changes</button>
          </form>
        </div>
      )}

      {/* 17. CONTACT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">University Contact Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directory.map((dir) => (
              <div key={dir.id} className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{dir.name}</h4>
                <p className="text-slate-500">{dir.role} • {dir.programme}</p>
                <p className="text-slate-700 font-medium">✉️ {dir.email} | 📞 {dir.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Discussion Modal */}
      {forumModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setForumModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Create Discussion Topic</h3>
            <form onSubmit={handleCreateDiscussion} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Title *</label>
                <input type="text" required value={newForumTitle} onChange={(e) => setNewForumTitle(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Content *</label>
                <textarea rows={4} required value={newForumContent} onChange={(e) => setNewForumContent(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-semibold rounded-xl">Post Discussion</button>
            </form>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setMsgModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Send Message to Faculty</h3>
            <form onSubmit={handleSendMessage} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Subject *</label>
                <input type="text" required value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Message Body *</label>
                <textarea rows={4} required value={msgBody} onChange={(e) => setMsgBody(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-xl">Send Message</button>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {ticketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setTicketModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Subject *</label>
                <input type="text" required value={tktSubject} onChange={(e) => setTktSubject(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description *</label>
                <textarea rows={3} required value={tktDesc} onChange={(e) => setTktDesc(e.target.value)} className="w-full p-2 border rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl">Submit Ticket</button>
            </form>
          </div>
        </div>
      )}

      {/* View Detailed Syllabus Modal */}
      {viewSyllabusModal && viewSyllabusModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewSyllabusModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-100 text-indigo-800 rounded">
                  {viewSyllabusModal.paperCode}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{viewSyllabusModal.paperName}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Official Detailed Course Syllabus</p>
            </div>

            <div className="space-y-4">
              {viewSyllabusModal.units.map((unit) => (
                <div key={unit.unitNumber} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-slate-200 text-slate-800 rounded font-mono">
                        UNIT {unit.unitNumber}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{unit.title || `Unit ${unit.unitNumber}`}</h4>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      unit.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : unit.status === 'Text Added'
                        ? 'bg-blue-100 text-blue-800'
                        : unit.status === 'PDF Uploaded'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  {unit.textContent ? (
                    <div className="p-3 bg-white rounded-lg border text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {unit.textContent}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No text content added yet.</p>
                  )}

                  {unit.pdfUrl && (
                    <div className="pt-2 flex items-center justify-between border-t text-xs">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" /> Attached Syllabus PDF
                      </span>
                      <a
                        href={unit.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download / View PDF
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setViewSyllabusModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal Overlay */}
      {videoPlayerModal && videoPlayerModal.open && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[95vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setVideoPlayerModal(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase bg-rose-100 text-rose-700 rounded-md flex items-center gap-1">
                  <Video className="w-3 h-3" /> Lecture Video
                </span>
                {videoPlayerModal.semesterName && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-md">
                    {videoPlayerModal.semesterName}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{videoPlayerModal.title}</h3>
              {videoPlayerModal.paperName && (
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> {videoPlayerModal.paperName}
                </p>
              )}
            </div>

            {/* Video Player Box */}
            <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-inner flex items-center justify-center">
              {(() => {
                const url = videoPlayerModal.url || '';
                let embedUrl = null;
                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (ytMatch && ytMatch[1]) {
                  embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
                }

                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      title={videoPlayerModal.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  );
                } else if (url.startsWith('blob:') || url.match(/\.(mp4|webm|ogg)($|\?)/i)) {
                  return (
                    <video controls autoPlay className="w-full h-full object-contain">
                      <source src={url} />
                      Your browser does not support html5 video playback.
                    </video>
                  );
                } else {
                  return (
                    <iframe
                      src={url}
                      title={videoPlayerModal.title}
                      className="w-full h-full border-0 bg-white"
                    />
                  );
                }
              })()}
            </div>

            {/* Notes & Description */}
            {videoPlayerModal.notes && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 block tracking-wider">Faculty Description & Timestamps</span>
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{videoPlayerModal.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t flex justify-end items-center text-xs">
              <button
                onClick={() => setVideoPlayerModal(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow"
              >
                Close Video Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT QUIZ INTERFACE MODAL (Requirement 2 & 3) */}
      {activeQuizModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px] uppercase tracking-wider">
                  Live Online Assessment
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeQuizModal.assessment.title}</h3>
                <p className="text-xs text-slate-500">{activeQuizModal.assessment.courseName} • Time Limit: {activeQuizModal.assessment.duration}</p>
              </div>

              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            </div>

            {/* Question Quick-Jump Palette */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Question Navigation Palette</p>
              <div className="flex flex-wrap gap-2">
                {activeQuizModal.questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== null;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-emerald-500 ring-offset-2 bg-slate-900 text-white'
                          : isAnswered
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Card (Requirement 2) */}
            {(() => {
              const q = activeQuizModal.questions[currentQuestionIndex];
              const selectedOpt = selectedAnswers[q.id] ?? null;

              return (
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-6">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b pb-2">
                    <span>Question {currentQuestionIndex + 1} of {activeQuizModal.questions.length}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">1 Mark</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>

                  {/* 4 Single Selection Radio Options */}
                  <div className="space-y-3 pt-2">
                    {[
                      { key: 'A', text: q.optionA },
                      { key: 'B', text: q.optionB },
                      { key: 'C', text: q.optionC },
                      { key: 'D', text: q.optionD },
                    ].map((opt) => {
                      const isSelected = selectedOpt === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.key as any)}
                          className={`w-full p-4 rounded-xl text-left border-2 text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-slate-100 text-slate-600'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Bottom Question Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 border rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs font-bold text-slate-500">
                Answered: {Object.values(selectedAnswers).filter(Boolean).length} / {activeQuizModal.questions.length}
              </div>

              {currentQuestionIndex < activeQuizModal.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuizModal.questions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmSubmitModal(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL (Requirement 3) */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Submit Assessment Confirmation</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to submit your assessment? You have answered{' '}
              <strong>{Object.values(selectedAnswers).filter(Boolean).length}</strong> out of{' '}
              <strong>{activeQuizModal?.questions.length}</strong> questions.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSubmitModal(false)}
                className="flex-1 py-2.5 border rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                disabled={isSubmittingQuiz}
                onClick={handleConfirmSubmitAssessment}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
              >
                {isSubmittingQuiz ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT RESULT VIEW MODAL (Requirements 4, 5 & 7) */}
      {viewStudentResultModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewStudentResultModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-4">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
                Official Assessment Result
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{viewStudentResultModal.assessmentTitle}</h3>
              <p className="text-xs text-slate-500">Student: <strong>{user.name}</strong></p>
            </div>

            {/* Score & Result Summary Card (Requirement 4 & 5) */}
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 ${
                viewStudentResultModal.submission.percentage >= 40
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="inline-block px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest bg-white shadow-sm border">
                Result Status:{' '}
                <span className={viewStudentResultModal.submission.percentage >= 40 ? 'text-emerald-700' : 'text-rose-700'}>
                  {viewStudentResultModal.answersPayload?.status || (viewStudentResultModal.submission.percentage >= 40 ? 'PASS' : 'FAIL')}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-900">
                Score: {viewStudentResultModal.submission.score} / {viewStudentResultModal.submission.maxMarks}
              </div>

              <div className="text-sm font-bold text-slate-600">
                Score Percentage: <span className="text-slate-900">{viewStudentResultModal.submission.percentage}%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 text-xs">
                <div className="bg-white p-2.5 rounded-xl border text-center">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">Total Questions</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {viewStudentResultModal.answersPayload?.totalQuestions || viewStudentResultModal.submission.maxMarks}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border text-center">
                  <span className="text-emerald-600 font-medium block text-[10px] uppercase">Correct</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {viewStudentResultModal.answersPayload?.correctCount ?? viewStudentResultModal.submission.score}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border text-center">
                  <span className="text-rose-600 font-medium block text-[10px] uppercase">Wrong</span>
                  <span className="font-extrabold text-rose-700 text-sm">
                    {viewStudentResultModal.answersPayload?.wrongCount ?? 0}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border text-center">
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Unanswered</span>
                  <span className="font-extrabold text-slate-700 text-sm">
                    {viewStudentResultModal.answersPayload?.unansweredCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Question-wise Result Breakdown (Requirement 7) */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-2">Question-wise Analysis</h4>

              {viewStudentResultModal.answersPayload?.details?.map((detail, idx) => {
                const getOptText = (optKey: 'A' | 'B' | 'C' | 'D' | null) => {
                  if (!optKey) return 'Not Answered';
                  if (optKey === 'A') return `A. ${detail.optionA}`;
                  if (optKey === 'B') return `B. ${detail.optionB}`;
                  if (optKey === 'C') return `C. ${detail.optionC}`;
                  if (optKey === 'D') return `D. ${detail.optionD}`;
                  return optKey;
                };

                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-slate-900 text-sm">
                        Q{idx + 1}. {detail.question}
                      </p>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                          detail.selectedAnswer === null
                            ? 'bg-slate-200 text-slate-700'
                            : detail.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {detail.selectedAnswer === null ? 'Unanswered' : detail.isCorrect ? 'Correct' : 'Wrong'}
                      </span>
                    </div>

                    <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Your Answer:</span>
                        <span className={`font-semibold ${detail.isCorrect ? 'text-emerald-700' : detail.selectedAnswer ? 'text-rose-700' : 'text-slate-500'}`}>
                          {getOptText(detail.selectedAnswer)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Correct Answer:</span>
                        <span className="font-semibold text-emerald-700">
                          {getOptText(detail.correctAnswer)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Programme Curriculum & Details Modal */}
      {selectedProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-xs rounded font-bold">
                    {selectedProgramModal.code}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full font-bold">
                    {(selectedProgramModal as any).level || 'Postgraduate'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedProgramModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedProgramModal.department || 'Centre for Distance and Online Education'}</p>
              </div>
              <button
                onClick={() => setSelectedProgramModal(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                <span className="font-bold text-slate-800">{(selectedProgramModal as any).duration || '2 Years (4 Semesters)'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Medium</span>
                <span className="font-bold text-slate-800">{selectedProgramModal.medium || 'English'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Credits</span>
                <span className="font-bold text-slate-800">{(selectedProgramModal as any).totalCredits || 72} Credits</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Year</span>
                <span className="font-bold text-slate-800">{selectedProgramModal.academicYear || '2025-2026'}</span>
              </div>
            </div>

            {selectedProgramModal.eligibility && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                <strong className="text-amber-900 font-bold block">Eligibility Criteria:</strong>
                <p className="text-amber-800">{selectedProgramModal.eligibility}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Associated Curriculum Courses ({allPapers.filter(p => p.programmeId === selectedProgramModal.id).length})</span>
                </h4>
                <span className="text-xs text-slate-500">Official PU Syllabi Courses</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allPapers.filter(p => p.programmeId === selectedProgramModal.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 text-center border rounded-xl">No courses registered under this programme yet.</p>
                ) : (
                  allPapers
                    .filter(p => p.programmeId === selectedProgramModal.id)
                    .map((course) => (
                      <div key={course.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-white text-slate-800 border text-[11px]">
                              {course.code}
                            </span>
                            <span className="font-bold text-slate-900">{course.name}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {course.semesterName || 'Semester 1'} • {course.credits || 4} Credits • {course.syllabusName || 'Regulation 2024'}
                          </p>
                        </div>
                        <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded">
                          {course.facultyName || 'Faculty Coordinator'}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedProgramModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Curriculum Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
