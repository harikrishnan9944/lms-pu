'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  fetchProgramsAction,
  fetchSyllabusesAction,
  saveSyllabusAction,
  mapProgramSyllabusAction,
  fetchSemestersAction,
  fetchPapersAction,
  savePaperAction,
  deletePaperAction,
  fetchFacultyAssignmentsAction,
  assignFacultyToPaperAction,
  deleteFacultyAssignmentAction,
  fetchCoordinatorMetricsAction,
  fetchMappingsAction,
  saveStudentMappingAction,
  fetchPaperUnitsAction,
  savePaperUnitAction,
  fetchPaperSyllabusProgressAction,
  fetchLearningResourcesAction,
  saveLearningResourceAction,
  fetchAssignmentsAction,
  saveAssignmentAction,
  deleteAssignmentAction,
  gradeAssignmentAction,
  fetchAssessmentsAction,
  fetchAssessmentSubmissionsAction,
  fetchSchedulesAction,
  saveScheduleAction,
  deleteScheduleAction,
  fetchAttendanceRecordsAction,
  fetchDiscussionsAction,
  createDiscussionAction,
  replyToDiscussionAction,
  fetchCircularsAction,
  saveCircularAction,
  deleteCircularAction,
} from '@/app/actions/lmsActions';
import { fetchUsersAction, updateUserAction } from '@/app/actions/userActions';
import {
  ProgramItem,
  SyllabusItem,
  SemesterItem,
  PaperItem,
  FacultyAssignmentItem,
  PaperUnitItem,
  UserRecord,
  StudentMapping,
  LearningResourceItem,
  AssignmentItem,
  AssignmentType,
  AssessmentItem,
  AssessmentSubmissionItem,
  ScheduleItem,
  AttendanceRecordItem,
  ForumItem,
  CircularItem,
} from '@/lib/db';
import { UserSessionPayload } from '@/lib/auth';
import {
  FolderKanban,
  Users,
  BookOpen,
  Award,
  Plus,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Eye,
  FileText,
  UserPlus,
  Trash2,
  X,
  ChevronRight,
  GraduationCap,
  Calendar,
  BookMarked,
  ArrowRight,
  Upload,
  FileCheck,
  Edit3,
  Check,
  AlertCircle,
  File,
  FolderArchive,
  CheckSquare,
  BarChart3,
  Download,
  Video,
  ExternalLink,
  Clock,
  Home,
  MessageSquare,
  Send,
  Bell,
  User,
  Radio,
  FileCode,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';

import { Toast } from '../ui/Toast';

function exportToCsv(filename: string, rows: (string | number | boolean | null | undefined)[][]) {
  const processRow = (row: (string | number | boolean | null | undefined)[]) =>
    row
      .map((val) => {
        const text = String(val ?? '').replace(/"/g, '""');
        return `"${text}"`;
      })
      .join(',');
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface ProgramCoordinatorDashboardProps {
  user?: UserSessionPayload;
}

export function ProgramCoordinatorDashboard({ user }: ProgramCoordinatorDashboardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'papers'
    | 'assign-faculty'
    | 'syllabus'
    | 'learners'
    | 'materials'
    | 'assignments'
    | 'attendance'
    | 'assessments'
    | 'reports'
    | 'users'
    | 'students'
    | 'schedule'
    | 'discussions'
    | 'announcements'
    | 'profile'
  >('overview');

  useEffect(() => {
    if (
      tabParam &&
      [
        'overview',
        'papers',
        'assign-faculty',
        'syllabus',
        'learners',
        'materials',
        'assignments',
        'attendance',
        'assessments',
        'reports',
        'users',
        'students',
        'schedule',
        'discussions',
        'announcements',
        'profile',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  
  // Data States
  const [metrics, setMetrics] = useState({
    totalPrograms: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalSyllabuses: 0,
    totalPapers: 0,
    facultyAssignments: 0,
  });

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [syllabuses, setSyllabuses] = useState<SyllabusItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [facultyAssignments, setFacultyAssignments] = useState<FacultyAssignmentItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [studentMappings, setStudentMappings] = useState<StudentMapping[]>([]);

  // Monitoring States
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmissionItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordItem[]>([]);
  const [discussions, setDiscussions] = useState<ForumItem[]>([]);
  const [circulars, setCirculars] = useState<CircularItem[]>([]);

  // Paper Syllabus Units State
  const [selectedPaperForSyllabus, setSelectedPaperForSyllabus] = useState<PaperItem | null>(null);
  const [paperUnits, setPaperUnits] = useState<PaperUnitItem[]>([]);
  const [paperProgress, setPaperProgress] = useState<{ completedUnits: number; totalUnits: number; isFullyCompleted: boolean; statusText: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters State
  const [filterProgramId, setFilterProgramId] = useState<string>('ALL');
  const [filterSemester, setFilterSemester] = useState<string>('ALL');
  const [filterFacultyId, setFilterFacultyId] = useState<string>('ALL');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('ALL');
  const [filterCalendarYear, setFilterCalendarYear] = useState<string>('ALL');

  // Users Directory Search / Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Program Details Modal State
  const [viewProgramDetails, setViewProgramDetails] = useState<ProgramItem | null>(null);
  const [selectedAssessmentForSubmissions, setSelectedAssessmentForSubmissions] = useState<AssessmentItem | null>(null);

  // Modals & Forms State
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    paper?: PaperItem;
    facultyId: string;
    academicYear?: string;
    calendarYear?: string;
    selectedProgramId?: string;
    selectedSemester?: string;
  }>({
    open: false,
    facultyId: '',
    academicYear: '2024-2025',
    calendarYear: '2025 CY',
    selectedProgramId: 'ALL',
    selectedSemester: 'ALL',
  });

  const [paperModal, setPaperModal] = useState<{
    open: boolean;
    id: string;
    name: string;
    code: string;
    programmeId: string;
    syllabusId?: string;
    syllabusName?: string;
    semesterName: string;
    credits: number;
    academicYear?: string;
    calendarYear?: string;
  }>({
    open: false,
    id: '',
    name: '',
    code: '',
    programmeId: '',
    syllabusId: '',
    syllabusName: '',
    semesterName: 'Semester 1',
    credits: 4,
    academicYear: '2024-2025',
    calendarYear: '2025 CY',
  });

  // Schedule Modal & Filter States
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    id?: string;
    courseId: string;
    courseName: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    classType: string;
    meetingLink: string;
    status: string;
  }>({
    open: false,
    courseId: '',
    courseName: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    room: 'Virtual Classroom 1',
    classType: 'Synchronous Live Class',
    meetingLink: 'https://meet.google.com/lms-pu-live',
    status: 'Upcoming',
  });
  const [scheduleFilterCourse, setScheduleFilterCourse] = useState('ALL');
  const [scheduleFilterStatus, setScheduleFilterStatus] = useState('ALL');

  // Assignment Modal & Filter States
  const [asgModal, setAsgModal] = useState<{
    open: boolean;
    id?: string;
    title: string;
    unitNumber?: number | string;
    description: string;
    courseId: string;
    courseName: string;
    dueDate: string;
    maxMarks: number;
    instructions: string;
    attachmentUrl: string;
    assignmentType: AssignmentType;
    scheduledDate: string;
    presentationTopic: string;
  }>({
    open: false,
    title: '',
    unitNumber: 1,
    description: '',
    courseId: '',
    courseName: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 100,
    instructions: '',
    attachmentUrl: '',
    assignmentType: 'Objective',
    scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    presentationTopic: '',
  });
  const [asgFilterCourse, setAsgFilterCourse] = useState('ALL');
  const [asgFilterType, setAsgFilterType] = useState('ALL');
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState<{ open: boolean; assignment: AssignmentItem | null }>({
    open: false,
    assignment: null,
  });

  // Discussion Forum States
  const [discussionFilterCourse, setDiscussionFilterCourse] = useState('ALL');
  const [newDiscussionModal, setNewDiscussionModal] = useState<{ open: boolean; courseId: string; title: string; content: string }>({
    open: false,
    courseId: '',
    title: '',
    content: '',
  });
  const [discussionReplies, setDiscussionReplies] = useState<{ [key: string]: string }>({});

  // Announcements & Calendar States
  const [circularModal, setCircularModal] = useState<{ open: boolean; id?: string; title: string; description: string; date: string; isImportant: boolean }>({
    open: false,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isImportant: false,
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date());

  // E-Tutorial Modal & States
  const [tutorialModal, setTutorialModal] = useState<{
    open: boolean;
    title: string;
    courseId: string;
    unitNumber: number;
    fileType: string;
    fileUrl: string;
    notes: string;
  }>({
    open: false,
    title: '',
    courseId: '',
    unitNumber: 1,
    fileType: 'Video Link',
    fileUrl: '',
    notes: '',
  });
  const [tutorialCourseFilter, setTutorialCourseFilter] = useState('ALL');
  const [tutorialViewMode, setTutorialViewMode] = useState<'by-course' | 'grid'>('by-course');

  // Unit Editor Modal State
  const [unitEditModal, setUnitEditModal] = useState<{
    open: boolean;
    unitNumber: number;
    title: string;
    textContent: string;
    pdfUrl: string;
    fileUploading: boolean;
  }>({
    open: false,
    unitNumber: 1,
    title: '',
    textContent: '',
    pdfUrl: '',
    fileUploading: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        mets,
        progs,
        syls,
        sems,
        paps,
        assigns,
        usersRes,
        maps,
        resList,
        asgList,
        assList,
        subList,
        schList,
        attList,
        discList,
        circList,
      ] = await Promise.all([
        fetchCoordinatorMetricsAction(),
        fetchProgramsAction(),
        fetchSyllabusesAction(),
        fetchSemestersAction(),
        fetchPapersAction(),
        fetchFacultyAssignmentsAction(),
        fetchUsersAction({ limit: 100 }),
        fetchMappingsAction(),
        fetchLearningResourcesAction().catch(() => []),
        fetchAssignmentsAction().catch(() => []),
        fetchAssessmentsAction().catch(() => []),
        fetchAssessmentSubmissionsAction().catch(() => []),
        fetchSchedulesAction().catch(() => []),
        fetchAttendanceRecordsAction().catch(() => []),
        fetchDiscussionsAction().catch(() => []),
        fetchCircularsAction().catch(() => []),
      ]);

      setMetrics(mets);
      setPrograms(progs);
      setSyllabuses(syls);
      setSemesters(sems);
      setPapers(paps);
      setFacultyAssignments(assigns);
      setAllUsers(usersRes.users || []);
      setStudentMappings(maps.student);
      setResources(resList);
      setAssignments(asgList);
      setAssessments(assList);
      setSubmissions(subList);
      setSchedules(schList);
      setAttendanceRecords(attList);
      setDiscussions(discList);
      setCirculars(circList);

      if (progs.length > 0 && !paperModal.programmeId) {
        setPaperModal((prev) => ({ ...prev, programmeId: progs[0].id }));
      }
    } catch {
      setToast({ message: 'Failed to load programme coordinator data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter valid Teaching Staff (Faculty, Coordinators, Mentors)
  const facultyUsers = allUsers.filter(
    (u) => (u.role === 'FACULTY' || u.role === 'PROGRAM_COORDINATOR' || u.role === 'MENTOR') && u.status !== 'INACTIVE'
  );
  const studentUsers = allUsers.filter((u) => u.role === 'STUDENT' && u.status === 'ACTIVE');

  // Load Detailed Syllabus for a selected Paper
  const handleOpenSyllabusManagement = async (paper: PaperItem) => {
    setSelectedPaperForSyllabus(paper);
    setLoading(true);
    try {
      const [units, prog] = await Promise.all([
        fetchPaperUnitsAction(paper.id),
        fetchPaperSyllabusProgressAction(paper.id),
      ]);
      setPaperUnits(units);
      setPaperProgress(prog);
      setActiveTab('syllabus');
    } catch {
      setToast({ message: 'Failed to load paper syllabus units.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Faculty Assignment
  const handleAssignFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal.paper || !assignModal.facultyId) {
      setToast({ message: 'Please select a valid faculty member.', type: 'error' });
      return;
    }

    try {
      const res = await assignFacultyToPaperAction({
        facultyId: assignModal.facultyId,
        paperId: assignModal.paper.id,
        academicYear: assignModal.academicYear,
        calendarYear: assignModal.calendarYear,
      });

      if (res.success) {
        setToast({ message: 'Faculty assigned successfully.', type: 'success' });
        setAssignModal({ open: false, facultyId: '', academicYear: '2024-2025', calendarYear: '2025 CY' });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to assign faculty.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error performing faculty assignment.', type: 'error' });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const res = await deleteFacultyAssignmentAction(assignmentId);
      if (res.success) {
        setToast({ message: 'Faculty assignment removed successfully.', type: 'success' });
        loadData();
      } else {
        setToast({ message: 'Failed to remove faculty assignment.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error removing faculty assignment.', type: 'error' });
    }
  };

  // Handle Create or Edit Course
  const handleSavePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prog = programs.find((p) => p.id === paperModal.programmeId);
    if (!prog || !paperModal.name || !paperModal.code) {
      setToast({ message: 'Course Name and Course Code are required.', type: 'error' });
      return;
    }

    try {
      const res = await savePaperAction({
        id: paperModal.id || undefined,
        name: paperModal.name,
        code: paperModal.code,
        programmeId: prog.id,
        programmeName: prog.name,
        syllabusId: paperModal.syllabusId || undefined,
        syllabusName: paperModal.syllabusName || undefined,
        semesterName: paperModal.semesterName,
        credits: Number(paperModal.credits),
        academicYear: paperModal.academicYear || prog.academicYear || '2024-2025',
        calendarYear: paperModal.calendarYear || prog.calendarYear || '2025 CY',
        status: 'ACTIVE',
      });

      if (res.success) {
        setToast({ message: `Course ${paperModal.code} saved successfully.`, type: 'success' });
        setPaperModal({
          open: false,
          id: '',
          name: '',
          code: '',
          programmeId: programs[0]?.id || '',
          syllabusId: '',
          syllabusName: '',
          semesterName: 'Semester 1',
          credits: 4,
          academicYear: '2024-2025',
          calendarYear: '2025 CY',
        });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save course.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving course.', type: 'error' });
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      const res = await deletePaperAction(id);
      if (res.success) {
        setToast({ message: `Course "${name}" deleted successfully.`, type: 'success' });
        loadData();
      } else {
        setToast({ message: (res as any).error || 'Failed to delete course.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting course.', type: 'error' });
    }
  };

  // Handle Save Schedule (Live Class)
  const handleSaveScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = papers.find(p => p.id === scheduleModal.courseId) || papers[0];
    try {
      const res = await saveScheduleAction({
        id: scheduleModal.id || undefined,
        courseId: scheduleModal.courseId || crs?.id || '',
        courseName: crs ? `${crs.code} - ${crs.name}` : (scheduleModal.courseName || 'Live Session'),
        subject: scheduleModal.subject || crs?.name || 'Class Lecture',
        date: scheduleModal.date,
        startTime: scheduleModal.startTime,
        endTime: scheduleModal.endTime,
        room: scheduleModal.room || 'Virtual Classroom 1',
        facultyId: crs?.facultyId || user?.id || 'usr_prog_coord',
        facultyName: crs?.facultyName || user?.name || 'Programme Coordinator',
        classType: (scheduleModal.classType as any) || 'Online Class',
        meetingLink: scheduleModal.meetingLink || 'https://meet.google.com/lms-pu-live',
        status: scheduleModal.status as any,
      });
      if (res.success) {
        setToast({ message: 'Class schedule saved successfully.', type: 'success' });
        setScheduleModal({ ...scheduleModal, open: false, id: undefined });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save schedule.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving class schedule.', type: 'error' });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this scheduled class?')) return;
    try {
      const res = await deleteScheduleAction(id);
      if (res.success) {
        setToast({ message: 'Schedule deleted.', type: 'success' });
        loadData();
      } else {
        setToast({ message: (res as any).error || 'Failed to delete schedule.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting schedule.', type: 'error' });
    }
  };

  const handleToggleScheduleStatus = async (sch: ScheduleItem) => {
    const nextStatus = sch.status === 'Live' ? 'Completed' : 'Live';
    try {
      const res = await saveScheduleAction({
        ...sch,
        status: nextStatus as any,
      });
      if (res.success) {
        setToast({ message: `Class is now ${nextStatus}.`, type: 'success' });
        loadData();
      }
    } catch {
      setToast({ message: 'Failed to update class status.', type: 'error' });
    }
  };

  // Handle Save Assignment (Objective / Subjective / Graded Discussion)
  const handleSaveAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = papers.find(p => p.id === asgModal.courseId) || papers[0];
    try {
      const res = await saveAssignmentAction({
        id: asgModal.id || undefined,
        title: asgModal.title,
        description: asgModal.description,
        courseId: asgModal.courseId || crs?.id || '',
        courseName: crs ? `${crs.code} - ${crs.name}` : (asgModal.courseName || 'Assigned Course'),
        dueDate: asgModal.dueDate,
        maxMarks: Number(asgModal.maxMarks),
        instructions: asgModal.instructions,
        attachmentUrl: asgModal.attachmentUrl || undefined,
        assignmentType: asgModal.assignmentType,
        unitNumber: asgModal.unitNumber ? Number(asgModal.unitNumber) : 1,
        detailedDescription: asgModal.instructions,
        scheduledDate: asgModal.assignmentType === 'Graded Discussion' ? asgModal.scheduledDate : undefined,
        presentationTopic: asgModal.assignmentType === 'Graded Discussion' ? asgModal.presentationTopic : undefined,
      });
      if (res.success) {
        setToast({ message: `${asgModal.assignmentType} Assignment saved successfully.`, type: 'success' });
        setAsgModal({ ...asgModal, open: false, id: undefined });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save assignment.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving assignment.', type: 'error' });
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;
    try {
      const res = await deleteAssignmentAction(id);
      if (res.success) {
        setToast({ message: 'Assignment deleted.', type: 'success' });
        loadData();
      } else {
        setToast({ message: (res as any).error || 'Failed to delete assignment.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting assignment.', type: 'error' });
    }
  };

  // Handle Discussion Forum
  const handleCreateDiscussionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = papers.find(p => p.id === newDiscussionModal.courseId) || papers[0];
    try {
      const res = await createDiscussionAction({
        courseId: newDiscussionModal.courseId || crs?.id || '',
        courseName: crs ? `${crs.code} - ${crs.name}` : 'General Discussion',
        subject: crs?.name || 'Academic Discussion',
        title: newDiscussionModal.title,
        content: newDiscussionModal.content,
      });
      if (res.success) {
        setToast({ message: 'Discussion topic created.', type: 'success' });
        setNewDiscussionModal({ open: false, courseId: '', title: '', content: '' });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to post discussion.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error creating discussion.', type: 'error' });
    }
  };

  const handleReplyDiscussionSubmit = async (forumId: string) => {
    const text = discussionReplies[forumId];
    if (!text || !text.trim()) return;
    try {
      const res = await replyToDiscussionAction(forumId, text.trim());
      if (res.success) {
        setToast({ message: 'Reply posted.', type: 'success' });
        setDiscussionReplies({ ...discussionReplies, [forumId]: '' });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to post reply.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error posting reply.', type: 'error' });
    }
  };

  // Handle Announcements / Circulars
  const handleSaveCircularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveCircularAction({
        id: circularModal.id || undefined,
        title: circularModal.title,
        description: circularModal.description,
        date: circularModal.date,
        isImportant: circularModal.isImportant,
      });
      if (res.success) {
        setToast({ message: 'Announcement posted to calendar.', type: 'success' });
        setCircularModal({ open: false, id: undefined, title: '', description: '', date: new Date().toISOString().split('T')[0], isImportant: false });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to post announcement.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving announcement.', type: 'error' });
    }
  };

  const handleDeleteCircular = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await deleteCircularAction(id);
      if (res.success) {
        setToast({ message: 'Announcement deleted.', type: 'success' });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to delete announcement.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting announcement.', type: 'error' });
    }
  };

  // Handle Save E-Tutorial Content
  const handleSaveTutorialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = papers.find(p => p.id === tutorialModal.courseId) || papers[0];
    try {
      const res = await saveLearningResourceAction({
        title: tutorialModal.title,
        courseId: tutorialModal.courseId || crs?.id || '',
        courseName: crs ? `${crs.code} - ${crs.name}` : 'Course Tutorial',
        subject: crs?.name || 'E-Tutorial Content',
        fileType: tutorialModal.fileType as any,
        fileUrl: tutorialModal.fileUrl,
        notes: tutorialModal.notes,
        unitNumber: tutorialModal.unitNumber,
        unitName: `Unit ${tutorialModal.unitNumber}`,
      });
      if (res.success) {
        setToast({ message: 'E-Tutorial content added.', type: 'success' });
        setTutorialModal({ open: false, title: '', courseId: '', unitNumber: 1, fileType: 'Video Link', fileUrl: '', notes: '' });
        loadData();
      } else {
        setToast({ message: res.error || 'Failed to save tutorial.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving tutorial.', type: 'error' });
    }
  };

  // Handle Unit PDF File Upload
  const handleUnitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setToast({ message: 'Please upload a valid PDF document.', type: 'error' });
      return;
    }

    setUnitEditModal((prev) => ({ ...prev, fileUploading: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setUnitEditModal((prev) => ({ ...prev, pdfUrl: data.url, fileUploading: false }));
        setToast({ message: 'PDF file uploaded successfully.', type: 'success' });
      } else {
        setToast({ message: data.error || 'PDF upload failed.', type: 'error' });
        setUnitEditModal((prev) => ({ ...prev, fileUploading: false }));
      }
    } catch {
      setToast({ message: 'Upload request error.', type: 'error' });
      setUnitEditModal((prev) => ({ ...prev, fileUploading: false }));
    }
  };

  // Handle Save Unit (Text / PDF)
  const handleSaveUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaperForSyllabus) return;

    if (!unitEditModal.textContent?.trim() && !unitEditModal.pdfUrl?.trim()) {
      setToast({ message: 'Please upload a PDF or enter syllabus text.', type: 'error' });
      return;
    }

    try {
      const res = await savePaperUnitAction({
        paperId: selectedPaperForSyllabus.id,
        unitNumber: unitEditModal.unitNumber,
        title: unitEditModal.title,
        textContent: unitEditModal.textContent,
        pdfUrl: unitEditModal.pdfUrl,
      });

      if (res.success) {
        setToast({ message: `Unit ${unitEditModal.unitNumber} syllabus saved successfully.`, type: 'success' });
        setUnitEditModal({ open: false, unitNumber: 1, title: '', textContent: '', pdfUrl: '', fileUploading: false });

        // Reload units for current paper
        const [updatedUnits, updatedProg] = await Promise.all([
          fetchPaperUnitsAction(selectedPaperForSyllabus.id),
          fetchPaperSyllabusProgressAction(selectedPaperForSyllabus.id),
        ]);
        setPaperUnits(updatedUnits);
        setPaperProgress(updatedProg);
      } else {
        setToast({ message: res.error || 'Failed to save unit.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving unit content.', type: 'error' });
    }
  };

  // Filtered Users List
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Papers
  const filteredPapers = papers.filter((p) => {
    if (filterProgramId !== 'ALL' && p.programmeId !== filterProgramId) return false;
    if (filterSemester !== 'ALL' && p.semesterName !== filterSemester) return false;
    if (filterFacultyId !== 'ALL' && p.facultyId !== filterFacultyId) return false;
    if (filterAcademicYear !== 'ALL' && p.academicYear !== filterAcademicYear) return false;
    if (filterCalendarYear !== 'ALL' && p.calendarYear !== filterCalendarYear) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Programme Coordinator Home</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic & Detailed Syllabi Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Create courses, manage detailed syllabi with text & PDF content, assign courses to faculty, and oversee academic programmes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border border-slate-700"
            title="Go to Home"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setPaperModal({ open: true, id: '', name: '', code: '', programmeId: programs[0]?.id || '', semesterName: 'Semester 1', credits: 4, academicYear: '2024-2025', calendarYear: '2025 CY' })}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Course</span>
          </button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">My Programmes</span>
            <FolderKanban className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalPrograms}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-blue-600">Active Degrees</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Courses</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalPapers}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-indigo-600">Created Modules</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Faculty</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalFaculty}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-emerald-600">Available Staff</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Students</span>
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalStudents}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-purple-600">Enrolled Cohorts</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Syllabi</span>
            <BookMarked className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalSyllabuses}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-amber-600">Regulations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.facultyAssignments}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold text-teal-600">Course Mappings</p>
        </div>
      </div>

      {/* TAB 1: PROGRAM MANAGEMENT (SECTION 2 WORKFLOW) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-600" />
                <span>Program Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select an Admin-created program to inspect paper count, faculty, and syllabus status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => {
              const progPapers = papers.filter((p) => p.programmeId === prog.id);
              const progFacultyCount = new Set(progPapers.map((p) => p.facultyId).filter(Boolean)).size;

              return (
                <div key={prog.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Code: {prog.code}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">{prog.name}</h3>

                    <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-100">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Program Name:</span>
                        <strong className="text-slate-900">{prog.name}</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Papers:</span>
                        <strong className="text-indigo-700 font-extrabold">{progPapers.length}</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Faculty:</span>
                        <strong className="text-emerald-700 font-extrabold">{progFacultyCount}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewProgramDetails(prog)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Program & Manage Papers</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COURSE MANAGEMENT (SECTION 1.A & 1.B WORKFLOW) */}
      {activeTab === 'papers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Course Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage courses under respective programmes, maintain syllabus linkages, assign course coordinators, and track curriculum details.
              </p>
            </div>

            <button
              onClick={() => setPaperModal({ open: true, id: '', name: '', code: '', programmeId: programs[0]?.id || '', syllabusId: '', syllabusName: '', semesterName: 'Semester 1', credits: 4, academicYear: '2024-2025', calendarYear: '2025 CY' })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Course</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Programme</label>
              <select
                value={filterProgramId}
                onChange={(e) => setFilterProgramId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Programmes</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Course Coordinator</label>
              <select
                value={filterFacultyId}
                onChange={(e) => setFilterFacultyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Coordinators</option>
                {facultyUsers.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Academic Year</label>
              <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Calendar Year</label>
              <select
                value={filterCalendarYear}
                onChange={(e) => setFilterCalendarYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Calendar Years</option>
                <option value="2024 CY">2024 CY</option>
                <option value="2025 CY">2025 CY</option>
                <option value="2026 CY">2026 CY</option>
                <option value="2026 Jan Admission">2026 Jan Admission</option>
                <option value="2026 Jul Admission">2026 Jul Admission</option>
              </select>
            </div>
          </div>

          {/* Courses List */}
          {filteredPapers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
              No courses found matching the filter criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPapers.map((paper) => (
                <div key={paper.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-xs font-black rounded bg-slate-900 text-white font-mono">
                        {paper.code}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">{paper.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                        Credits: {paper.credits}
                      </span>
                      {paper.academicYear && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                          AY: {paper.academicYear}
                        </span>
                      )}
                      {paper.calendarYear && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                          CY: {paper.calendarYear}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-4 pt-1">
                      <span>Programme: <strong className="text-slate-700">{paper.programmeName || 'MCA'}</strong></span>
                      <span>Semester: <strong className="text-slate-700">{paper.semesterName}</strong></span>
                      <span>Syllabus: <strong className="text-amber-700">{paper.syllabusName || 'Regulation 2024'}</strong></span>
                      <span>Course Coordinator: <strong className={paper.facultyName ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>{paper.facultyName || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleOpenSyllabusManagement(paper)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <BookMarked className="w-4 h-4" />
                      <span>Manage Detailed Syllabus</span>
                    </button>

                    <button
                      onClick={() =>
                        setAssignModal({
                          open: true,
                          paper,
                          facultyId: paper.facultyId || (facultyUsers[0]?.id || ''),
                          selectedProgramId: paper.programmeId,
                          selectedSemester: paper.semesterName,
                          academicYear: paper.academicYear || '2024-2025',
                          calendarYear: paper.calendarYear || '2025 CY',
                        })
                      }
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{paper.facultyName ? 'Change Coordinator' : 'Assign Coordinator'}</span>
                    </button>

                    <button
                      onClick={() => setPaperModal({ open: true, id: paper.id, name: paper.name, code: paper.code, programmeId: paper.programmeId, syllabusId: paper.syllabusId || '', syllabusName: paper.syllabusName || '', semesterName: paper.semesterName, credits: paper.credits, academicYear: paper.academicYear || '2024-2025', calendarYear: paper.calendarYear || '2025 CY' })}
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
                      title="Edit Course"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(paper.id, paper.name)}
                      className="p-2 border border-rose-200 hover:bg-rose-50 rounded-xl text-rose-600 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DETAILED SYLLABUS MANAGEMENT (SECTION 3, 4, 5, 6 WORKFLOW) */}
      {activeTab === 'syllabus' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          {!selectedPaperForSyllabus ? (
            <div className="p-8 text-center space-y-4">
              <BookMarked className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Select a Paper to Manage its Detailed Syllabus</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Choose a paper from the list below to edit its 5 Units, upload unit PDF documents, or enter text content.
              </p>
              <div className="max-w-md mx-auto space-y-2 pt-2">
                {papers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleOpenSyllabusManagement(p)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-left hover:bg-amber-50 hover:border-amber-300 flex justify-between items-center transition-colors"
                  >
                    <span>{p.code} - {p.name} ({p.semesterName})</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Paper Syllabus Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <button
                    onClick={() => setSelectedPaperForSyllabus(null)}
                    className="text-xs text-amber-700 font-bold hover:underline mb-1 flex items-center gap-1"
                  >
                    ← Select Different Paper
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-black rounded bg-slate-900 text-white font-mono">
                      {selectedPaperForSyllabus.code}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedPaperForSyllabus.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Program: {selectedPaperForSyllabus.programmeName} • Semester: {selectedPaperForSyllabus.semesterName}
                  </p>
                </div>

                {/* SECTION 6 & 13: Progress Indicator */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Syllabus Progress</span>
                  <div className="text-lg font-black text-amber-700">
                    {paperProgress?.statusText || '0 / 5 Units Completed'}
                  </div>
                  <div className="w-36 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((paperProgress?.completedUnits || 0) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 & 6: EXACTLY 5 UNITS ACCORDION / CARD LAYOUT */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base">Units Breakdown (Exactly 5 Units)</h3>

                {paperUnits.map((unit) => (
                  <div
                    key={unit.unitNumber}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                      <div>
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded uppercase bg-slate-900 text-white font-mono">
                          UNIT {unit.unitNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">{unit.title}</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Tags */}
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${
                            unit.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : unit.status === 'PDF Uploaded'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : unit.status === 'Text Added'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {unit.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                          {unit.status === 'PDF Uploaded' && <File className="w-3.5 h-3.5" />}
                          {unit.status === 'Text Added' && <FileText className="w-3.5 h-3.5" />}
                          <span>{unit.status}</span>
                        </span>

                        <button
                          onClick={() => setUnitEditModal({
                            open: true,
                            unitNumber: unit.unitNumber,
                            title: unit.title,
                            textContent: unit.textContent || '',
                            pdfUrl: unit.pdfUrl || '',
                            fileUploading: false,
                          })}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          Edit Unit
                        </button>
                      </div>
                    </div>

                    {/* Content Previews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Syllabus Text Content:</span>
                        {unit.textContent ? (
                          <p className="text-slate-700 whitespace-pre-wrap line-clamp-3">{unit.textContent}</p>
                        ) : (
                          <span className="text-slate-400 italic">No text content added yet.</span>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Uploaded PDF Document:</span>
                        {unit.pdfUrl ? (
                          <a
                            href={unit.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-700 font-bold hover:underline pt-1"
                          >
                            <File className="w-4 h-4 text-indigo-600" />
                            <span>View / Download PDF Document</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No PDF uploaded yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: DEDICATED ASSIGN FACULTY MANAGEMENT */}
      {activeTab === 'assign-faculty' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Assign Faculty to Program & Papers</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage which faculty member teaches which program paper. Assign, reassign, or remove faculty mappings.
              </p>
            </div>

            <button
              onClick={() =>
                setAssignModal({
                  open: true,
                  paper: undefined,
                  facultyId: '',
                  selectedProgramId: filterProgramId !== 'ALL' ? filterProgramId : 'ALL',
                  selectedSemester: filterSemester !== 'ALL' ? filterSemester : 'ALL',
                  academicYear: filterAcademicYear !== 'ALL' ? filterAcademicYear : '2024-2025',
                  calendarYear: filterCalendarYear !== 'ALL' ? filterCalendarYear : '2025 CY',
                })
              }
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Assign Faculty to Paper</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Program</label>
              <select
                value={filterProgramId}
                onChange={(e) => setFilterProgramId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Faculty</label>
              <select
                value={filterFacultyId}
                onChange={(e) => setFilterFacultyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Faculty</option>
                {facultyUsers.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Academic Year</label>
              <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Academic Years</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Calendar Year</label>
              <select
                value={filterCalendarYear}
                onChange={(e) => setFilterCalendarYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Calendar Years</option>
                <option value="2024 CY">2024 CY</option>
                <option value="2025 CY">2025 CY</option>
                <option value="2026 CY">2026 CY</option>
                <option value="2026 Jan Admission">2026 Jan Admission</option>
                <option value="2026 Jul Admission">2026 Jul Admission</option>
              </select>
            </div>
          </div>

          {/* Table of Papers & Faculty Assignments */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Paper Code & Name</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Assigned Faculty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                      No papers found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPapers.map((paper) => {
                    const assignment = facultyAssignments.find((fa) => fa.paperId === paper.id);
                    const assignedFaculty = facultyUsers.find((f) => f.id === (paper.facultyId || assignment?.facultyId));

                    return (
                      <tr key={paper.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-slate-900 text-white rounded">
                                {paper.code}
                              </span>
                              <span>{paper.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-normal">
                              {paper.academicYear && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-200">
                                  AY: {paper.academicYear}
                                </span>
                              )}
                              {paper.calendarYear && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                  CY: {paper.calendarYear}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-medium">
                          {paper.programmeName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium">
                          {paper.semesterName}
                        </td>
                        <td className="px-4 py-3.5">
                          {assignedFaculty || paper.facultyName ? (
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                                {(assignedFaculty?.name || paper.facultyName || 'F')[0].toUpperCase()}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{assignedFaculty?.name || paper.facultyName}</p>
                                <p className="text-[10px] text-slate-400">{assignedFaculty?.email || 'Faculty Member'}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setAssignModal({
                                  open: true,
                                  paper,
                                  facultyId: paper.facultyId || assignment?.facultyId || '',
                                  selectedProgramId: paper.programmeId,
                                  selectedSemester: paper.semesterName,
                                  academicYear: paper.academicYear || assignment?.academicYear || '2024-2025',
                                  calendarYear: paper.calendarYear || assignment?.calendarYear || '2025 CY',
                                })
                              }
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{paper.facultyId || assignment?.facultyId ? 'Change Faculty' : 'Assign Faculty'}</span>
                            </button>

                            {assignment?.id && (
                              <button
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                                title="Remove Assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Admin Created Users Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View users created by Admin (Students, Faculty, Coordinators).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
              >
                <option value="ALL">All Roles</option>
                <option value="FACULTY">Faculty</option>
                <option value="STUDENT">Students</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Program / Department</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3.5 font-bold">{u.role}</td>
                    <td className="px-4 py-3.5">{u.programme || u.subject || 'General'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT SEMESTER & PROGRAM ROSTER */}
      {(activeTab === 'students' || activeTab === 'learners') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Student Semester & Program Roster Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View student cohorts by Program & Semester, manage enrollments, and execute semester promotions.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Program</label>
              <select
                value={filterProgramId}
                onChange={(e) => setFilterProgramId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold text-slate-800"
              >
                <option value="ALL">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold text-slate-800"
              >
                <option value="ALL">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Search Student</label>
              <input
                type="text"
                placeholder="Search name, reg no, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Student Cohort Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Register / Student ID</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Current Semester</th>
                  <th className="px-4 py-3">Contact Email</th>
                  <th className="px-4 py-3 text-right">Semester Promotion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentUsers
                  .filter((st) => {
                    if (filterProgramId !== 'ALL' && st.programme !== filterProgramId) return false;
                    if (filterSemester !== 'ALL' && (st.semester || 'Semester 1') !== filterSemester) return false;
                    if (userSearch.trim()) {
                      const q = userSearch.toLowerCase();
                      const matchName = st.name.toLowerCase().includes(q);
                      const matchEmail = st.email.toLowerCase().includes(q);
                      const matchId = st.studentId?.toLowerCase().includes(q);
                      if (!matchName && !matchEmail && !matchId) return false;
                    }
                    return true;
                  })
                  .map((st) => {
                    const currentSemNum = parseInt((st.semester || 'Semester 1').replace(/[^0-9]/g, '')) || 1;
                    const nextSemStr = `Semester ${currentSemNum + 1}`;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-black flex items-center justify-center text-xs">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{st.name}</p>
                              <p className="text-[10px] text-slate-400">@{st.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                          {st.studentId || 'PU2026MCA101'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {st.programme || 'MCA'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 text-[11px] font-bold text-purple-800 bg-purple-50 rounded-full border border-purple-200">
                            {st.semester || 'Semester 1'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono">
                          {st.email}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                const res = await updateUserAction(st.id, {
                                  name: st.name,
                                  email: st.email,
                                  username: st.username,
                                  role: st.role,
                                  status: st.status,
                                  programme: st.programme || 'MCA',
                                  semester: nextSemStr,
                                  studentId: st.studentId || undefined,
                                  mobile: st.mobile || undefined,
                                });
                                if (res.success) {
                                  setToast({ message: `Promoted ${st.name} to ${nextSemStr}!`, type: 'success' });
                                  loadData();
                                } else {
                                  setToast({ message: res.error || 'Failed to promote semester.', type: 'error' });
                                }
                              }}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Promote to {nextSemStr}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: E-TUTORIAL (SECTION 1.G WORKFLOW) */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-sky-600" />
                <span>E-Tutorial & Course Learning Content</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Organized educational tutorial content, video lectures, and learning resources categorized course-wise.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded-full border border-sky-200">
                {resources.length} Total Tutorials
              </span>
              <button
                onClick={() => setTutorialModal({ open: true, title: '', courseId: papers[0]?.id || '', unitNumber: 1, fileType: 'Video Link', fileUrl: '', notes: '' })}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add E-Tutorial</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Tutorials</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{resources.length}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Video Lectures</span>
              <p className="text-2xl font-black text-rose-900 mt-1">
                {resources.filter(r => r.fileType === 'Video Link').length}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Tutorial PDFs / Docs</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">
                {resources.filter(r => r.fileType === 'PDF' || r.fileType === 'Document').length}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Courses Covered</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {new Set(resources.map(r => r.paperId || r.courseId)).size}
              </p>
            </div>
          </div>

          {/* Filter Bar & View Mode */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto flex-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Course</label>
                <select
                  value={tutorialCourseFilter}
                  onChange={(e) => setTutorialCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                >
                  <option value="ALL">All Courses</option>
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Content Type</label>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                >
                  <option value="ALL">All Content Types</option>
                  <option value="Video Link">Video Lectures</option>
                  <option value="PDF">PDF Tutorials</option>
                  <option value="Document">Word Documents</option>
                  <option value="Notes">Lecture Notes</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Search Tutorials</label>
                <input
                  type="text"
                  placeholder="Search title, course..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                onClick={() => setTutorialViewMode('by-course')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tutorialViewMode === 'by-course'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Course-wise View
              </button>
              <button
                onClick={() => setTutorialViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tutorialViewMode === 'grid'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All List View
              </button>
            </div>
          </div>

          {/* COURSE-WISE TUTORIAL VIEW */}
          {tutorialViewMode === 'by-course' && (
            <div className="space-y-6">
              {papers
                .filter(p => tutorialCourseFilter === 'ALL' || p.id === tutorialCourseFilter)
                .map((course) => {
                  const courseRes = resources.filter(r => (r.courseId === course.id || r.paperId === course.id));
                  return (
                    <div key={course.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-mono font-black bg-slate-900 text-white rounded">
                              {course.code}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base">{course.name}</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Programme: {course.programmeName || 'MCA'} • {course.semesterName} • Coordinator: {course.facultyName || 'Faculty Member'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-white text-slate-700 rounded-lg border border-slate-200">
                          {courseRes.length} Tutorials Available
                        </span>
                      </div>

                      {courseRes.length === 0 ? (
                        <div className="p-6 text-center bg-white rounded-xl border border-dashed text-slate-400 text-xs">
                          No e-tutorials uploaded yet for {course.name}.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {courseRes.map((r) => (
                            <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    r.fileType === 'Video Link' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                                  }`}>
                                    {r.unitName || `Unit ${r.unitNumber || 1}`} • {r.fileType}
                                  </span>
                                  {r.fileType === 'Video Link' && <Video className="w-4 h-4 text-rose-600 shrink-0" />}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                                {r.notes && <p className="text-xs text-slate-500 line-clamp-2">{r.notes}</p>}
                              </div>
                              <a
                                href={r.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{r.fileType === 'Video Link' ? 'Watch Tutorial' : 'View Tutorial File'}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* ALL LIST VIEW */}
          {tutorialViewMode === 'grid' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tutorial Title</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Access Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resources
                    .filter((r) => {
                      if (tutorialCourseFilter !== 'ALL' && (r.courseId !== tutorialCourseFilter && r.paperId !== tutorialCourseFilter)) return false;
                      if (userRoleFilter !== 'ALL' && r.fileType !== userRoleFilter) return false;
                      if (userSearch.trim()) {
                        const q = userSearch.toLowerCase();
                        const matchTitle = r.title.toLowerCase().includes(q);
                        const matchCourse = (r.courseName || r.paperName || '').toLowerCase().includes(q);
                        if (!matchTitle && !matchCourse) return false;
                      }
                      return true;
                    })
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{r.title}</p>
                          {r.notes && <p className="text-[10px] text-slate-400 truncate max-w-xs">{r.notes}</p>}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">
                          {r.paperName || r.courseName || 'Course Paper'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600">
                          {r.unitName || `Unit ${r.unitNumber || 1}`}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.fileType === 'Video Link'
                                ? 'bg-rose-100 text-rose-800'
                                : r.fileType === 'PDF'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {r.fileType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Access Tutorial</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  {resources.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No tutorial content uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: CLASS SCHEDULE (SECTION 1.C WORKFLOW) */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <span>Class Schedule & Synchronous Live Classes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Schedule synchronous live lectures, interactive sessions, and virtual classrooms with automated student portal access.
              </p>
            </div>
            <button
              onClick={() => setScheduleModal({
                open: true,
                courseId: papers[0]?.id || '',
                courseName: papers[0]?.name || '',
                subject: 'Live Lecture & Discussion',
                date: new Date().toISOString().split('T')[0],
                startTime: '10:00 AM',
                endTime: '11:30 AM',
                room: 'Virtual Classroom 1',
                classType: 'Synchronous Live Class',
                meetingLink: 'https://meet.google.com/lms-pu-live',
                status: 'Upcoming',
              })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Live Class</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Scheduled</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{schedules.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Live Now</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {schedules.filter(s => s.status === 'Live').length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Upcoming</span>
              <p className="text-2xl font-black text-blue-900 mt-1">
                {schedules.filter(s => s.status === 'Upcoming').length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase">Completed</span>
              <p className="text-2xl font-black text-purple-900 mt-1">
                {schedules.filter(s => s.status === 'Completed').length}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Course</label>
              <select
                value={scheduleFilterCourse}
                onChange={(e) => setScheduleFilterCourse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Courses</option>
                {papers.map((p) => (
                  <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status Filter</label>
              <select
                value={scheduleFilterStatus}
                onChange={(e) => setScheduleFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Live">Live Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            {schedules
              .filter((sch) => {
                if (scheduleFilterCourse !== 'ALL' && !sch.courseName.includes(scheduleFilterCourse)) return false;
                if (scheduleFilterStatus !== 'ALL' && sch.status !== scheduleFilterStatus) return false;
                return true;
              })
              .map((sch) => (
                <div key={sch.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                        sch.status === 'Live'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                          : sch.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {sch.status === 'Live' && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />}
                        {sch.status}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-mono">
                        {sch.classType}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">{sch.courseName}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Topic / Subject: <strong>{sch.subject}</strong></p>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-4 pt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {sch.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {sch.startTime} - {sch.endTime}</span>
                      <span>Platform: <strong className="text-slate-700">{sch.room}</strong></span>
                      <span>Faculty: <strong className="text-slate-700">{sch.facultyName}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {sch.meetingLink && (
                      <a
                        href={sch.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Live Class</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleToggleScheduleStatus(sch)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        sch.status === 'Live'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                      }`}
                    >
                      {sch.status === 'Live' ? 'Mark Completed' : 'Go Live'}
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(sch.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      title="Cancel Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            {schedules.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
                No classes scheduled currently. Click &quot;Schedule Live Class&quot; to organize a synchronous session.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ASSIGNMENT MANAGEMENT (SECTION 1.D WORKFLOW - 3 ASSIGNMENT TYPES) */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <span>Assignment Management & Evaluation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Administer 3 assignment categories: Objective Assignments, Subjective Assignments, and Graded Discussions with scheduling & presentation support.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
                {assignments.length} Total Assignments
              </span>
              <button
                onClick={() => setAsgModal({
                  open: true,
                  title: '',
                  description: '',
                  courseId: papers[0]?.id || '',
                  courseName: papers[0]?.name || '',
                  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  maxMarks: 100,
                  instructions: '',
                  attachmentUrl: '',
                  assignmentType: 'Objective',
                  scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
                  presentationTopic: '',
                })}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Assignment</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Objective Assignments</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">
                {assignments.filter(a => (a.assignmentType || 'Subjective') === 'Objective').length}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Subjective Assignments</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {assignments.filter(a => (a.assignmentType || 'Subjective') === 'Subjective').length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase">Graded Discussions</span>
              <p className="text-2xl font-black text-purple-900 mt-1">
                {assignments.filter(a => a.assignmentType === 'Graded Discussion').length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Total Submissions</span>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0)}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter Course</label>
              <select
                value={asgFilterCourse}
                onChange={(e) => setAsgFilterCourse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All Courses</option>
                {papers.map((p) => (
                  <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assignment Type</label>
              <select
                value={asgFilterType}
                onChange={(e) => setAsgFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
              >
                <option value="ALL">All 3 Categories</option>
                <option value="Objective">1. Objective Assignments</option>
                <option value="Subjective">2. Subjective Assignments</option>
                <option value="Graded Discussion">3. Graded Discussions</option>
              </select>
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {assignments
              .filter((a) => {
                if (asgFilterCourse !== 'ALL' && !a.courseName.includes(asgFilterCourse)) return false;
                if (asgFilterType !== 'ALL' && (a.assignmentType || 'Subjective') !== asgFilterType) return false;
                return true;
              })
              .map((asg) => {
                const subCount = asg.submissions?.length || 0;
                const asgType = asg.assignmentType || 'Subjective';

                return (
                  <div key={asg.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            asgType === 'Objective'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : asgType === 'Graded Discussion'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {asgType === 'Objective' && 'Objective Assignment'}
                            {asgType === 'Subjective' && 'Subjective Assignment'}
                            {asgType === 'Graded Discussion' && 'Graded Discussion & Presentation'}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base">{asg.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          Course: <strong className="text-slate-800">{asg.courseName}</strong> • Due Date: <strong className="text-slate-800">{asg.dueDate}</strong> • Max Marks: <strong className="text-indigo-700">{asg.maxMarks}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewSubmissionsModal({ open: true, assignment: asg })}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Submissions ({subCount})</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description & Graded Discussion Details */}
                    <div className="text-xs text-slate-600 space-y-2">
                      {asg.description && <p>{asg.description}</p>}

                      {asgType === 'Graded Discussion' && (
                        <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200 space-y-1.5">
                          <div className="flex items-center gap-2 text-purple-900 font-bold">
                            <CalendarDays className="w-4 h-4 text-purple-600" />
                            <span>Scheduled Discussion Session: {asg.scheduledDate || asg.dueDate}</span>
                          </div>
                          {asg.presentationTopic && (
                            <p className="text-purple-800">
                              <strong>Presentation Topic:</strong> {asg.presentationTopic}
                            </p>
                          )}
                          <p className="text-purple-700 text-[11px]">
                            Students participate in the discussion forum or live scheduled presentation session as part of this assignment.
                          </p>
                        </div>
                      )}

                      {asg.instructions && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Instructions / Rubric:</span>
                          <p className="whitespace-pre-wrap">{asg.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {assignments.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
                No assignments recorded. Click &quot;+ Create Assignment&quot; to rollout an objective, subjective, or graded discussion.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RESOURCE INTERACTION & DISCUSSION FORUM (SECTION 1.E WORKFLOW) */}
      {activeTab === 'discussions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Resource Interaction & Discussion Forum</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Collaborative interaction between students, course coordinators, and programme coordinators regarding learning resources and coursework.
              </p>
            </div>
            <button
              onClick={() => setNewDiscussionModal({ open: true, courseId: papers[0]?.id || '', title: '', content: '' })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Start Discussion Topic</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter by Course</label>
            <select
              value={discussionFilterCourse}
              onChange={(e) => setDiscussionFilterCourse(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium"
            >
              <option value="ALL">All Courses</option>
              {papers.map((p) => (
                <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          {/* Discussion Threads */}
          <div className="space-y-4">
            {discussions
              .filter((d) => discussionFilterCourse === 'ALL' || d.courseName.includes(discussionFilterCourse))
              .map((disc) => (
                <div key={disc.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm">
                  <div className="flex justify-between items-start gap-3 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white rounded">
                          {disc.courseName}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base">{disc.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Posted by <strong className="text-slate-700">{disc.authorName}</strong> ({disc.authorRole}) • {disc.createdAt}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{disc.content}</p>

                  {/* Replies */}
                  {disc.replies && disc.replies.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Responses ({disc.replies.length}):</span>
                      {disc.replies.map((rep) => (
                        <div key={rep.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                          <div className="flex justify-between items-center text-slate-500">
                            <span className="font-bold text-slate-800">{rep.authorName} ({rep.authorRole})</span>
                            <span className="text-[10px]">{rep.createdAt}</span>
                          </div>
                          <p className="text-slate-700">{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write an academic response or guidance..."
                      value={discussionReplies[disc.id] || ''}
                      onChange={(e) => setDiscussionReplies({ ...discussionReplies, [disc.id]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white"
                    />
                    <button
                      onClick={() => handleReplyDiscussionSubmit(disc.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            {discussions.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
                No discussions initiated yet. Click &quot;+ Start Discussion Topic&quot; to open an academic dialogue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ANNOUNCEMENTS & ACADEMIC CALENDAR (SECTION 1.F WORKFLOW) */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Announcements & Academic Calendar Integration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Display university announcements as calendar events, review upcoming academic deadlines, and schedule notices.
              </p>
            </div>
            <button
              onClick={() => setCircularModal({
                open: true,
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                isImportant: true,
              })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Announcement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* INTERACTIVE CALENDAR (2 Columns) */}
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>
                    {calendarMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const d = new Date(calendarMonthDate);
                      d.setMonth(d.getMonth() - 1);
                      setCalendarMonthDate(d);
                    }}
                    className="p-1.5 rounded-lg border bg-white hover:bg-slate-100 text-xs font-bold"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCalendarMonthDate(new Date())}
                    className="px-2.5 py-1 rounded-lg border bg-white hover:bg-slate-100 text-xs font-bold"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date(calendarMonthDate);
                      d.setMonth(d.getMonth() + 1);
                      setCalendarMonthDate(d);
                    }}
                    className="p-1.5 rounded-lg border bg-white hover:bg-slate-100 text-xs font-bold"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {(() => {
                  const year = calendarMonthDate.getFullYear();
                  const month = calendarMonthDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  // Empty pads
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<div key={`pad-${i}`} className="h-16 rounded-xl bg-slate-100/50" />);
                  }

                  // Days
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAnnouncements = circulars.filter(c => c.date === dateStr);
                    const dayClasses = schedules.filter(s => s.date === dateStr);
                    const dayAsgs = assignments.filter(a => a.dueDate === dateStr);
                    const isSelected = selectedCalendarDate === dateStr;
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    cells.push(
                      <div
                        key={dateStr}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`h-16 p-1.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105 z-10'
                            : isToday
                            ? 'bg-amber-50 border-amber-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{day}</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {dayAnnouncements.length > 0 && (
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} title="Announcement" />
                          )}
                          {dayClasses.length > 0 && (
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-300' : 'bg-sky-500'}`} title="Live Class" />
                          )}
                          {dayAsgs.length > 0 && (
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-300' : 'bg-purple-500'}`} title="Assignment Due" />
                          )}
                        </div>
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 pt-2 border-t">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Announcement</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Live Class</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Assignment Due</span>
              </div>
            </div>

            {/* EVENTS FOR SELECTED DATE (1 Column) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm border-b pb-2">
                  Activities on: <span className="text-indigo-600">{selectedCalendarDate}</span>
                </h4>

                <div className="space-y-3 pt-3">
                  {/* Selected Day Announcements */}
                  {circulars.filter(c => c.date === selectedCalendarDate).map(c => (
                    <div key={c.id} className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">{c.title}</span>
                        {c.isImportant && <span className="px-1.5 py-0.2 text-[9px] bg-rose-600 text-white rounded font-bold">Important</span>}
                      </div>
                      <p className="text-amber-800 text-[11px]">{c.description}</p>
                    </div>
                  ))}

                  {/* Selected Day Classes */}
                  {schedules.filter(s => s.date === selectedCalendarDate).map(s => (
                    <div key={s.id} className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 text-xs space-y-1">
                      <span className="font-bold text-sky-900">{s.courseName}</span>
                      <p className="text-sky-800 text-[11px]">{s.startTime} - {s.endTime} • {s.subject}</p>
                    </div>
                  ))}

                  {/* Selected Day Assignments */}
                  {assignments.filter(a => a.dueDate === selectedCalendarDate).map(a => (
                    <div key={a.id} className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs space-y-1">
                      <span className="font-bold text-purple-900">Assignment: {a.title}</span>
                      <p className="text-purple-800 text-[11px]">Due for {a.courseName}</p>
                    </div>
                  ))}

                  {circulars.filter(c => c.date === selectedCalendarDate).length === 0 &&
                   schedules.filter(s => s.date === selectedCalendarDate).length === 0 &&
                   assignments.filter(a => a.dueDate === selectedCalendarDate).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-6 text-center">
                      No activities or announcements scheduled for this date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Table */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-extrabold text-slate-900 text-sm">All Published Announcements</h3>
            <div className="space-y-3">
              {circulars.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {c.isImportant && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded">
                          Important Notice
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      <span className="text-xs text-slate-400">• Date: {c.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{c.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCircular(c.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROGRAMME COORDINATOR PROFILE (SECTION 1.H WORKFLOW) */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-4xl shadow-sm">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Programme Coordinator Profile</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official academic credentials, designated university programmes, and contact details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-700 to-sky-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0">
              {(user?.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{user?.name || 'Programme Coordinator'}</h3>
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0">
                  Programme Coordinator
                </span>
              </div>
              <p className="text-xs text-slate-500">{user?.email || 'coordinator@periyaruniversity.ac.in'}</p>
              <p className="text-xs font-medium text-slate-600 pt-1">
                Centre for Distance and Online Education • Periyar University
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Academic Credentials</span>
              <p><strong>Qualification:</strong> Ph.D. in Computer Science</p>
              <p><strong>Designation:</strong> Senior Programme Coordinator</p>
              <p><strong>Department:</strong> Department of Computer Science & Applications</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Account Authentication Details</span>
              <p><strong>Username:</strong> @{user?.username || 'coordinator'}</p>
              <p><strong>User ID:</strong> <span className="font-mono text-slate-600">{user?.id || 'usr_prog_coord'}</span></p>
              <p><strong>Account Status:</strong> <span className="text-emerald-700 font-bold">ACTIVE</span></p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px] block">Assigned Academic Programmes</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {programs.map((p) => (
                <span key={p.id} className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800">
                  {p.code} - {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE & PARTICIPATION MONITORING */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Attendance Verification</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Monitor student attendance logs, lecture sessions, and student participation rates.
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-xs rounded-full border border-teal-200">
              {attendanceRecords.length} Attendance Logs
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sessions Scheduled</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{schedules.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Present Marks</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {attendanceRecords.filter(a => a.status === 'Present').length}
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Absent Marks</span>
              <p className="text-2xl font-black text-rose-900 mt-1">
                {attendanceRecords.filter(a => a.status === 'Absent').length}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Attendance Rate</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">
                {attendanceRecords.length > 0
                  ? Math.round((attendanceRecords.filter(a => a.status === 'Present').length / attendanceRecords.length) * 100)
                  : 100}%
              </p>
            </div>
          </div>

          {/* Section: Scheduled Lectures & Timetable */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Lecture Timetable & Scheduled Sessions</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Course / Subject</th>
                    <th className="px-4 py-2.5">Faculty</th>
                    <th className="px-4 py-2.5">Date & Time</th>
                    <th className="px-4 py-2.5">Class Type</th>
                    <th className="px-4 py-2.5">Room / Meeting</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">{sch.courseName || sch.subject}</td>
                      <td className="px-4 py-3 text-slate-700">{sch.facultyName}</td>
                      <td className="px-4 py-3 text-slate-500">{sch.date} ({sch.startTime} - {sch.endTime})</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[10px]">
                          {sch.classType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sch.meetingLink ? (
                          <a href={sch.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-medium">
                            Join Link
                          </a>
                        ) : (
                          sch.room || 'Main Hall'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sch.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {sch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No lecture sessions scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Student Attendance Logs */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Student Attendance Logs</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5">Student ID</th>
                    <th className="px-4 py-2.5">Course / Paper</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Attendance Status</th>
                    <th className="px-4 py-2.5 text-right">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.slice(0, 50).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-slate-900">{att.studentName}</td>
                      <td className="px-4 py-3 font-mono text-indigo-700">{att.studentId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{att.courseName}</td>
                      <td className="px-4 py-3 text-slate-500">{att.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : att.status === 'Late'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-medium">
                        {att.recordedBy || 'Faculty'}
                      </td>
                    </tr>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No student attendance records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INTERNAL ASSESSMENT MANAGEMENT */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span>Internal Marks Verification</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Oversee quiz/MCQ internal assessments created by faculty, monitor published status and student scores.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
              {assessments.length} Total Assessments
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Quizzes</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{assessments.length}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Published</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {assessments.filter(a => a.isPublished).length}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Student Submissions</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{submissions.length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase">Average Score</span>
              <p className="text-2xl font-black text-purple-900 mt-1">
                {submissions.length > 0
                  ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / submissions.length)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Assessments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Assessment Title</th>
                  <th className="px-4 py-3">Paper / Course</th>
                  <th className="px-4 py-3">Duration & Marks</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submissions</th>
                  <th className="px-4 py-3 text-right">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((ass) => {
                  let questionCount = 0;
                  try {
                    const parsed = JSON.parse(ass.questions || '[]');
                    questionCount = Array.isArray(parsed) ? parsed.length : 0;
                  } catch {
                    questionCount = 0;
                  }
                  const assSubmissions = submissions.filter(s => s.assessmentId === ass.id);

                  return (
                    <tr key={ass.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{ass.title}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{ass.description}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {ass.paperCode ? `${ass.paperCode} - ${ass.courseName}` : ass.courseName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="font-semibold">{ass.duration}</span> • Max Marks: {ass.maxMarks}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-indigo-700">
                        {questionCount} MCQs
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ass.isPublished
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ass.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {assSubmissions.length} Submissions
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedAssessmentForSubmissions(ass)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Submissions</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No internal assessments created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROGRAMME REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Programme Academic Reports & Analytics</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consolidated programme reports, syllabus status, faculty distribution, and export capabilities.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const rows = [
                    ['Paper Code', 'Paper Name', 'Programme', 'Semester', 'Faculty Assigned', 'Detailed Syllabus Ready'],
                    ...papers.map(p => [
                      p.code,
                      p.name,
                      p.programmeName,
                      p.semesterName,
                      p.facultyName || 'Unassigned',
                      (p.units?.length || 0) >= 5 ? 'Completed (5 Units)' : `${p.units?.length || 0}/5 Units`,
                    ]),
                  ];
                  exportToCsv('programme_papers_syllabus_report.csv', rows);
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Papers Report</span>
              </button>

              <button
                onClick={() => {
                  const rows = [
                    ['Faculty Name', 'Email', 'Assigned Paper Code', 'Assigned Paper Name', 'Programme', 'Academic Year'],
                    ...facultyAssignments.map(f => [
                      f.facultyName,
                      f.facultyEmail || allUsers.find(u => u.id === f.facultyId)?.email || 'N/A',
                      f.paperCode,
                      f.paperName,
                      f.programmeName,
                      f.academicYear,
                    ]),
                  ];
                  exportToCsv('faculty_allocations_report.csv', rows);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Faculty Allocations</span>
              </button>

              <button
                onClick={() => {
                  const rows = [
                    ['Assessment ID', 'Assessment Title', 'Student Name', 'Student ID', 'Score', 'Max Marks', 'Percentage', 'Submitted At'],
                    ...submissions.map(s => {
                      const parentAss = assessments.find(a => a.id === s.assessmentId);
                      return [
                        s.assessmentId,
                        parentAss?.title || 'Assessment',
                        s.studentName,
                        s.studentId,
                        s.score,
                        s.maxMarks,
                        `${s.percentage}%`,
                        s.submittedAt,
                      ];
                    }),
                  ];
                  exportToCsv('internal_assessment_results.csv', rows);
                }}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Results</span>
              </button>
            </div>
          </div>

          {/* Consolidated Analytics Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Syllabus Completeness */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-600" />
                  <span>Detailed Syllabus Completeness</span>
                </h3>
                <span className="text-xs font-bold text-indigo-700 font-mono">
                  {papers.filter(p => (p.units?.length || 0) >= 5).length} / {papers.length} Papers Complete
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${papers.length > 0 ? (papers.filter(p => (p.units?.length || 0) >= 5).length / papers.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Coordinators can inspect and edit all five units for each paper with both PDF upload and text syllabus entry.
              </p>
            </div>

            {/* Card 2: Faculty Coverage */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Faculty Allocation Coverage</span>
                </h3>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {papers.filter(p => p.facultyId).length} / {papers.length} Papers Assigned
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${papers.length > 0 ? (papers.filter(p => p.facultyId).length / papers.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {papers.filter(p => !p.facultyId).length} papers currently unallocated. Faculty members can access only their assigned papers.
              </p>
            </div>
          </div>

          {/* Assessment Performance Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Assessment & Academic Performance Summary</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Total Quiz Submissions</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{submissions.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-700">Passed Submissions (&gt;=40%)</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  {submissions.filter(s => s.percentage >= 40).length}
                </p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl">
                <p className="text-xs text-rose-700">Failed / Needs Retake</p>
                <p className="text-2xl font-black text-rose-900 mt-1">
                  {submissions.filter(s => s.percentage < 40).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4 & 5: UNIT EDIT MODAL (TWO INPUT METHODS: PDF UPLOAD & TEXT CONTENT) */}
      {unitEditModal.open && selectedPaperForSyllabus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setUnitEditModal({ ...unitEditModal, open: false })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-black rounded uppercase bg-slate-900 text-white font-mono">
                UNIT {unitEditModal.unitNumber}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Edit Syllabus - {selectedPaperForSyllabus.code} ({selectedPaperForSyllabus.name})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Support two methods: Method 1: PDF Upload or Method 2: Text Content.
              </p>
            </div>

            <form onSubmit={handleSaveUnitSubmit} className="space-y-5 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Title *</label>
                <input
                  type="text"
                  required
                  value={unitEditModal.title}
                  onChange={(e) => setUnitEditModal({ ...unitEditModal, title: e.target.value })}
                  placeholder="e.g. Relational Data Models & Normalization"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* METHOD 1: PDF UPLOAD */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <File className="w-4 h-4 text-indigo-600" />
                    METHOD 1: PDF Upload
                  </span>
                  {unitEditModal.pdfUrl && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">✓ PDF Attached</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upload PDF File from Device</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUnitFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                  {unitEditModal.fileUploading && (
                    <p className="text-xs text-indigo-600 font-semibold mt-1">Uploading PDF file...</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Or Enter Direct PDF URL / Reference Link</label>
                  <input
                    type="text"
                    value={unitEditModal.pdfUrl}
                    onChange={(e) => setUnitEditModal({ ...unitEditModal, pdfUrl: e.target.value })}
                    placeholder="https://domain.edu/uploads/unit_syllabus.pdf"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* METHOD 2: TEXT CONTENT */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    METHOD 2: Text Content
                  </span>
                  {unitEditModal.textContent && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">✓ Text Entered</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enter Unit Syllabus Description & Topics</label>
                  <textarea
                    rows={5}
                    value={unitEditModal.textContent}
                    onChange={(e) => setUnitEditModal({ ...unitEditModal, textContent: e.target.value })}
                    placeholder="Enter detailed syllabus content for this unit..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-lg transition-colors"
              >
                Save Unit Syllabus
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FACULTY ASSIGNMENT MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() =>
                setAssignModal({
                  open: false,
                  facultyId: '',
                  academicYear: '2024-2025',
                  calendarYear: '2025 CY',
                  selectedProgramId: 'ALL',
                  selectedSemester: 'ALL',
                })
              }
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Assign Faculty to Program & Paper</span>
            </h3>

            <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-900">
              <span className="font-bold">Faculty Teaching Allocation:</span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                As Programme Coordinator, select the <strong>Programme</strong>, <strong>Semester</strong>, and <strong>Subject / Paper</strong> to allocate to a faculty member.
              </p>
            </div>

            <form onSubmit={handleAssignFacultySubmit} className="space-y-4 text-sm">
              {/* Step 1: Select Programme and Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">1. Programme</label>
                  <select
                    value={assignModal.selectedProgramId || 'ALL'}
                    onChange={(e) => {
                      const progId = e.target.value;
                      const candidatePapers = papers.filter(
                        (p) =>
                          (progId === 'ALL' || p.programmeId === progId) &&
                          (!assignModal.selectedSemester || assignModal.selectedSemester === 'ALL' || p.semesterName === assignModal.selectedSemester)
                      );
                      setAssignModal((prev) => ({
                        ...prev,
                        selectedProgramId: progId,
                        paper: candidatePapers.length > 0 ? candidatePapers[0] : undefined,
                      }));
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="ALL">All Programmes</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Semester</label>
                  <select
                    value={assignModal.selectedSemester || 'ALL'}
                    onChange={(e) => {
                      const sem = e.target.value;
                      const candidatePapers = papers.filter(
                        (p) =>
                          (!assignModal.selectedProgramId || assignModal.selectedProgramId === 'ALL' || p.programmeId === assignModal.selectedProgramId) &&
                          (sem === 'ALL' || p.semesterName === sem)
                      );
                      setAssignModal((prev) => ({
                        ...prev,
                        selectedSemester: sem,
                        paper: candidatePapers.length > 0 ? candidatePapers[0] : undefined,
                      }));
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="ALL">All Semesters</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Select Subject / Paper */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Select Subject / Paper <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignModal.paper?.id || ''}
                  onChange={(e) => {
                    const sel = papers.find((p) => p.id === e.target.value);
                    const parentProg = programs.find((pg) => pg.id === sel?.programmeId);
                    setAssignModal((prev) => ({
                      ...prev,
                      paper: sel,
                      academicYear: sel?.academicYear || parentProg?.academicYear || prev.academicYear || '2024-2025',
                      calendarYear: sel?.calendarYear || parentProg?.calendarYear || prev.calendarYear || '2025 CY',
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  <option value="">Choose Subject / Paper...</option>
                  {papers
                    .filter((p) => {
                      const progMatch =
                        !assignModal.selectedProgramId ||
                        assignModal.selectedProgramId === 'ALL' ||
                        p.programmeId === assignModal.selectedProgramId;
                      const semMatch =
                        !assignModal.selectedSemester ||
                        assignModal.selectedSemester === 'ALL' ||
                        p.semesterName === assignModal.selectedSemester;
                      return progMatch && semMatch;
                    })
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name} — {p.programmeName} ({p.semesterName})
                      </option>
                    ))}
                </select>
                {assignModal.paper && (
                  <p className="text-[11px] text-emerald-700 mt-1.5 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span>
                      Selected Paper: <strong>[{assignModal.paper.code}] {assignModal.paper.name}</strong>
                    </span>
                    <span className="text-slate-500 text-[10px]">{assignModal.paper.semesterName}</span>
                  </p>
                )}
              </div>

              {/* Step 3: Select Faculty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Select Faculty / Academic Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignModal.facultyId}
                  onChange={(e) => setAssignModal({ ...assignModal, facultyId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  <option value="">Choose Faculty / Academic Staff...</option>
                  {facultyUsers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.role}) — {f.email} {f.qualification ? `[${f.qualification}]` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigns this faculty member as teacher & coordinator for this paper and synchronizes their LMS teaching dashboard.
                </p>
              </div>

              {/* Step 4: Academic Year & Calendar Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={assignModal.academicYear || '2024-2025'}
                    onChange={(e) => setAssignModal({ ...assignModal, academicYear: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calendar Year</label>
                  <select
                    value={assignModal.calendarYear || '2025 CY'}
                    onChange={(e) => setAssignModal({ ...assignModal, calendarYear: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="2024 CY">2024 CY</option>
                    <option value="2025 CY">2025 CY</option>
                    <option value="2026 CY">2026 CY</option>
                    <option value="2026 Jan Admission">2026 Jan Admission</option>
                    <option value="2026 Jul Admission">2026 Jul Admission</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Save Faculty Assignment</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL (MAINTAINING PROGRAMME -> SYLLABUS -> COURSE RELATIONSHIP) */}
      {paperModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setPaperModal({ ...paperModal, open: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">{paperModal.id ? 'Edit Course' : 'Create New Course'}</h3>
            <p className="text-xs text-slate-500">Configure course details, link to Programme and Syllabus regulations, and assign credits.</p>
            <form onSubmit={handleSavePaperSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Select Programme *</label>
                  <select
                    value={paperModal.programmeId}
                    onChange={(e) => {
                      const prog = programs.find(p => p.id === e.target.value);
                      const progSyllabus = syllabuses.find(s => s.programmeId === e.target.value);
                      setPaperModal({
                        ...paperModal,
                        programmeId: e.target.value,
                        syllabusId: progSyllabus?.id || '',
                        syllabusName: progSyllabus?.name || 'Regulation 2024',
                        academicYear: prog?.academicYear || paperModal.academicYear || '2024-2025',
                        calendarYear: prog?.calendarYear || paperModal.calendarYear || '2025 CY',
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Linked Syllabus (Syllabi) *</label>
                  <select
                    value={paperModal.syllabusId || ''}
                    onChange={(e) => {
                      const syl = syllabuses.find(s => s.id === e.target.value);
                      setPaperModal({
                        ...paperModal,
                        syllabusId: e.target.value,
                        syllabusName: syl ? `${syl.name} (${syl.regulation})` : 'Regulation 2024',
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="">Default (Regulation 2024)</option>
                    {syllabuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} - {s.regulation}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Database Management Systems"
                  value={paperModal.name}
                  onChange={(e) => setPaperModal({ ...paperModal, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS501"
                    value={paperModal.code}
                    onChange={(e) => setPaperModal({ ...paperModal, code: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Semester *</label>
                  <select
                    value={paperModal.semesterName}
                    onChange={(e) => setPaperModal({ ...paperModal, semesterName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={paperModal.credits}
                    onChange={(e) => setPaperModal({ ...paperModal, credits: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Academic Year</label>
                  <select
                    value={paperModal.academicYear || '2024-2025'}
                    onChange={(e) => setPaperModal({ ...paperModal, academicYear: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Calendar Year</label>
                  <select
                    value={paperModal.calendarYear || '2025 CY'}
                    onChange={(e) => setPaperModal({ ...paperModal, calendarYear: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="2024 CY">2024 CY</option>
                    <option value="2025 CY">2025 CY</option>
                    <option value="2026 CY">2026 CY</option>
                    <option value="2026 Jan Admission">2026 Jan Admission</option>
                    <option value="2026 Jul Admission">2026 Jul Admission</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors">
                Save Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE LIVE CLASS MODAL */}
      {scheduleModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setScheduleModal({ ...scheduleModal, open: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Schedule Synchronous Live Class</h3>
            <p className="text-xs text-slate-500">Create a synchronous virtual classroom session accessible to all registered students.</p>

            <form onSubmit={handleSaveScheduleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Course *</label>
                <select
                  value={scheduleModal.courseId}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Class Subject / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Normalization & Query Optimization"
                  value={scheduleModal.subject}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, subject: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleModal.date}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={scheduleModal.startTime}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, startTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="11:30 AM"
                    value={scheduleModal.endTime}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, endTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Class Type</label>
                  <select
                    value={scheduleModal.classType}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, classType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="Synchronous Live Class">Synchronous Live Class</option>
                    <option value="Live Lecture">Live Lecture</option>
                    <option value="Interactive Session">Interactive Session</option>
                    <option value="Virtual Lab">Virtual Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Room / Platform</label>
                  <input
                    type="text"
                    placeholder="Virtual Classroom 1"
                    value={scheduleModal.room}
                    onChange={(e) => setScheduleModal({ ...scheduleModal, room: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Meeting Link (Google Meet / Zoom URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/..."
                  value={scheduleModal.meetingLink}
                  onChange={(e) => setScheduleModal({ ...scheduleModal, meetingLink: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors">
                Save & Publish Class Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL (3 CATEGORIES: OBJECTIVE, SUBJECTIVE, GRADED DISCUSSION) */}
      {asgModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAsgModal({ ...asgModal, open: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Academic Assignment</h3>
              <p className="text-xs text-slate-500">Provide assignment details across 3 categories including Graded Discussions.</p>
            </div>

            <form onSubmit={handleSaveAssignmentSubmit} className="space-y-3.5 text-sm">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Objective', 'Subjective', 'Graded Discussion'] as AssignmentType[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAsgModal({ ...asgModal, assignmentType: cat })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        asgModal.assignmentType === cat
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'Objective' && '1. Objective'}
                      {cat === 'Subjective' && '2. Subjective'}
                      {cat === 'Graded Discussion' && '3. Graded Discussion'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Select Course *</label>
                <select
                  value={asgModal.courseId}
                  onChange={(e) => setAsgModal({ ...asgModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold mb-1">Unit *</label>
                  <select
                    value={asgModal.unitNumber || 1}
                    onChange={(e) => setAsgModal({ ...asgModal, unitNumber: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6].map(u => (
                      <option key={u} value={u}>Unit {u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      asgModal.assignmentType === 'Objective'
                        ? 'e.g. Objective Quiz on Relational Algebra'
                        : asgModal.assignmentType === 'Graded Discussion'
                        ? 'e.g. Graded Discussion & Presentation'
                        : 'e.g. Subjective Case Study'
                    }
                    value={asgModal.title}
                    onChange={(e) => setAsgModal({ ...asgModal, title: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={asgModal.dueDate}
                    onChange={(e) => setAsgModal({ ...asgModal, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Marks *</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={asgModal.maxMarks}
                    onChange={(e) => setAsgModal({ ...asgModal, maxMarks: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* SPECIFIC FIELDS FOR GRADED DISCUSSIONS */}
              {asgModal.assignmentType === 'Graded Discussion' && (
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Graded Discussion & Presentation Settings</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Scheduled Discussion Session Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={asgModal.scheduledDate}
                      onChange={(e) => setAsgModal({ ...asgModal, scheduledDate: e.target.value })}
                      className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      Discussion Presentation Topic *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Database Consistency Models Presentation"
                      value={asgModal.presentationTopic}
                      onChange={(e) => setAsgModal({ ...asgModal, presentationTopic: e.target.value })}
                      className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Instructions & Guidelines *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed rubrics, questions, or presentation format..."
                  value={asgModal.instructions}
                  onChange={(e) => setAsgModal({ ...asgModal, instructions: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Attachment / Reference URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={asgModal.attachmentUrl}
                  onChange={(e) => setAsgModal({ ...asgModal, attachmentUrl: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors">
                Save & Rollout Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSIONS MODAL */}
      {viewSubmissionsModal.open && viewSubmissionsModal.assignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setViewSubmissionsModal({ open: false, assignment: null })} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">
              Student Submissions: {viewSubmissionsModal.assignment.title}
            </h3>
            <p className="text-xs text-slate-500">Course: {viewSubmissionsModal.assignment.courseName} • Due: {viewSubmissionsModal.assignment.dueDate}</p>

            <div className="divide-y divide-slate-100 text-xs">
              {viewSubmissionsModal.assignment.submissions?.length === 0 ? (
                <p className="py-8 text-center text-slate-400 italic">No submissions submitted yet.</p>
              ) : (
                viewSubmissionsModal.assignment.submissions?.map((sub, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{sub.studentName} ({sub.studentId})</p>
                      <p className="text-slate-400 text-[10px]">Submitted: {sub.submissionDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'Evaluated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status}: {sub.marks !== undefined ? `${sub.marks} Marks` : 'Pending Grade'}
                      </span>
                      {sub.fileUrl && (
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                          View File →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE DISCUSSION TOPIC MODAL */}
      {newDiscussionModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setNewDiscussionModal({ ...newDiscussionModal, open: false })} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Start Resource Discussion Topic</h3>
            <form onSubmit={handleCreateDiscussionSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Course *</label>
                <select
                  value={newDiscussionModal.courseId}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clarification on Unit 2 Query Processing"
                  value={newDiscussionModal.title}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Discussion Guidance / Question *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide discussion prompt or academic resource guidance..."
                  value={newDiscussionModal.content}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-colors">
                Publish Discussion Thread
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {circularModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setCircularModal({ ...circularModal, open: false })} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Post University Announcement</h3>
            <p className="text-xs text-slate-500">This notice will automatically link to the academic calendar on the chosen date.</p>

            <form onSubmit={handleSaveCircularSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Online Examinations"
                  value={circularModal.title}
                  onChange={(e) => setCircularModal({ ...circularModal, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Calendar Event Date *</label>
                <input
                  type="date"
                  required
                  value={circularModal.date}
                  onChange={(e) => setCircularModal({ ...circularModal, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Description / Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter notice details, guidelines, or instructions..."
                  value={circularModal.description}
                  onChange={(e) => setCircularModal({ ...circularModal, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="circImportant"
                  checked={circularModal.isImportant}
                  onChange={(e) => setCircularModal({ ...circularModal, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <label htmlFor="circImportant" className="text-xs font-semibold text-slate-700">
                  Mark as High-Priority / Important Notice
                </label>
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-colors">
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD E-TUTORIAL MODAL */}
      {tutorialModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setTutorialModal({ ...tutorialModal, open: false })} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-slate-900">Add E-Tutorial Content</h3>
            <p className="text-xs text-slate-500">Upload video lecture links or educational documents organized course-wise.</p>

            <form onSubmit={handleSaveTutorialSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Course *</label>
                <select
                  value={tutorialModal.courseId}
                  onChange={(e) => setTutorialModal({ ...tutorialModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  required
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tutorial Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Video Lecture: Query Processing & Tree Optimization"
                  value={tutorialModal.title}
                  onChange={(e) => setTutorialModal({ ...tutorialModal, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Unit Number</label>
                  <select
                    value={tutorialModal.unitNumber}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, unitNumber: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value={1}>Unit 1</option>
                    <option value={2}>Unit 2</option>
                    <option value={3}>Unit 3</option>
                    <option value={4}>Unit 4</option>
                    <option value={5}>Unit 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Resource Type</label>
                  <select
                    value={tutorialModal.fileType}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, fileType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="Video Link">Video Lecture</option>
                    <option value="PDF">PDF Tutorial</option>
                    <option value="Document">Word Document</option>
                    <option value="Notes">Lecture Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tutorial URL / Video Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={tutorialModal.fileUrl}
                  onChange={(e) => setTutorialModal({ ...tutorialModal, fileUrl: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Summary / Concept Notes</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of this educational tutorial..."
                  value={tutorialModal.notes}
                  onChange={(e) => setTutorialModal({ ...tutorialModal, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition-colors">
                Save E-Tutorial Content
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSESSMENT SUBMISSIONS MODAL */}
      {selectedAssessmentForSubmissions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAssessmentForSubmissions(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
                ASSESSMENT RESULTS
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {selectedAssessmentForSubmissions.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Max Marks: {selectedAssessmentForSubmissions.maxMarks} • Course: {selectedAssessmentForSubmissions.courseName}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions
                    .filter((s) => s.assessmentId === selectedAssessmentForSubmissions.id)
                    .map((s) => {
                      const isPass = s.percentage >= 40;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-bold text-slate-900">{s.studentName}</td>
                          <td className="px-4 py-3 font-mono text-indigo-700">{s.studentId}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {s.score} / {s.maxMarks}
                          </td>
                          <td className="px-4 py-3 font-bold text-blue-700">{s.percentage}%</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  {submissions.filter((s) => s.assessmentId === selectedAssessmentForSubmissions.id).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No student submissions recorded for this assessment yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
