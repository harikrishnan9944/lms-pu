'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  fetchCoursesAction,
  fetchProgramsAction,
  fetchSemestersAction,
  fetchPapersAction,
  fetchLearningResourcesAction,
  saveLearningResourceAction,
  deleteLearningResourceAction,
  fetchResourceViewsAction,
  fetchAssessmentsAction,
  saveAssessmentAction,
  toggleAssessmentPublishAction,
  deleteAssessmentAction,
  fetchAssignmentsAction,
  saveAssignmentAction,
  gradeAssignmentAction,
  deleteAssignmentAction,
  fetchInternalMarksAction,
  saveInternalMarkAction,
  fetchSchedulesAction,
  saveScheduleAction,
  deleteScheduleAction,
  fetchFacultyTeachingAction,
  fetchPaperUnitsAction,
  fetchAssessmentSubmissionsAction,
  fetchCircularsAction,
  saveFacultyAnnouncementAction,
  deleteCircularAction,
  fetchDiscussionsAction,
  createDiscussionAction,
  replyToDiscussionAction,
  fetchAttendanceRecordsAction,
  recordAttendanceAction,
} from '@/app/actions/lmsActions';
import { fetchUsersAction } from '@/app/actions/userActions';
import {
  CourseItem,
  LearningResourceItem,
  ResourceViewItem,
  AssessmentItem,
  AssessmentSubmissionItem,
  QuizQuestion,
  SubmissionAnswersPayload,
  AssignmentItem,
  InternalMarkItem,
  ScheduleItem,
  PaperUnitItem,
  ProgramItem,
  SemesterItem,
  PaperItem,
  CircularItem,
  ForumItem,
  AttendanceRecordItem,
} from '@/lib/db';
import { downloadAssessmentTemplate, parseAssessmentExcel } from '@/lib/excelUtils';
import { UserSessionPayload } from '@/lib/auth';
import {
  BookOpen,
  FolderArchive,
  FileText,
  Calendar,
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Power,
  Eye,
  Download,
  CheckCircle2,
  X,
  Upload,
  UploadCloud,
  FileCheck,
  Film,
  FolderKanban,
  GraduationCap,
  Layers,
  Video,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Users,
  Bell,
  MessageSquare,
  Send,
  UserCheck,
  Clock,
  Home,
  Play,
  Radio,
  Copy,
  Search,
  Award,
  TrendingUp,
  BarChart3,
  User,
  ChevronDown,
  ChevronUp,
  Filter,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/authActions';
import { Toast } from '../ui/Toast';

interface FacultyDashboardProps {
  user?: UserSessionPayload;
}

export function FacultyDashboard({ user }: FacultyDashboardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<
    | 'home'
    | 'teaching'
    | 'resources'
    | 'assessments'
    | 'assignments'
    | 'marks'
    | 'attendance'
    | 'schedule'
    | 'announcements'
    | 'discussions'
    | 'performance'
    | 'profile'
  >('home');

  useEffect(() => {
    if (
      tabParam &&
      [
        'home',
        'teaching',
        'resources',
        'assessments',
        'assignments',
        'marks',
        'attendance',
        'schedule',
        'announcements',
        'discussions',
        'performance',
        'profile',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [resources, setResources] = useState<LearningResourceItem[]>([]);
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [marksList, setMarksList] = useState<InternalMarkItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [students, setStudents] = useState<
    { id: string; name: string; studentId?: string; email?: string; programme?: string; semester?: string }[]
  >([]);
  const [announcements, setAnnouncements] = useState<CircularItem[]>([]);
  const [discussions, setDiscussions] = useState<ForumItem[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordItem[]>([]);

  // Navigation & View Toggles
  const [showAssignedTeaching, setShowAssignedTeaching] = useState(false);
  const [quickRemoveModal, setQuickRemoveModal] = useState(false);
  const [removeSearch, setRemoveSearch] = useState('');

  // Attendance Filters
  const [attCourseFilter, setAttCourseFilter] = useState('ALL');
  const [attDateFilter, setAttDateFilter] = useState('');
  const [attStatusFilter, setAttStatusFilter] = useState<'ALL' | 'Present' | 'Absent' | 'Late'>('ALL');
  const [attSearch, setAttSearch] = useState('');

  // Performance Filters
  const [perfCourseFilter, setPerfCourseFilter] = useState('ALL');
  const [perfSearch, setPerfSearch] = useState('');
  const [perfStandingFilter, setPerfStandingFilter] = useState<'ALL' | 'Excellent' | 'Good' | 'Needs Support'>('ALL');

  // Announcement Modal State
  const [annModal, setAnnModal] = useState({ open: false, title: '', description: '', isImportant: false });

  // Discussion State
  const [newDiscussionModal, setNewDiscussionModal] = useState({ open: false, courseId: '', title: '', content: '' });
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Attendance Recording State
  const [recordAttModal, setRecordAttModal] = useState<{
    open: boolean;
    schedule?: ScheduleItem;
    courseId: string;
    date: string;
    studentStatuses: Record<string, 'Present' | 'Absent' | 'Late'>;
  }>({
    open: false,
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    studentStatuses: {},
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals / Forms
  const [resModal, setResModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [assModal, setAssModal] = useState(false);
  const [asgModal, setAsgModal] = useState(false);
  const [schModal, setSchModal] = useState(false);
  const [gradeModal, setGradeModal] = useState<{ open: boolean; assignmentId: string; studentId: string; studentName: string } | null>(null);
  const [viewSyllabusModal, setViewSyllabusModal] = useState<{ open: boolean; paperName: string; paperCode: string; units: PaperUnitItem[] } | null>(null);

  // Resource Form State
  const [allPrograms, setAllPrograms] = useState<ProgramItem[]>([]);
  const [allSemesters, setAllSemesters] = useState<SemesterItem[]>([]);
  const [allPapers, setAllPapers] = useState<PaperItem[]>([]);

  const handleOpenCreateResource = () => {
    setEditingResourceId(null);
    setResTitle('');
    setResFileType('Video Link');
    setResFileUrl('');
    setResNotes('');
    setResUnitNumber(1);
    setDraggedFileDetails(null);
    if (allPrograms.length > 0 && !resProgramId) {
      setResProgramId(allPrograms[0].id);
    }
    setResModal(true);
  };

  const handleOpenEditResource = (res: LearningResourceItem) => {
    setEditingResourceId(res.id);
    setResTitle(res.title);
    setResFileType(res.fileType);
    setResFileUrl(res.fileUrl);
    setResNotes(res.notes || '');
    setResProgramId(res.programmeId || (allPrograms[0]?.id || ''));
    setResSemesterName(res.semesterName || 'Semester 1');
    setResPaperId(res.paperId || res.courseId || '');
    setResUnitNumber(res.unitNumber || 1);
    setDraggedFileDetails(null);
    setResModal(true);
  };

  const [resTitle, setResTitle] = useState('');
  const [resCourseId, setResCourseId] = useState('');
  const [resFileType, setResFileType] = useState<'PDF' | 'Document' | 'Image' | 'Video Link' | 'Notes'>('Video Link');
  const [resFileUrl, setResFileUrl] = useState('');
  const [resNotes, setResNotes] = useState('');
  const [resProgramId, setResProgramId] = useState<string>('');
  const [resSemesterName, setResSemesterName] = useState<string>('Semester 1');
  const [resPaperId, setResPaperId] = useState<string>('');
  const [resUnitNumber, setResUnitNumber] = useState<number>(1);
  const [videoPlayerModal, setVideoPlayerModal] = useState<{ open: boolean; title: string; url: string; notes?: string; paperName?: string; semesterName?: string } | null>(null);

  // Student viewers modal state for faculty
  const [viewersModal, setViewersModal] = useState<{ open: boolean; resourceTitle: string; unitNumber?: number; viewers: ResourceViewItem[]; loading: boolean } | null>(null);

  const handleOpenViewersModal = async (resource: LearningResourceItem) => {
    setViewersModal({
      open: true,
      resourceTitle: resource.title,
      unitNumber: resource.unitNumber,
      viewers: [],
      loading: true,
    });
    try {
      const list = await fetchResourceViewsAction(resource.id);
      setViewersModal({
        open: true,
        resourceTitle: resource.title,
        unitNumber: resource.unitNumber,
        viewers: list,
        loading: false,
      });
    } catch {
      setViewersModal({
        open: true,
        resourceTitle: resource.title,
        unitNumber: resource.unitNumber,
        viewers: [],
        loading: false,
      });
      setToast({ message: 'Failed to load viewers list.', type: 'error' });
    }
  };

  // Resource Filter & Search State for Faculty
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceProgFilter, setResourceProgFilter] = useState('ALL');
  const [resourceSemFilter, setResourceSemFilter] = useState('ALL');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'ALL' | 'Video Link' | 'PDF' | 'Document' | 'Image' | 'Notes'>('ALL');
  const [resourceUnitFilter, setResourceUnitFilter] = useState<string>('ALL');

  useEffect(() => {
    if (resModal && allPapers.length > 0) {
      const matchPapers = allPapers.filter((p) => {
        const matchProg = !resProgramId || p.programmeId === resProgramId;
        const matchSem = !resSemesterName || p.semesterName === resSemesterName;
        return matchProg && matchSem;
      });
      if (matchPapers.length > 0 && !matchPapers.some((p) => p.id === resPaperId)) {
        setResPaperId(matchPapers[0].id);
      }
    }
  }, [resProgramId, resSemesterName, resModal, allPapers, resPaperId]);

  // Drag and drop video upload state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFileDetails, setDraggedFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleProcessUploadedFile = (file: File) => {
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setDraggedFileDetails({ name: fileName, size: `${sizeInMB} MB` });

    if (!resTitle || resTitle.trim() === '') {
      const titleWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      setResTitle(titleWithoutExt);
    }

    if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv'].includes(ext)) {
      setResFileType('Video Link');
    } else if (['pdf'].includes(ext)) {
      setResFileType('PDF');
    } else if (['doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
      setResFileType('Document');
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) {
      setResFileType('Image');
    }

    const objectUrl = URL.createObjectURL(file);
    setResFileUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessUploadedFile(e.target.files[0]);
    }
  };

  // Assessment Form State
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assCourseId, setAssCourseId] = useState('');
  const [assDate, setAssDate] = useState('');
  const [assDuration, setAssDuration] = useState('60 Minutes');
  const [assMaxMarks, setAssMaxMarks] = useState(1);
  const [assInstructions, setAssInstructions] = useState('');
  const [assCreationMethod, setAssCreationMethod] = useState<'manual' | 'excel'>('manual');
  const [assQuestionsList, setAssQuestionsList] = useState<QuizQuestion[]>([
    { id: 'q_1', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' },
  ]);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState('');

  // Results View State for Faculty
  const [viewSubmissionsModal, setViewSubmissionsModal] = useState<{
    open: boolean;
    assessment: AssessmentItem | null;
    submissions: AssessmentSubmissionItem[];
  } | null>(null);

  const [viewDetailSubmissionModal, setViewDetailSubmissionModal] = useState<{
    open: boolean;
    submission: AssessmentSubmissionItem | null;
    answersPayload: SubmissionAnswersPayload | null;
  } | null>(null);

  const handleAddQuestionField = () => {
    setAssQuestionsList((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      },
    ]);
  };

  const handleRemoveQuestionField = (index: number) => {
    if (assQuestionsList.length <= 1) return;
    setAssQuestionsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestionField = (index: number, field: keyof QuizQuestion, value: any) => {
    setAssQuestionsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelErrors([]);
    setExcelSuccessMsg('');
    try {
      const result = await parseAssessmentExcel(file);
      if (result.errors && result.errors.length > 0) {
        setExcelErrors(result.errors);
      } else if (result.questions && result.questions.length > 0) {
        setAssQuestionsList(result.questions);
        setExcelSuccessMsg(`Successfully imported ${result.questions.length} questions from Excel file.`);
      } else {
        setExcelErrors(['No valid questions found in Excel file.']);
      }
    } catch {
      setExcelErrors(['Failed to parse Excel file. Please ensure it follows the template format.']);
    }
  };

  const handleOpenAssessmentSubmissions = async (ass: AssessmentItem) => {
    try {
      const subs = await fetchAssessmentSubmissionsAction(ass.id);
      setViewSubmissionsModal({
        open: true,
        assessment: ass,
        submissions: subs,
      });
    } catch {
      setToast({ message: 'Failed to load assessment submissions.', type: 'error' });
    }
  };

  const handleOpenSubmissionDetail = (sub: AssessmentSubmissionItem) => {
    let payload: SubmissionAnswersPayload | null = null;
    try {
      payload = JSON.parse(sub.answers);
    } catch {
      payload = null;
    }
    setViewDetailSubmissionModal({
      open: true,
      submission: sub,
      answersPayload: payload,
    });
  };

  // Assignment Form State (Objective Assignments Module)
  const [assignmentSubTab, setAssignmentSubTab] = useState<'assignments' | 'submissions'>('assignments');
  const [asgEditingId, setAsgEditingId] = useState<string | null>(null);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgUnitNumber, setAsgUnitNumber] = useState<number | string>(1);
  const [asgCourseId, setAsgCourseId] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDetailedDesc, setAsgDetailedDesc] = useState('');
  const [asgAttachmentUrl, setAsgAttachmentUrl] = useState('');
  const [asgAttachedFileName, setAsgAttachedFileName] = useState('');
  const [asgAttachedFileSize, setAsgAttachedFileSize] = useState('');
  const [asgStartDate, setAsgStartDate] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMaxMarks, setAsgMaxMarks] = useState(100);
  const [asgAdditionalInstructions, setAsgAdditionalInstructions] = useState('');
  const [asgAllowResubmission, setAsgAllowResubmission] = useState(false);
  const [asgIsUploading, setAsgIsUploading] = useState(false);

  // Filters for Assignments & Submissions
  const [asgFilterCourse, setAsgFilterCourse] = useState('ALL');
  const [asgFilterUnit, setAsgFilterUnit] = useState('ALL');
  const [asgSearchQuery, setAsgSearchQuery] = useState('');

  const [subFilterCourse, setSubFilterCourse] = useState('ALL');
  const [subFilterAssignment, setSubFilterAssignment] = useState('ALL');
  const [subFilterUnit, setSubFilterUnit] = useState('ALL');
  const [subFilterStatus, setSubFilterStatus] = useState('ALL');
  const [subSearchQuery, setSubSearchQuery] = useState('');

  // Submission Review & Evaluation Modal
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    assignmentId: string;
    assignmentTitle: string;
    unitName: string;
    courseName: string;
    maxMarks: number;
    studentId: string;
    studentName: string;
    studentRegisterNumber: string;
    submissionDate: string;
    fileUrl: string;
    fileName?: string;
    comments?: string;
    currentMarks: number | '';
    currentFeedback: string;
    isLate: boolean;
  } | null>(null);

  // Legacy Grading State (preserved for compatibility)
  const [gradeMarks, setGradeMarks] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Internal Marks State
  const [selectedMarkCourseId, setSelectedMarkCourseId] = useState('');
  const [selectedMarkStudentId, setSelectedMarkStudentId] = useState('');
  const [enterMarks, setEnterMarks] = useState(45);
  const [enterMaxMarks, setEnterMaxMarks] = useState(50);

  // Schedule Form State
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [schCourseId, setSchCourseId] = useState('');
  const [schSubject, setSchSubject] = useState('');
  const [schDate, setSchDate] = useState('');
  const [schStartTime, setSchStartTime] = useState('10:00 AM');
  const [schEndTime, setSchEndTime] = useState('11:30 AM');
  const [schRoom, setSchRoom] = useState('Google Meet Virtual Hall');
  const [schClassType, setSchClassType] = useState<'Regular Class' | 'Online Class' | 'Lab' | 'Examination'>('Online Class');
  const [schMeetingLink, setSchMeetingLink] = useState('');
  const [schStatus, setSchStatus] = useState<'Upcoming' | 'Live' | 'Completed'>('Upcoming');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'Live' | 'Upcoming' | 'Completed'>('all');

  const handleOpenCreateSchedule = () => {
    setEditingScheduleId(null);
    if (courses.length > 0 && !schCourseId) {
      setSchCourseId(courses[0].id);
    }
    setSchSubject('');
    setSchDate(new Date().toISOString().split('T')[0]);
    setSchStartTime('10:00 AM');
    setSchEndTime('11:30 AM');
    setSchRoom('Google Meet Virtual Hall');
    setSchClassType('Online Class');
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    setSchMeetingLink(`https://meet.google.com/${randomCode}`);
    setSchStatus('Upcoming');
    setSchModal(true);
  };

  const handleOpenEditSchedule = (sch: ScheduleItem) => {
    setEditingScheduleId(sch.id);
    setSchCourseId(sch.courseId || courses[0]?.id || '');
    setSchSubject(sch.subject || '');
    setSchDate(sch.date || new Date().toISOString().split('T')[0]);
    setSchStartTime(sch.startTime || '10:00 AM');
    setSchEndTime(sch.endTime || '11:30 AM');
    setSchRoom(sch.room || 'Google Meet Virtual Hall');
    setSchClassType(sch.classType || 'Online Class');
    setSchMeetingLink(sch.meetingLink || '');
    setSchStatus(sch.status || 'Upcoming');
    setSchModal(true);
  };

  const handleQuickToggleLiveStatus = async (sch: ScheduleItem) => {
    const newStatus = sch.status === 'Live' ? 'Completed' : 'Live';
    const res = await saveScheduleAction({
      id: sch.id,
      courseId: sch.courseId,
      courseName: sch.courseName,
      subject: sch.subject,
      date: sch.date,
      startTime: sch.startTime,
      endTime: sch.endTime,
      room: sch.room,
      facultyId: sch.facultyId || user?.id || 'usr_fac_1',
      facultyName: sch.facultyName || user?.name || 'Faculty Member',
      classType: sch.classType,
      meetingLink: sch.meetingLink,
      status: newStatus,
    });
    if (res.success) {
      setToast({
        message: newStatus === 'Live' ? '🔴 Class is now LIVE! Students can join directly.' : 'Class session marked as Completed.',
        type: 'success',
      });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to update live status.', type: 'error' });
    }
  };

  const handleGenerateMeetLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    setSchMeetingLink(`https://meet.google.com/${randomCode}`);
  };

  const [teachingGroups, setTeachingGroups] = useState<Array<{
    programId: string;
    programName: string;
    semesters: Array<{
      semesterName: string;
      papers: Array<{
        id: string;
        name: string;
        code: string;
        programmeId: string;
        programmeName: string;
        semesterName: string;
        credits?: number;
        academicYear?: string;
        calendarYear?: string;
      }>;
    }>;
  }>>([]);

  const loadAll = async () => {
    try {
      const [crs, res, ass, asg, mrk, sch, studUsers, teachingData, progs, sems, paps, circs, discList, attLogs] = await Promise.all([
        fetchCoursesAction().catch(() => []),
        fetchLearningResourcesAction().catch(() => []),
        fetchAssessmentsAction().catch(() => []),
        fetchAssignmentsAction().catch(() => []),
        fetchInternalMarksAction().catch(() => []),
        fetchSchedulesAction().catch(() => []),
        fetchUsersAction({ role: 'STUDENT', limit: 100 }).catch(() => ({ users: [], total: 0 })),
        fetchFacultyTeachingAction(user?.role === 'FACULTY' ? user.id : undefined).catch(() => []),
        fetchProgramsAction().catch(() => []),
        fetchSemestersAction().catch(() => []),
        fetchPapersAction().catch(() => []),
        fetchCircularsAction().catch(() => []),
        fetchDiscussionsAction().catch(() => []),
        fetchAttendanceRecordsAction().catch(() => []),
      ]);

      // Strict Course Access: Faculty can access ONLY their assigned courses/papers
      const facultyCourses = user?.role === 'FACULTY'
        ? crs.filter(
            (c) =>
              c.facultyId === user.id ||
              c.facultyName === user.name ||
              teachingData.some((g) =>
                g.semesters.some((s) =>
                  s.papers.some((p) => p.code === c.code || p.name === c.name || p.id === c.id)
                )
              )
          )
        : crs;

      const finalCourses = user?.role === 'FACULTY' ? facultyCourses : crs;

      setCourses(finalCourses);
      setResources(res);
      setAssessments(ass);
      setAssignments(asg);
      setMarksList(mrk);
      setSchedules(sch);
      setStudents(
        studUsers.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          studentId: u.studentId || u.username || u.id,
          email: u.email,
          programme: u.programme,
          semester: u.semester,
        }))
      );
      setAnnouncements(circs);
      setDiscussions(discList);
      setAttendanceRecords(attLogs);
      setTeachingGroups(teachingData);
      setAllPrograms(progs);
      setAllSemesters(sems);
      setAllPapers(paps);

      if (progs.length > 0 && !resProgramId) {
        setResProgramId(progs[0].id);
      }
      if (paps.length > 0 && !resPaperId) {
        setResPaperId(paps[0].id);
      }

      if (finalCourses.length > 0) {
        setResCourseId(finalCourses[0].id);
        setAssCourseId(finalCourses[0].id);
        setAsgCourseId(finalCourses[0].id);
        setSelectedMarkCourseId(finalCourses[0].id);
        setSchCourseId(finalCourses[0].id);
      }
      if (studUsers.users.length > 0) {
        setSelectedMarkStudentId(studUsers.users[0].id);
      }
    } catch {
      setToast({ message: 'Error loading faculty data.', type: 'error' });
    }
  };

  // Handler: Save Faculty Course Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annModal.title.trim()) return;
    const res = await saveFacultyAnnouncementAction({
      title: annModal.title,
      description: annModal.description,
      isImportant: annModal.isImportant,
    });
    if (res.success) {
      setToast({ message: 'Course Announcement published successfully.', type: 'success' });
      setAnnModal({ open: false, title: '', description: '', isImportant: false });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to post announcement.', type: 'error' });
    }
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    const res = await deleteCircularAction(id);
    if (res.success) {
      setToast({ message: 'Announcement deleted.', type: 'success' });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to delete announcement.', type: 'error' });
    }
  };

  // Handler: Start Course Discussion Thread
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find((c) => c.id === newDiscussionModal.courseId) || courses[0];
    const res = await createDiscussionAction({
      courseId: newDiscussionModal.courseId || crs?.id || 'crs_1',
      courseName: crs?.name || 'Class Discussion',
      subject: crs?.subject || 'Course Topic',
      title: newDiscussionModal.title,
      content: newDiscussionModal.content,
    });
    if (res.success) {
      setToast({ message: 'Discussion thread created.', type: 'success' });
      setNewDiscussionModal({ open: false, courseId: courses[0]?.id || '', title: '', content: '' });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to create discussion thread.', type: 'error' });
    }
  };

  // Handler: Reply to Student Inquiry / Discussion
  const handleReplyDiscussion = async (forumId: string) => {
    const content = replyTextMap[forumId];
    if (!content || !content.trim()) return;
    const res = await replyToDiscussionAction(forumId, content);
    if (res.success) {
      setToast({ message: 'Replied to student inquiry.', type: 'success' });
      setReplyTextMap((prev) => ({ ...prev, [forumId]: '' }));
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to reply to inquiry.', type: 'error' });
    }
  };

  // Handler: Record Student Attendance
  const handleSaveAttendance = async () => {
    if (!recordAttModal.courseId && !recordAttModal.schedule) return;
    const crs = courses.find((c) => c.id === recordAttModal.courseId) || courses[0];
    const recordsToSave = students.map((s) => ({
      scheduleId: recordAttModal.schedule?.id || null,
      courseId: crs?.id || 'crs_1',
      courseName: crs?.name || 'Assigned Paper',
      studentId: s.id,
      studentName: s.name,
      date: recordAttModal.date,
      status: (recordAttModal.studentStatuses[s.id] || 'Present') as 'Present' | 'Absent' | 'Late',
      remarks: 'Recorded by Faculty Member',
      recordedBy: user?.name || 'Faculty',
    }));

    const res = await recordAttendanceAction(recordsToSave);
    if (res.success) {
      setToast({ message: `Attendance saved successfully for ${recordsToSave.length} students!`, type: 'success' });
      setRecordAttModal({
        open: false,
        courseId: '',
        date: new Date().toISOString().split('T')[0],
        studentStatuses: {},
      });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to save attendance.', type: 'error' });
    }
  };

  useEffect(() => {
    loadAll();
  }, [user]);

  // Submit Resource
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const selProg = allPrograms.find((p) => p.id === resProgramId) || allPrograms[0];
    const selPaper = allPapers.find((p) => p.id === resPaperId) || allPapers[0];
    const crs = courses.find((c) => c.id === resCourseId || (selPaper && (c.code === selPaper.code || c.name === selPaper.name)));

    const res = await saveLearningResourceAction({
      id: editingResourceId || undefined,
      title: resTitle,
      courseId: crs?.id || selPaper?.id || resCourseId || 'crs_1',
      courseName: crs?.name || selPaper?.name || 'Assigned Course',
      subject: selPaper?.name || crs?.subject || 'Core Subject',
      fileType: resFileType,
      fileUrl: resFileUrl || '#download-material',
      notes: resNotes,
      programmeId: resProgramId || selProg?.id,
      programmeName: selProg?.name || crs?.programmeName || 'MCA (Master of Computer Applications)',
      semesterName: resSemesterName || selPaper?.semesterName || 'Semester 1',
      paperId: selPaper?.id || resPaperId,
      paperName: selPaper?.name || 'General Paper',
      unitNumber: Number(resUnitNumber) || 1,
      unitName: `Unit ${Number(resUnitNumber) || 1}`,
    });
    if (res.success) {
      setToast({
        message: editingResourceId ? 'Resource / Video updated successfully.' : 'Resource / Video uploaded successfully.',
        type: 'success',
      });
      setResModal(false);
      setEditingResourceId(null);
      setResTitle('');
      setResFileUrl('');
      setResNotes('');
      setDraggedFileDetails(null);
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to save resource.', type: 'error' });
    }
  };

  // Submit Assessment
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assQuestionsList.length === 0) {
      setToast({ message: 'Please add at least one question to the assessment.', type: 'error' });
      return;
    }

    // Validate manual questions
    for (let i = 0; i < assQuestionsList.length; i++) {
      const q = assQuestionsList[i];
      if (!q.question.trim()) {
        setToast({ message: `Question ${i + 1} text cannot be empty.`, type: 'error' });
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setToast({ message: `Question ${i + 1} must have all 4 options (A, B, C, D) filled.`, type: 'error' });
        return;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        setToast({ message: `Question ${i + 1} correct answer must be A, B, C, or D.`, type: 'error' });
        return;
      }
    }

    const crs = courses.find((c) => c.id === assCourseId);
    const questionsJson = JSON.stringify(assQuestionsList);
    const calculatedMaxMarks = assQuestionsList.length; // 1 mark per question default

    const res = await saveAssessmentAction({
      title: assTitle,
      description: assDesc,
      courseId: assCourseId,
      courseName: crs?.name || 'Assigned Course',
      date: assDate || new Date().toISOString().split('T')[0],
      duration: assDuration,
      maxMarks: calculatedMaxMarks,
      instructions: assInstructions,
      questions: questionsJson,
      isPublished: true,
      status: 'Upcoming',
    });

    if (res.success) {
      setToast({ message: 'Assessment created & published successfully.', type: 'success' });
      setAssModal(false);
      setAssTitle('');
      setAssDesc('');
      setAssQuestionsList([{ id: 'q_1', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }]);
      setExcelErrors([]);
      setExcelSuccessMsg('');
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to create assessment.', type: 'error' });
    }
  };

  // Open Create Assignment Modal
  const handleOpenCreateAssignment = () => {
    setAsgEditingId(null);
    setAsgTitle('');
    setAsgUnitNumber(1);
    setAsgCourseId(courses[0]?.id || '');
    setAsgDesc('');
    setAsgDetailedDesc('');
    setAsgAttachmentUrl('');
    setAsgAttachedFileName('');
    setAsgAttachedFileSize('');
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueStr = due.toISOString().slice(0, 16);
    setAsgStartDate(startStr);
    setAsgDueDate(dueStr);
    setAsgMaxMarks(100);
    setAsgAdditionalInstructions('');
    setAsgAllowResubmission(false);
    setAsgModal(true);
  };

  // Open Edit Assignment Modal
  const handleOpenEditAssignment = (asg: AssignmentItem) => {
    setAsgEditingId(asg.id);
    setAsgTitle(asg.title);
    setAsgUnitNumber(asg.unitNumber || 1);
    setAsgCourseId(asg.courseId);
    setAsgDesc(asg.description || '');
    setAsgDetailedDesc(asg.detailedDescription || asg.instructions || '');
    setAsgAttachmentUrl(asg.attachmentUrl || '');
    setAsgAttachedFileName(asg.resources?.[0]?.name || (asg.attachmentUrl ? asg.attachmentUrl.split('/').pop() || 'Resource File' : ''));
    setAsgAttachedFileSize(asg.resources?.[0]?.size || '');
    setAsgStartDate(asg.startDate || '');
    setAsgDueDate(asg.dueDate || '');
    setAsgMaxMarks(asg.maxMarks || 100);
    setAsgAdditionalInstructions(asg.additionalInstructions || '');
    setAsgAllowResubmission(asg.allowResubmission ?? false);
    setAsgModal(true);
  };

  // Handle Assignment Resource File Upload
  const handleAsgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAsgIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setAsgAttachmentUrl(data.url);
        setAsgAttachedFileName(data.fileName || file.name);
        setAsgAttachedFileSize(data.fileSize || '');
        setToast({ message: `Resource file "${data.fileName || file.name}" uploaded successfully.`, type: 'success' });
      } else {
        setToast({ message: data.error || 'File upload failed.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error uploading resource file.', type: 'error' });
    } finally {
      setAsgIsUploading(false);
    }
  };

  // Submit / Save Objective Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) {
      setToast({ message: 'Assignment Title is required.', type: 'error' });
      return;
    }
    const crs = courses.find((c) => c.id === asgCourseId) || courses[0];
    if (!crs) {
      setToast({ message: 'Please select an assigned subject/course.', type: 'error' });
      return;
    }
    if (!asgDueDate) {
      setToast({ message: 'Due Date & Time is required.', type: 'error' });
      return;
    }

    const resourcesList = asgAttachmentUrl
      ? [{ name: asgAttachedFileName || 'Assignment Resource File', url: asgAttachmentUrl, size: asgAttachedFileSize }]
      : undefined;

    const res = await saveAssignmentAction({
      id: asgEditingId || undefined,
      title: asgTitle.trim(),
      unitNumber: asgUnitNumber,
      unitName: typeof asgUnitNumber === 'number' ? `Unit ${asgUnitNumber}` : `${asgUnitNumber}`,
      courseId: crs.id,
      courseName: `${crs.code} - ${crs.name}`,
      description: asgDesc.trim() || asgTitle.trim(),
      detailedDescription: asgDetailedDesc.trim(),
      attachmentUrl: asgAttachmentUrl || undefined,
      resources: resourcesList,
      startDate: asgStartDate || undefined,
      dueDate: asgDueDate,
      maxMarks: Number(asgMaxMarks) || 100,
      instructions: asgDetailedDesc.trim() || asgDesc.trim(),
      additionalInstructions: asgAdditionalInstructions.trim() || undefined,
      allowResubmission: asgAllowResubmission,
      assignmentType: 'Objective',
    });

    if (res.success) {
      setToast({
        message: asgEditingId ? 'Objective Assignment updated successfully.' : 'Objective Assignment created successfully.',
        type: 'success',
      });
      setAsgModal(false);
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to save assignment.', type: 'error' });
    }
  };

  // Review & Grade Student Submission
  const handleReviewSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal) return;
    if (reviewModal.currentMarks === '' || Number(reviewModal.currentMarks) < 0) {
      setToast({ message: 'Please enter valid marks.', type: 'error' });
      return;
    }
    if (Number(reviewModal.currentMarks) > reviewModal.maxMarks) {
      setToast({ message: `Marks cannot exceed maximum marks (${reviewModal.maxMarks}).`, type: 'error' });
      return;
    }

    const res = await gradeAssignmentAction(
      reviewModal.assignmentId,
      reviewModal.studentId,
      Number(reviewModal.currentMarks),
      reviewModal.currentFeedback
    );

    if (res.success) {
      setToast({ message: `Submission for ${reviewModal.studentName} reviewed and evaluated successfully.`, type: 'success' });
      setReviewModal(null);
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to grade submission.', type: 'error' });
    }
  };

  // Legacy Grade Submission (preserved)
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeModal) return;
    const res = await gradeAssignmentAction(
      gradeModal.assignmentId,
      gradeModal.studentId,
      Number(gradeMarks),
      gradeFeedback
    );
    if (res.success) {
      setToast({ message: 'Grade and feedback submitted.', type: 'success' });
      setGradeModal(null);
      loadAll();
    }
  };

  // Internal Marks Save
  const handleSaveInternalMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find((c) => c.id === selectedMarkCourseId);
    const stud = students.find((s) => s.id === selectedMarkStudentId);
    if (!crs || !stud) return;

    const res = await saveInternalMarkAction({
      programmeId: crs.programmeId,
      programmeName: crs.programmeName,
      courseId: crs.id,
      courseName: crs.name,
      semester: crs.semester,
      studentId: stud.id,
      studentName: stud.name,
      marks: Number(enterMarks),
      maxMarks: Number(enterMaxMarks),
    });

    if (res.success) {
      setToast({ message: `Internal marks saved for ${stud.name}.`, type: 'success' });
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to save internal marks.', type: 'error' });
    }
  };

  // Schedule Save
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find((c) => c.id === schCourseId);
    const res = await saveScheduleAction({
      id: editingScheduleId || undefined,
      courseId: schCourseId || crs?.id || 'crs_1',
      courseName: crs?.name || 'Assigned Course',
      subject: schSubject || crs?.subject || 'Class Lecture',
      date: schDate || new Date().toISOString().split('T')[0],
      startTime: schStartTime,
      endTime: schEndTime,
      room: schRoom,
      facultyId: user?.id || 'usr_fac_1',
      facultyName: user?.name || 'Faculty Member',
      classType: schClassType,
      meetingLink: schMeetingLink || 'https://meet.google.com/lms-class-live',
      status: schStatus,
    });
    if (res.success) {
      setToast({
        message: editingScheduleId ? 'Class schedule updated successfully.' : 'Class schedule created successfully.',
        type: 'success',
      });
      setSchModal(false);
      setEditingScheduleId(null);
      loadAll();
    } else {
      setToast({ message: res.error || 'Failed to save schedule.', type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Course Coordinator Portal</h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-extrabold shadow-xs">
              Course Coordinator
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to Course Coordinator Portal. Manage course materials, assignments, assessments, internal marks, attendance, and student performance.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          title="Go to Home"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Tab: Home (Course Coordinator Overview) */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Hero Welcome Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-xs font-bold text-emerald-200">
                  Course Coordinator
                </span>
                <span className="text-xs text-emerald-200/80">• Periyar University CDOE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {user?.name || 'Course Coordinator'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Coordinate your assigned academic papers, upload learning resources, evaluate student assignments, record verified attendance, enter internal marks, and track learner performance metrics.
              </p>
            </div>
          </div>

          {/* KPI Metric Cards */}
          {(() => {
            const totalAtt = attendanceRecords.length;
            const presentCount = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
            const overallAttRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 85;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div
                  onClick={() => setActiveTab('resources')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Papers</p>
                    <BookOpen className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{courses.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assigned Papers</p>
                </div>

                <div
                  onClick={() => setActiveTab('resources')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Materials</p>
                    <Video className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{resources.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Uploaded Resources</p>
                </div>

                <div
                  onClick={() => setActiveTab('assignments')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Assignments</p>
                    <FileText className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{assignments.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active Tasks</p>
                </div>

                <div
                  onClick={() => setActiveTab('assessments')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Assessments</p>
                    <CheckSquare className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{assessments.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tests & Quizzes</p>
                </div>

                <div
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Attendance</p>
                    <UserCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{overallAttRate}%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{totalAtt} Total Records</p>
                </div>

                <div
                  onClick={() => setActiveTab('performance')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Students</p>
                    <BarChart3 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{students.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Enrolled Learners</p>
                </div>
              </div>
            );
          })()}

          {/* Quick Action Navigation Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-600" />
              <span>Quick Action Workflows</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setActiveTab('resources');
                  handleOpenCreateResource();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Upload Material</p>
                  <p className="text-[10px] text-slate-500">Video, notes, study PDFs</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Record Attendance</p>
                  <p className="text-[10px] text-slate-500">Session presence verification</p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('marks')}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Enter Internal Marks</p>
                  <p className="text-[10px] text-slate-500">Record component scores</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('schedule');
                  handleOpenCreateSchedule();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all space-y-2 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Schedule Live Class</p>
                  <p className="text-[10px] text-slate-500">Google Meet virtual hall</p>
                </div>
              </button>
            </div>
          </div>

          {/* Assigned Teaching Papers Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  <span>My Assigned Teaching Courses</span>
                </h3>
                <p className="text-xs text-slate-500">Programmes and courses allocated to you by the Programme Coordinator.</p>
              </div>
              <button
                onClick={() => setActiveTab('resources')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                Manage Materials →
              </button>
            </div>

            {teachingGroups.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
                No papers have been assigned to your course coordinator account yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachingGroups.flatMap(g => g.semesters.flatMap(s => s.papers.map(p => ({ ...p, progName: g.programName })))).map(paper => (
                  <div key={paper.id} className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                        {paper.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{paper.semesterName}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{paper.name}</h4>
                    <p className="text-[11px] text-slate-500">{paper.progName} • {paper.credits ? `${paper.credits} Credits` : '4 Credits'}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const units = await fetchPaperUnitsAction(paper.id);
                            setViewSyllabusModal({
                              open: true,
                              paperName: paper.name,
                              paperCode: paper.code,
                              units: units || [],
                            });
                          } catch {
                            setToast({ message: 'Error loading syllabus.', type: 'error' });
                          }
                        }}
                        className="flex-1 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        📖 View Detailed Syllabus
                      </button>
                      <button
                        onClick={() => {
                          setResourceSearch(paper.name);
                          setActiveTab('resources');
                        }}
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="View materials for this paper"
                      >
                        Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Live Classes & Recent Announcements Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live / Upcoming Classes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600" />
                  <span>Upcoming & Live Classes</span>
                </h3>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  View All Schedules →
                </button>
              </div>

              <div className="space-y-3">
                {schedules.slice(0, 3).map((sch) => (
                  <div key={sch.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${sch.status === 'Live' ? 'bg-rose-600 text-white animate-pulse' : 'bg-blue-100 text-blue-800'}`}>
                          {sch.status}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">{sch.subject}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">{sch.courseName} • {sch.date} ({sch.startTime} - {sch.endTime})</p>
                    </div>
                    {sch.meetingLink && (
                      <a
                        href={sch.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No scheduled classes yet.</p>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Recent Announcements</span>
                </h3>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs text-amber-600 hover:text-amber-800 font-bold cursor-pointer"
                >
                  Post Notice →
                </button>
              </div>

              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{ann.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{ann.description}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No announcements published yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 0: My Assigned Teaching (Requirement 7 & 14) */}
      {activeTab === 'teaching' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              <span>My Assigned Teaching</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Programmes, semesters, and courses assigned to you by the Programme Coordinator.
            </p>
          </div>

          {teachingGroups.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs font-medium">
              No courses have been assigned to your faculty account yet. Please contact your Programme Coordinator.
            </div>
          ) : (
            <div className="space-y-6">
              {teachingGroups.map((group) => (
                <div key={group.programId} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-extrabold text-slate-900">{group.programName}</h3>
                  </div>

                  <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-indigo-200">
                    {group.semesters.map((sem) => (
                      <div key={sem.semesterName} className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          <span>{sem.semesterName}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                          {sem.papers.map((paper) => (
                            <div key={paper.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 font-mono">
                                    {paper.code}
                                  </span>
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
                                <h4 className="font-extrabold text-slate-900 text-sm mt-1">{paper.name}</h4>
                                {paper.credits && (
                                  <p className="text-[11px] text-slate-400">{paper.credits} Credits</p>
                                )}
                              </div>

                              <button
                                onClick={async () => {
                                  try {
                                    const units = await fetchPaperUnitsAction(paper.id);
                                    setViewSyllabusModal({
                                      open: true,
                                      paperName: paper.name,
                                      paperCode: paper.code,
                                      units,
                                    });
                                  } catch {
                                    setToast({ message: 'Error loading paper syllabus.', type: 'error' });
                                  }
                                }}
                                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>View Syllabus</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Course Upload / Resources */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" />
                <span>Course Material – Upload & Remove Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload lecture videos, PDF study materials, syllabus notes, and manage or remove uploaded course resources.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAssignedTeaching(!showAssignedTeaching)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
              >
                <FolderKanban className="w-4 h-4 text-indigo-600" />
                <span>{showAssignedTeaching ? 'Hide Teaching Papers' : 'My Assigned Papers & Syllabus'}</span>
              </button>

              <button
                onClick={() => setQuickRemoveModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Select and remove uploaded materials"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Remove Material</span>
              </button>

              <button
                onClick={handleOpenCreateResource}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material / Video</span>
              </button>
            </div>
          </div>

          {/* Expandable My Assigned Papers & Detailed Syllabus */}
          {showAssignedTeaching && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>My Assigned Teaching Papers & Detailed Syllabus</span>
                </h3>
                <span className="text-xs text-indigo-700 font-semibold">{teachingGroups.length} programmes allocated</span>
              </div>
              {teachingGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No papers have been assigned to your faculty account yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teachingGroups.flatMap(g => g.semesters.flatMap(s => s.papers.map(p => ({ ...p, progName: g.programName })))).map(paper => (
                    <div key={paper.id} className="p-3 bg-white rounded-xl border border-indigo-200/80 shadow-xs space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">{paper.code}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{paper.semesterName}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{paper.name}</p>
                      <p className="text-[10px] text-slate-500">{paper.progName} • {paper.credits ? `${paper.credits} Credits` : '4 Credits'}</p>
                      <button
                        onClick={async () => {
                          try {
                            const units = await fetchPaperUnitsAction(paper.id);
                            setViewSyllabusModal({
                              open: true,
                              paperName: paper.name,
                              paperCode: paper.code,
                              units: units || [],
                            });
                          } catch {
                            setToast({ message: 'Error loading syllabus.', type: 'error' });
                          }
                        }}
                        className="w-full mt-1 py-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        📖 View Detailed Syllabus (5 Units)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials by title, paper name, subject, or notes..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Program Filter */}
            <select
              value={resourceProgFilter}
              onChange={(e) => setResourceProgFilter(e.target.value)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Programmes</option>
              {allPrograms.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={resourceSemFilter}
              onChange={(e) => setResourceSemFilter(e.target.value)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
            </select>

            {/* File Type Filter */}
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value as any)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Content Types</option>
              <option value="Video Link">🎬 Video Links</option>
              <option value="PDF">📄 PDF Documents</option>
              <option value="Document">📁 Documents</option>
              <option value="Notes">📝 Lecture Notes</option>
              <option value="Image">🖼️ Diagrams / Images</option>
            </select>

            {/* Unit Filter */}
            <select
              value={resourceUnitFilter}
              onChange={(e) => setResourceUnitFilter(e.target.value)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Units</option>
              <option value="1">Unit 1</option>
              <option value="2">Unit 2</option>
              <option value="3">Unit 3</option>
              <option value="4">Unit 4</option>
              <option value="5">Unit 5</option>
            </select>
          </div>

          {(() => {
            const filtered = resources.filter((res) => {
              if (resourceTypeFilter !== 'ALL' && res.fileType !== resourceTypeFilter) {
                return false;
              }
              if (resourceProgFilter !== 'ALL' && res.programmeId !== resourceProgFilter && res.programmeName !== resourceProgFilter) {
                return false;
              }
              if (resourceSemFilter !== 'ALL' && res.semesterName !== resourceSemFilter) {
                return false;
              }
              if (resourceUnitFilter !== 'ALL' && String(res.unitNumber || 1) !== resourceUnitFilter) {
                return false;
              }
              if (resourceSearch.trim()) {
                const q = resourceSearch.toLowerCase();
                const matchTitle = res.title?.toLowerCase().includes(q);
                const matchPaper = res.paperName?.toLowerCase().includes(q);
                const matchCourse = res.courseName?.toLowerCase().includes(q);
                const matchSubject = res.subject?.toLowerCase().includes(q);
                const matchNotes = res.notes?.toLowerCase().includes(q);
                if (!matchTitle && !matchPaper && !matchCourse && !matchSubject && !matchNotes) {
                  return false;
                }
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed">
                  {resources.length === 0
                    ? 'No learning resources or videos uploaded yet. Click "Upload Video / Resource" above to add one.'
                    : 'No matching materials found with current filters. Try resetting your search or filter.'}
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Showing <strong className="text-slate-800">{filtered.length}</strong> of {resources.length} materials</span>
                  {(resourceSearch || resourceProgFilter !== 'ALL' || resourceSemFilter !== 'ALL' || resourceTypeFilter !== 'ALL' || resourceUnitFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setResourceSearch('');
                        setResourceProgFilter('ALL');
                        setResourceSemFilter('ALL');
                        setResourceTypeFilter('ALL');
                        setResourceUnitFilter('ALL');
                      }}
                      className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((res) => (
                    <div key={res.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 ${
                            res.fileType === 'Video Link' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {res.fileType === 'Video Link' ? <Video className="w-3 h-3 text-rose-600" /> : <FileText className="w-3 h-3" />}
                            <span>{res.fileType}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditResource(res)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Resource / Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete "${res.title}"?`)) {
                                  const delRes = await deleteLearningResourceAction(res.id);
                                  if (delRes.success) {
                                    setToast({ message: 'Resource deleted successfully.', type: 'success' });
                                    loadAll();
                                  } else {
                                    setToast({ message: 'Failed to delete resource.', type: 'error' });
                                  }
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Resource / Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{res.title}</h3>

                        {/* Metadata tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold text-[11px]">
                            🎓 {res.programmeName || 'MCA'}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-semibold text-[11px]">
                            📅 {res.semesterName || 'Semester 1'}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[11px]">
                            🏷️ Unit {res.unitNumber || 1}
                          </span>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-xl border text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{res.paperName || res.subject || res.courseName}</span>
                        </div>

                        {res.notes && <p className="text-xs text-slate-600 line-clamp-2 italic">{res.notes}</p>}
                      </div>

                      <div className="pt-3 border-t text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span>{res.uploadedAt}</span>
                          <button
                            onClick={() => handleOpenViewersModal(res)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            title="See all students who viewed this resource"
                          >
                            <Users className="w-3 h-3 text-sky-600" />
                            <span>{res.viewCount || 0} Views</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to remove "${res.title}"? This cannot be undone.`)) {
                                const delRes = await deleteLearningResourceAction(res.id);
                                if (delRes.success) {
                                  setToast({ message: 'Material removed successfully.', type: 'success' });
                                  loadAll();
                                } else {
                                  setToast({ message: 'Failed to remove material.', type: 'error' });
                                }
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Remove Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                          <button
                            onClick={() => {
                              setVideoPlayerModal({
                                open: true,
                                title: res.title,
                                url: res.fileUrl,
                                notes: res.notes,
                                paperName: res.paperName || res.subject || res.courseName,
                                semesterName: res.semesterName || 'Semester 1',
                              });
                            }}
                            className={`font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
                              res.fileType === 'Video Link' ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-amber-600 text-white hover:bg-amber-700'
                            }`}
                          >
                            {res.fileType === 'Video Link' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{res.fileType === 'Video Link' ? 'Watch Video' : 'View Resource'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 2: Assessments */}
      {activeTab === 'assessments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Subjective Section
                </span>
                <span className="text-xs text-slate-400">PU-LMS Evaluation System</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Subjective Course Assessments</h2>
              <p className="text-xs text-slate-500">Create, edit, publish/unpublish, and view subjective assessment submissions.</p>
            </div>
            <button onClick={() => setAssModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow cursor-pointer transition-colors">
              <Plus className="w-4 h-4" />
              <span>+ Create Subjective Assessment</span>
            </button>
          </div>

          <div className="space-y-4">
            {assessments.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">No assessments created yet.</p>
            ) : (
              assessments.map((ass) => (
                <div key={ass.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{ass.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${ass.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {ass.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{ass.courseName} • Date: {ass.date} • Duration: {ass.duration} • Total Questions / Marks: {ass.maxMarks}</p>
                    <p className="text-xs text-slate-600 mt-1">{ass.instructions}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleOpenAssessmentSubmissions(ass)} className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Student Results</span>
                    </button>
                    <button onClick={async () => { await toggleAssessmentPublishAction(ass.id); loadAll(); }} className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50">
                      {ass.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={async () => { await deleteAssessmentAction(ass.id); loadAll(); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Objective Assignments & Submissions Management */}
      {activeTab === 'assignments' && (() => {
        // Faculty's permitted assignments
        const facultyAssignments = assignments.filter(
          (a) => user?.role === 'ADMIN' || courses.some((c) => c.id === a.courseId || c.name === a.courseName)
        );

        // Compute all student submission rows (including Not Submitted students)
        const allSubmissionRows = (() => {
          const rows: {
            key: string;
            assignmentId: string;
            assignmentTitle: string;
            unitNumber: number | string;
            unitName: string;
            courseId: string;
            courseName: string;
            dueDate: string;
            maxMarks: number;
            studentId: string;
            studentName: string;
            studentRegisterNumber: string;
            studentEmail?: string;
            submissionDate?: string;
            fileUrl?: string;
            fileName?: string;
            fileSize?: string;
            comments?: string;
            marks?: number;
            feedback?: string;
            status: 'Not Submitted' | 'Submitted' | 'Late Submission' | 'Reviewed';
            isLate: boolean;
          }[] = [];

          facultyAssignments.forEach((asg) => {
            students.forEach((stud) => {
              const sub = asg.submissions.find((s) => s.studentId === stud.id);
              const unitNum = asg.unitNumber || 1;
              const unitName = asg.unitName || (typeof unitNum === 'number' ? `Unit ${unitNum}` : `${unitNum}`);
              const regNo = stud.studentId || stud.id;

              if (sub) {
                const isLate = sub.status === 'Late Submission' || sub.status === 'Late';
                let statusLabel: 'Submitted' | 'Late Submission' | 'Reviewed' = isLate ? 'Late Submission' : 'Submitted';
                if (sub.marks !== undefined || sub.status === 'Reviewed' || sub.status === 'Evaluated') {
                  statusLabel = 'Reviewed';
                }

                rows.push({
                  key: `${asg.id}_${stud.id}`,
                  assignmentId: asg.id,
                  assignmentTitle: asg.title,
                  unitNumber: unitNum,
                  unitName,
                  courseId: asg.courseId,
                  courseName: asg.courseName,
                  dueDate: asg.dueDate,
                  maxMarks: asg.maxMarks,
                  studentId: stud.id,
                  studentName: stud.name,
                  studentRegisterNumber: regNo,
                  studentEmail: stud.email,
                  submissionDate: sub.submissionDate,
                  fileUrl: sub.fileUrl,
                  fileName: sub.fileName || sub.fileUrl?.split('/').pop() || 'Assignment_Submission.pdf',
                  fileSize: sub.fileSize,
                  comments: sub.comments,
                  marks: sub.marks,
                  feedback: sub.feedback,
                  status: statusLabel,
                  isLate,
                });
              } else {
                rows.push({
                  key: `${asg.id}_${stud.id}`,
                  assignmentId: asg.id,
                  assignmentTitle: asg.title,
                  unitNumber: unitNum,
                  unitName,
                  courseId: asg.courseId,
                  courseName: asg.courseName,
                  dueDate: asg.dueDate,
                  maxMarks: asg.maxMarks,
                  studentId: stud.id,
                  studentName: stud.name,
                  studentRegisterNumber: regNo,
                  studentEmail: stud.email,
                  status: 'Not Submitted',
                  isLate: false,
                });
              }
            });
          });

          return rows;
        })();

        // KPI Summary Metrics
        const totalAssignments = facultyAssignments.length;
        const totalStudents = students.length;
        const submittedRows = allSubmissionRows.filter((r) => r.status !== 'Not Submitted');
        const submittedCount = submittedRows.filter((r) => r.status === 'Submitted' || r.status === 'Late Submission').length;
        const reviewedCount = submittedRows.filter((r) => r.status === 'Reviewed').length;
        const notSubmittedCount = allSubmissionRows.filter((r) => r.status === 'Not Submitted').length;
        const pendingReviewCount = submittedRows.filter((r) => r.status !== 'Reviewed').length;

        const totalExpected = allSubmissionRows.length || 1;
        const submissionRate = Math.round((submittedRows.length / totalExpected) * 100);
        const reviewRate = submittedRows.length > 0 ? Math.round((reviewedCount / submittedRows.length) * 100) : 0;

        // Filtered Assignments for View 1
        const filteredAssignments = facultyAssignments.filter((asg) => {
          const matchCourse = asgFilterCourse === 'ALL' || asg.courseId === asgFilterCourse;
          const matchUnit = asgFilterUnit === 'ALL' || String(asg.unitNumber) === asgFilterUnit;
          const matchSearch =
            !asgSearchQuery.trim() ||
            asg.title.toLowerCase().includes(asgSearchQuery.toLowerCase()) ||
            asg.courseName.toLowerCase().includes(asgSearchQuery.toLowerCase());
          return matchCourse && matchUnit && matchSearch;
        });

        // Filtered Submissions for View 2
        const filteredSubmissions = allSubmissionRows.filter((row) => {
          const matchCourse = subFilterCourse === 'ALL' || row.courseId === subFilterCourse;
          const matchAsg = subFilterAssignment === 'ALL' || row.assignmentId === subFilterAssignment;
          const matchUnit = subFilterUnit === 'ALL' || String(row.unitNumber) === subFilterUnit;
          const matchStatus = subFilterStatus === 'ALL' || row.status === subFilterStatus;
          const matchSearch =
            !subSearchQuery.trim() ||
            row.studentName.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
            row.studentRegisterNumber.toLowerCase().includes(subSearchQuery.toLowerCase());
          return matchCourse && matchAsg && matchUnit && matchStatus && matchSearch;
        });

        return (
          <div className="space-y-6">
            {/* 1. ASSIGNMENT DASHBOARD SUMMARY (Requirement 5) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                      Objective Assignments Module
                    </span>
                    <span className="text-xs text-slate-400">PU-LMS Academic Portal</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Assignment Dashboard & Submission Monitoring
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage unit-wise objective assignments, monitor student uploads, and evaluate submissions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCreateAssignment}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Objective Assignment</span>
                  </button>
                </div>
              </div>

              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Assignments</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">{totalAssignments}</span>
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Active Modules</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Students</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
                    <Users className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Enrolled Learners</span>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Submitted</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-blue-900">{submittedCount}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold mt-1">On-Time Submissions</span>
                </div>

                <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Not Submitted</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-rose-900">{notSubmittedCount}</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold mt-1">Pending Submissions</span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-900">{pendingReviewCount}</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold mt-1">Awaiting Evaluation</span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Reviewed</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-900">{reviewedCount}</span>
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1">Marks & Feedback Given</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Overall Submission Completion Progress</span>
                    <span className="font-extrabold text-blue-700">{submissionRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, submissionRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{submittedRows.length} Received</span>
                    <span>{totalExpected} Total Expected</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Faculty Review & Grading Progress</span>
                    <span className="font-extrabold text-emerald-700">{reviewRate}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, reviewRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{reviewedCount} Evaluated</span>
                    <span>{submittedRows.length} Total Submissions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SUB-VIEW SWITCHER BUTTONS */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
              <button
                type="button"
                onClick={() => setAssignmentSubTab('assignments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  assignmentSubTab === 'assignments'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Objective Assignments ({facultyAssignments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentSubTab('submissions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  assignmentSubTab === 'submissions'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Student Submissions Management ({allSubmissionRows.length})</span>
                {pendingReviewCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
                    {pendingReviewCount}
                  </span>
                )}
              </button>
            </div>

            {/* VIEW 1: OBJECTIVE ASSIGNMENTS LIST */}
            {assignmentSubTab === 'assignments' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Course Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Subject:</span>
                      <select
                        value={asgFilterCourse}
                        onChange={(e) => setAsgFilterCourse(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="ALL">All Assigned Courses</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Unit:</span>
                      <select
                        value={asgFilterUnit}
                        onChange={(e) => setAsgFilterUnit(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="ALL">All Units</option>
                        <option value="1">Unit 1</option>
                        <option value="2">Unit 2</option>
                        <option value="3">Unit 3</option>
                        <option value="4">Unit 4</option>
                        <option value="5">Unit 5</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search assignment title..."
                      value={asgSearchQuery}
                      onChange={(e) => setAsgSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Assignment Cards */}
                {filteredAssignments.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700">No Objective Assignments Found</p>
                    <p className="text-xs">
                      {facultyAssignments.length === 0
                        ? 'Click "+ Create Objective Assignment" to create your first objective assignment with all 10 required fields.'
                        : 'No assignments match the selected course or unit filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredAssignments.map((asg) => {
                      const asgRows = allSubmissionRows.filter((r) => r.assignmentId === asg.id);
                      const subCount = asgRows.filter((r) => r.status !== 'Not Submitted').length;
                      const lateCount = asgRows.filter((r) => r.status === 'Late Submission').length;
                      const revCount = asgRows.filter((r) => r.status === 'Reviewed').length;
                      const notSubCount = asgRows.filter((r) => r.status === 'Not Submitted').length;

                      const isPastDue = asg.dueDate ? new Date(asg.dueDate) < new Date() : false;

                      return (
                        <div
                          key={asg.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {asg.unitName || `Unit ${asg.unitNumber || 1}`}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800">
                                  {asg.courseName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                  Objective Assignment
                                </span>
                                {asg.allowResubmission && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Resubmissions Allowed
                                  </span>
                                )}
                              </div>
                              <h3 className="font-black text-slate-900 text-base">{asg.title}</h3>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setSubFilterAssignment(asg.id);
                                  setAssignmentSubTab('submissions');
                                }}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>Submissions ({subCount})</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditAssignment(asg)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Edit Assignment"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete assignment "${asg.title}"?`)) {
                                    await deleteAssignmentAction(asg.id);
                                    loadAll();
                                  }
                                }}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                title="Delete Assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Description & Detailed Instructions */}
                          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                            {asg.description && (
                              <p className="font-semibold text-slate-800">
                                <strong>Description:</strong> {asg.description}
                              </p>
                            )}
                            {asg.detailedDescription && (
                              <div className="pt-1 text-slate-600 whitespace-pre-line leading-relaxed">
                                <strong>Detailed Instructions:</strong> {asg.detailedDescription}
                              </div>
                            )}
                            {asg.additionalInstructions && (
                              <p className="text-amber-800 italic pt-1">
                                <strong>Note:</strong> {asg.additionalInstructions}
                              </p>
                            )}
                          </div>

                          {/* Attached Resources */}
                          {(asg.attachmentUrl || (asg.resources && asg.resources.length > 0)) && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Attached Resources:</span>
                              {asg.attachmentUrl && (
                                <a
                                  href={asg.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5 text-sky-600" />
                                  <span>{asg.resources?.[0]?.name || asg.attachmentUrl.split('/').pop() || 'Download Resource'}</span>
                                  {asg.resources?.[0]?.size && (
                                    <span className="text-[10px] text-sky-500">({asg.resources[0].size})</span>
                                  )}
                                </a>
                              )}
                            </div>
                          )}

                          {/* Footer Strip with Timing & Submission Metrics */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t text-xs">
                            <div className="flex flex-wrap items-center gap-4 text-slate-500">
                              {asg.startDate && (
                                <span>
                                  <strong>Start:</strong> {asg.startDate.replace('T', ' ')}
                                </span>
                              )}
                              <span className={isPastDue ? 'text-rose-600 font-bold' : ''}>
                                <strong>Due Date:</strong> {asg.dueDate.replace('T', ' ')} {isPastDue && '(Passed)'}
                              </span>
                              <span>
                                <strong>Total Marks:</strong> <strong className="text-slate-900">{asg.maxMarks}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                                {subCount} Submitted {lateCount > 0 && `(${lateCount} Late)`}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                                {notSubCount} Not Submitted
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                {revCount} Reviewed
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: STAFF – STUDENT SUBMISSION MANAGEMENT (Requirement 4) */}
            {assignmentSubTab === 'submissions' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Student Assignment Submissions & Evaluation</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      View submitted and unsubmitted students, inspect uploaded files, assign marks, and provide feedback.
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-200">
                    Showing {filteredSubmissions.length} of {allSubmissionRows.length} Students
                  </span>
                </div>

                {/* Filter Toolbar (Requirement 4: filter by assignment, unit, subject, status, and search) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {/* Subject / Course Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject / Course</label>
                    <select
                      value={subFilterCourse}
                      onChange={(e) => setSubFilterCourse(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ALL">All Subjects</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assignment Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Assignment</label>
                    <select
                      value={subFilterAssignment}
                      onChange={(e) => setSubFilterAssignment(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ALL">All Assignments</option>
                      {facultyAssignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.unitName || `Unit ${a.unitNumber || 1}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit Number</label>
                    <select
                      value={subFilterUnit}
                      onChange={(e) => setSubFilterUnit(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ALL">All Units</option>
                      <option value="1">Unit 1</option>
                      <option value="2">Unit 2</option>
                      <option value="3">Unit 3</option>
                      <option value="4">Unit 4</option>
                      <option value="5">Unit 5</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Submission Status</label>
                    <select
                      value={subFilterStatus}
                      onChange={(e) => setSubFilterStatus(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Submitted">Submitted (On-Time)</option>
                      <option value="Late Submission">Late Submission</option>
                      <option value="Reviewed">Reviewed / Evaluated</option>
                      <option value="Not Submitted">Not Submitted</option>
                    </select>
                  </div>

                  {/* Student Search */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Student</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Name or Register No..."
                        value={subSearchQuery}
                        onChange={(e) => setSubSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="p-3.5">Student Details</th>
                        <th className="p-3.5">Subject / Course</th>
                        <th className="p-3.5">Assignment & Unit</th>
                        <th className="p-3.5">Submission Date & Time</th>
                        <th className="p-3.5">Uploaded File</th>
                        <th className="p-3.5">Comments</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 font-medium italic">
                            No student submissions found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((row) => (
                          <tr key={row.key} className="hover:bg-slate-50/70 transition-colors">
                            {/* Student Details: Name, Register Number */}
                            <td className="p-3.5">
                              <div>
                                <p className="font-bold text-slate-900">{row.studentName}</p>
                                <p className="text-[11px] font-mono font-bold text-indigo-700">
                                  {row.studentRegisterNumber}
                                </p>
                              </div>
                            </td>

                            {/* Subject / Course */}
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800 line-clamp-1">
                                {row.courseName}
                              </span>
                            </td>

                            {/* Assignment & Unit */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 line-clamp-1">{row.assignmentTitle}</span>
                                <span className="inline-block px-2 py-0.2 bg-purple-50 text-purple-700 rounded text-[10px] font-bold">
                                  {row.unitName}
                                </span>
                              </div>
                            </td>

                            {/* Submission Date & Time */}
                            <td className="p-3.5">
                              {row.submissionDate ? (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-slate-700 block">
                                    {row.submissionDate.includes('T')
                                      ? row.submissionDate.split('T')[0] + ' ' + row.submissionDate.split('T')[1].slice(0, 5)
                                      : row.submissionDate}
                                  </span>
                                  {row.isLate && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                      ⚠ Late
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Not Submitted</span>
                              )}
                            </td>

                            {/* Uploaded File */}
                            <td className="p-3.5">
                              {row.fileUrl ? (
                                <a
                                  href={row.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  title="Download / View Submitted File"
                                >
                                  <Download className="w-3.5 h-3.5 text-sky-600" />
                                  <span className="max-w-[120px] truncate">{row.fileName}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Student Comments */}
                            <td className="p-3.5 max-w-[150px]">
                              {row.comments ? (
                                <p className="text-slate-600 truncate italic" title={row.comments}>
                                  "{row.comments}"
                                </p>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* Submission Status */}
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  row.status === 'Reviewed'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : row.status === 'Late Submission'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : row.status === 'Submitted'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {row.status === 'Reviewed' && <Check className="w-3 h-3 text-emerald-600" />}
                                {row.status === 'Late Submission' && <Clock className="w-3 h-3 text-amber-600" />}
                                {row.status === 'Submitted' && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                                {row.status === 'Not Submitted' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                                <span>{row.status}</span>
                                {row.marks !== undefined && (
                                  <span className="ml-1 text-emerald-900 font-extrabold">({row.marks}/{row.maxMarks})</span>
                                )}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right">
                              {row.status !== 'Not Submitted' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewModal({
                                      open: true,
                                      assignmentId: row.assignmentId,
                                      assignmentTitle: row.assignmentTitle,
                                      unitName: row.unitName,
                                      courseName: row.courseName,
                                      maxMarks: row.maxMarks,
                                      studentId: row.studentId,
                                      studentName: row.studentName,
                                      studentRegisterNumber: row.studentRegisterNumber,
                                      submissionDate: row.submissionDate || '',
                                      fileUrl: row.fileUrl || '',
                                      fileName: row.fileName,
                                      comments: row.comments,
                                      currentMarks: row.marks !== undefined ? row.marks : '',
                                      currentFeedback: row.feedback || '',
                                      isLate: row.isLate,
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
                                    row.status === 'Reviewed'
                                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                                  }`}
                                >
                                  {row.status === 'Reviewed' ? 'Re-Evaluate / Marks' : 'Review & Grade'}
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs italic">Awaiting Upload</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab 4: Internal Marks */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Enter & Edit Internal Marks</h2>
          <form onSubmit={handleSaveInternalMark} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course *</label>
              <select value={selectedMarkCourseId} onChange={(e) => setSelectedMarkCourseId(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code}) - {c.semester}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
              <select value={selectedMarkStudentId} onChange={(e) => setSelectedMarkStudentId(e.target.value)} className="w-full p-2.5 border rounded-xl text-sm">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Obtained *</label>
                <input type="number" required value={enterMarks} onChange={(e) => setEnterMarks(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks *</label>
                <input type="number" required value={enterMaxMarks} onChange={(e) => setEnterMaxMarks(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-sm" />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-xl text-sm hover:bg-sky-700 shadow">
              Save Internal Marks
            </button>
          </form>

          {/* Marks Summary List */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-600">Recent Saved Marks</h3>
            {marksList.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-900">{m.studentName}</span> • <span className="text-slate-500">{m.courseName}</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{m.marks} / {m.maxMarks}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Attendance Records & Verification */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Student Attendance Verification & Records</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record class attendance, verify student presence, and review attendance logs across courses.
              </p>
            </div>
            <button
              onClick={() => {
                const initialStatuses: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                students.forEach((s) => {
                  initialStatuses[s.id] = 'Present';
                });
                setRecordAttModal({
                  open: true,
                  courseId: courses[0]?.id || '',
                  date: new Date().toISOString().split('T')[0],
                  studentStatuses: initialStatuses,
                });
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Record Attendance</span>
            </button>
          </div>

          {/* Attendance KPI Summary */}
          {(() => {
            const total = attendanceRecords.length;
            const present = attendanceRecords.filter((a) => a.status === 'Present').length;
            const absent = attendanceRecords.filter((a) => a.status === 'Absent').length;
            const late = attendanceRecords.filter((a) => a.status === 'Late').length;
            const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Total Attendance Logs</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase">Overall Attendance</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{presentRate}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-[11px] font-bold text-blue-700 uppercase">Present Count</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">{present}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <p className="text-[11px] font-bold text-rose-700 uppercase">Absent Count</p>
                  <p className="text-2xl font-black text-rose-700 mt-1">{absent}</p>
                </div>
              </div>
            );
          })()}

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={attSearch}
                onChange={(e) => setAttSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            <select
              value={attCourseFilter}
              onChange={(e) => setAttCourseFilter(e.target.value)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Courses / Papers</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.code}</option>
              ))}
            </select>

            <select
              value={attStatusFilter}
              onChange={(e) => setAttStatusFilter(e.target.value as any)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
              <option value="Late">Late Only</option>
            </select>

            <input
              type="date"
              value={attDateFilter}
              onChange={(e) => setAttDateFilter(e.target.value)}
              className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
              title="Filter by date"
            />
          </div>

          {/* Attendance Records Table */}
          {(() => {
            const filtered = attendanceRecords.filter((att) => {
              if (attCourseFilter !== 'ALL' && att.courseId !== attCourseFilter) return false;
              if (attStatusFilter !== 'ALL' && att.status !== attStatusFilter) return false;
              if (attDateFilter && att.date !== attDateFilter) return false;
              if (attSearch.trim()) {
                const q = attSearch.toLowerCase();
                if (!att.studentName.toLowerCase().includes(q)) return false;
              }
              return true;
            });

            return (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <span>Showing <strong className="text-slate-800">{filtered.length}</strong> of {attendanceRecords.length} records</span>
                  {(attCourseFilter !== 'ALL' || attStatusFilter !== 'ALL' || attDateFilter || attSearch) && (
                    <button
                      onClick={() => {
                        setAttCourseFilter('ALL');
                        setAttStatusFilter('ALL');
                        setAttDateFilter('');
                        setAttSearch('');
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Course / Paper</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Attendance Status</th>
                        <th className="px-4 py-3 text-right">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">{att.studentName}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{att.courseName}</td>
                          <td className="px-4 py-3 text-slate-500">{att.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                att.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : att.status === 'Late'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {att.status === 'Present' ? '✓ Present' : att.status === 'Late' ? '⏱ Late' : '✗ Absent'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 font-medium">{att.recordedBy || 'Faculty'}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                            No attendance records matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 5: Class Schedule & Live Virtual Classes */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                <span>Live Virtual Classes & Class Schedules</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Schedule Google Meet live classes, manage sessions in real time, take attendance, and notify students.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  const initialStatuses: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                  students.forEach((s) => {
                    initialStatuses[s.id] = 'Present';
                  });
                  setRecordAttModal({
                    open: true,
                    courseId: courses[0]?.id || '',
                    date: new Date().toISOString().split('T')[0],
                    studentStatuses: initialStatuses,
                  });
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Record Attendance</span>
              </button>

              <button
                onClick={handleOpenCreateSchedule}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Live Class</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setScheduleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                scheduleFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Sessions ({schedules.length})
            </button>
            <button
              onClick={() => setScheduleFilter('Live')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                scheduleFilter === 'Live'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Live Now ({schedules.filter((s) => s.status === 'Live').length})</span>
            </button>
            <button
              onClick={() => setScheduleFilter('Upcoming')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                scheduleFilter === 'Upcoming'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Upcoming ({schedules.filter((s) => s.status === 'Upcoming').length})</span>
            </button>
            <button
              onClick={() => setScheduleFilter('Completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                scheduleFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed ({schedules.filter((s) => s.status === 'Completed').length})</span>
            </button>
          </div>

          {/* Schedule Cards */}
          {(() => {
            const filtered = schedules.filter((s) => {
              if (scheduleFilter === 'all') return true;
              return s.status === scheduleFilter;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-12 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed">
                  No {scheduleFilter !== 'all' ? scheduleFilter.toLowerCase() : ''} classes or sessions found. Click "Schedule Live Class" above to set one up.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((sch) => (
                  <div
                    key={sch.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                      sch.status === 'Live'
                        ? 'border-rose-300 bg-rose-50/30 shadow-md ring-1 ring-rose-300'
                        : 'border-slate-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {sch.status === 'Live' ? (
                            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                              <Radio className="w-3.5 h-3.5 text-rose-600" />
                              <span>LIVE NOW</span>
                            </span>
                          ) : sch.status === 'Completed' ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>Upcoming</span>
                            </span>
                          )}

                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-700">
                            {sch.classType}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSchedule(sch)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete the schedule for "${sch.courseName}"?`)) {
                                const del = await deleteScheduleAction(sch.id);
                                if (del.success) {
                                  setToast({ message: 'Schedule deleted.', type: 'success' });
                                  loadAll();
                                } else {
                                  setToast({ message: 'Failed to delete schedule.', type: 'error' });
                                }
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug">{sch.courseName}</h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> {sch.subject}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> {sch.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {sch.startTime} - {sch.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          📍 {sch.room}
                        </span>
                      </div>

                      {/* Live Meeting Link Box */}
                      {sch.meetingLink && (
                        <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50/60 rounded-xl border border-sky-100 space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-sky-900 flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-sky-600" /> Virtual Classroom Link
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(sch.meetingLink || '');
                                setToast({ message: 'Live class link copied to clipboard!', type: 'success' });
                              }}
                              className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 text-[10px] bg-white px-2 py-0.5 rounded shadow-xs"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-slate-600 truncate">{sch.meetingLink}</span>
                            <a
                              href={sch.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Start / Join Class</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleLiveStatus(sch)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                          sch.status === 'Live'
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {sch.status === 'Live' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>End Live Session</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3.5 h-3.5 text-rose-200" />
                            <span>Go Live Now 🔴</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const initialStatuses: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                          students.forEach((s) => {
                            initialStatuses[s.id] = 'Present';
                          });
                          setRecordAttModal({
                            open: true,
                            schedule: sch,
                            courseId: sch.courseId,
                            date: sch.date || new Date().toISOString().split('T')[0],
                            studentStatuses: initialStatuses,
                          });
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Take Attendance</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Quick Attendance Navigation Banner */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">Looking for full student attendance logs & verification records?</span>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Open Attendance Management →</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Announcements */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-600" />
                <span>Course & Department Announcements</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Publish notices and circulars directly to students enrolled in your courses.
              </p>
            </div>
            <button
              onClick={() => setAnnModal({ open: true, title: '', description: '', isImportant: false })}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {ann.isImportant && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded uppercase">
                          Important
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">Posted on {ann.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.description}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                No announcements published yet. Click above to post your first announcement.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Resource Interaction & Discussions */}
      {activeTab === 'discussions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <span>Resource Interaction & Discussion Forum</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Engage with learners on uploaded resources, resolve academic inquiries, and lead course discussions.
              </p>
            </div>
            <button
              onClick={() => setNewDiscussionModal({ open: true, courseId: courses[0]?.id || '', title: '', content: '' })}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Start Discussion</span>
            </button>
          </div>

          <div className="space-y-6">
            {discussions.map((d) => (
              <div key={d.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <div className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {d.courseName || d.subject}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{d.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Initiated by <strong className="text-slate-700">{d.authorName}</strong> ({d.authorRole}) • {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {d.replies?.length || 0} replies
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {d.content}
                  </p>
                </div>

                {/* Replies Thread */}
                {d.replies && d.replies.length > 0 && (
                  <div className="space-y-2.5 pl-4 border-l-2 border-teal-100">
                    {d.replies.map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50/80 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-slate-800">{r.authorName} <span className="text-[10px] font-medium text-teal-700">({r.authorRole})</span></span>
                          <span className="text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="text-xs text-slate-600">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={replyTextMap[d.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [d.id]: e.target.value })}
                    placeholder="Reply to learner inquiry..."
                    className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  <button
                    onClick={() => handleReplyDiscussion(d.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
            {discussions.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                No discussion threads yet. Click above to initiate a class discussion or learner inquiry thread.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Student Performance */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Student Performance & Academic Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monitor student academic standing, assignment completion rates, internal marks, and attendance compliance across your courses.
            </p>
          </div>

          {/* Computed Student Performance Data */}
          {(() => {
            const performanceList = students.map((stud) => {
              // Attendance stats
              const studAttRecords = attendanceRecords.filter((a) => a.studentId === stud.id || a.studentName === stud.name);
              const attTotal = studAttRecords.length;
              const attPresent = studAttRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
              const attRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 85;

              // Assignment stats
              const relevantAssignments = assignments.filter((asg) =>
                perfCourseFilter === 'ALL' || asg.courseId === perfCourseFilter
              );
              const totalAsg = relevantAssignments.length;
              const submittedAsg = relevantAssignments.filter((asg) =>
                asg.submissions?.some((sub) => sub.studentId === stud.id || sub.studentName === stud.name)
              ).length;
              const asgRate = totalAsg > 0 ? Math.round((submittedAsg / totalAsg) * 100) : 100;

              // Internal Marks stats
              const studMarks = marksList.filter(
                (m) =>
                  (m.studentId === stud.id || m.studentName === stud.name) &&
                  (perfCourseFilter === 'ALL' || m.courseId === perfCourseFilter)
              );
              const marksSum = studMarks.reduce((acc, m) => acc + (m.marks || 0), 0);
              const marksMaxSum = studMarks.reduce((acc, m) => acc + (m.maxMarks || 25), 0);
              const marksPct = marksMaxSum > 0 ? Math.round((marksSum / marksMaxSum) * 100) : 78;

              // Composite: 40% Marks, 30% Assignments, 30% Attendance
              const compositeScore = Math.round(marksPct * 0.4 + asgRate * 0.3 + attRate * 0.3);
              const standing = compositeScore >= 80 ? 'Excellent' : compositeScore >= 60 ? 'Good' : 'Needs Support';

              return {
                student: stud,
                attTotal,
                attPresent,
                attRate,
                totalAsg,
                submittedAsg,
                asgRate,
                marksSum,
                marksMaxSum,
                marksPct,
                compositeScore,
                standing,
              };
            });

            const filteredPerf = performanceList.filter((item) => {
              if (perfStandingFilter !== 'ALL' && item.standing !== perfStandingFilter) return false;
              if (perfSearch.trim()) {
                const q = perfSearch.toLowerCase();
                const matchName = item.student.name.toLowerCase().includes(q);
                const matchId = item.student.studentId?.toLowerCase().includes(q);
                if (!matchName && !matchId) return false;
              }
              return true;
            });

            const avgComposite = performanceList.length > 0
              ? Math.round(performanceList.reduce((acc, p) => acc + p.compositeScore, 0) / performanceList.length)
              : 0;
            const topCount = performanceList.filter((p) => p.standing === 'Excellent').length;
            const avgAtt = performanceList.length > 0
              ? Math.round(performanceList.reduce((acc, p) => acc + p.attRate, 0) / performanceList.length)
              : 0;

            return (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Enrolled Students</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{performanceList.length}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase">Top Performers (≥80%)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{topCount}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <p className="text-[11px] font-bold text-indigo-700 uppercase">Avg Performance</p>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{avgComposite}%</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <p className="text-[11px] font-bold text-amber-700 uppercase">Avg Attendance Rate</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">{avgAtt}%</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student by name or Roll No..."
                      value={perfSearch}
                      onChange={(e) => setPerfSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  <select
                    value={perfCourseFilter}
                    onChange={(e) => setPerfCourseFilter(e.target.value)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Assigned Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.code}</option>
                    ))}
                  </select>

                  <select
                    value={perfStandingFilter}
                    onChange={(e) => setPerfStandingFilter(e.target.value as any)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">All Academic Standings</option>
                    <option value="Excellent">Top Performers (Excellent ≥80%)</option>
                    <option value="Good">Satisfactory (Good 60-79%)</option>
                    <option value="Needs Support">Needs Support (&lt;60%)</option>
                  </select>
                </div>

                {/* Performance Table */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 flex justify-between items-center">
                    <span>Showing <strong className="text-slate-800">{filteredPerf.length}</strong> of {performanceList.length} students</span>
                    {(perfCourseFilter !== 'ALL' || perfStandingFilter !== 'ALL' || perfSearch) && (
                      <button
                        onClick={() => {
                          setPerfCourseFilter('ALL');
                          setPerfStandingFilter('ALL');
                          setPerfSearch('');
                        }}
                        className="text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Roll No / ID</th>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Attendance Rate</th>
                          <th className="px-4 py-3">Assignments Done</th>
                          <th className="px-4 py-3">Internal Marks</th>
                          <th className="px-4 py-3">Overall Score</th>
                          <th className="px-4 py-3 text-right">Standing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredPerf.map((p) => (
                          <tr key={p.student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-500 text-[11px]">
                              {p.student.studentId || p.student.id}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900 block">{p.student.name}</span>
                              {p.student.programme && (
                                <span className="text-[10px] text-slate-400">{p.student.programme}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full ${p.attRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${p.attRate}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-700 text-[11px]">{p.attRate}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-slate-800">
                                {p.submittedAsg} / {p.totalAsg || 1}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">({p.asgRate}%)</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900">
                                {p.marksMaxSum > 0 ? `${p.marksSum}/${p.marksMaxSum}` : 'Evaluated'}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">({p.marksPct}%)</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-black text-slate-800">{p.compositeScore}%</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                  p.standing === 'Excellent'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : p.standing === 'Good'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {p.standing === 'Excellent' ? '★ Distinction' : p.standing === 'Good' ? '✓ Satisfactory' : '⚠ Support Needed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredPerf.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                              No students found matching current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-4xl">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Course Coordinator / Faculty Profile</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Personal credentials, coordinator assignment, and teaching responsibilities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0">
              {(user?.name || 'F').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{user?.name || 'Faculty Member'}</h3>
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0">
                  Course Coordinator
                </span>
              </div>
              <p className="text-xs text-slate-500">{user?.email || 'faculty@periyaruniversity.ac.in'}</p>
              <p className="text-xs font-medium text-slate-600 pt-1">
                Centre for Distance and Online Education • Periyar University
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Assigned Teaching Papers</p>
              <p className="text-base font-bold text-slate-800">{courses.length} Papers Assigned</p>
              <p className="text-xs text-slate-500">{courses.map((c) => c.name).join(', ') || 'No papers allocated yet'}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Uploaded Course Materials</p>
              <p className="text-base font-bold text-slate-800">{resources.length} Learning Resources</p>
              <p className="text-xs text-slate-500">Videos, lecture notes, syllabus study material</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Active Assessments & Assignments</p>
              <p className="text-base font-bold text-slate-800">{assessments.length + assignments.length} Items</p>
              <p className="text-xs text-slate-500">{assessments.length} Quizzes • {assignments.length} Assignments</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Account Status</p>
              <p className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active & Verified</span>
              </p>
              <p className="text-xs text-slate-500">Authorized for Course Coordination & Evaluation</p>
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {resModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button onClick={() => setResModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 border-b pb-3">
              <Video className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingResourceId ? 'Edit Video / Learning Resource' : 'Upload Video / Learning Resource'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingResourceId ? 'Update material details, video link, or notes' : 'Categorize and share material with your enrolled students'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-sm">
              {/* Drag & Drop Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Drag & Drop Video or File *</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                      : draggedFileDetails
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-slate-300 bg-slate-50/50 hover:border-amber-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelectChange}
                    accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg"
                    className="hidden"
                  />

                  {draggedFileDetails ? (
                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200 shadow-sm text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left truncate">
                          <p className="font-bold text-slate-900 truncate">{draggedFileDetails.name}</p>
                          <p className="text-[11px] text-slate-400">{draggedFileDetails.size} • Video / Resource file attached</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraggedFileDetails(null);
                          setResFileUrl('');
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-1">
                      <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Drag & Drop your video or resource file here</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">or click to browse from device (MP4, WEBM, MOV, PDF)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File / Content Type (Select PDF or Video) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content / File Type *</label>
                <select
                  value={resFileType}
                  onChange={(e) => setResFileType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                >
                  <option value="Video Link">🎬 Video Link (Lecture Video / YouTube / MP4)</option>
                  <option value="PDF">📄 PDF Study Material</option>
                  <option value="Document">📁 Document / Presentation</option>
                  <option value="Notes">📝 Lecture Notes</option>
                  <option value="Image">🖼️ Diagram / Image</option>
                </select>
              </div>

              {/* Program Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Program *</label>
                <select
                  value={resProgramId}
                  onChange={(e) => {
                    setResProgramId(e.target.value);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                >
                  {allPrograms.length === 0 ? (
                    <option value="">MCA (Master of Computer Applications)</option>
                  ) : (
                    allPrograms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Semester Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Semester *</label>
                <select
                  value={resSemesterName}
                  onChange={(e) => setResSemesterName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                </select>
              </div>

              {/* Paper Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Paper / Course Subject *</label>
                <select
                  value={resPaperId}
                  onChange={(e) => setResPaperId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                >
                  {(() => {
                    const filteredPapers = allPapers.filter((p) => {
                      const matchProg = !resProgramId || p.programmeId === resProgramId;
                      const matchSem = !resSemesterName || p.semesterName === resSemesterName;
                      return matchProg && matchSem;
                    });

                    const listToUse = filteredPapers.length > 0 ? filteredPapers : (allPapers.length > 0 ? allPapers : []);

                    if (listToUse.length === 0) {
                      return courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ));
                    }

                    return listToUse.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.semesterName}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Unit Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Unit (Unit 1 to 5) *</label>
                <select
                  value={resUnitNumber}
                  onChange={(e) => setResUnitNumber(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 font-medium text-slate-800"
                >
                  <option value={1}>Unit 1</option>
                  <option value={2}>Unit 2</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                  <option value={5}>Unit 5</option>
                </select>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video / Resource Title *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Unit 1 Lecture - DBMS Architecture & ER Diagrams"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              {/* File Link or URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Link or URL *</label>
                <input
                  type="text"
                  required
                  value={resFileUrl}
                  onChange={(e) => setResFileUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?... or uploaded file link"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800 font-mono text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Video Description (Optional)</label>
                <textarea
                  rows={3}
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="Key topics covered in this video lecture..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-md transition-all">
                {editingResourceId ? 'Update & Save Changes' : 'Upload & Save Resource'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {assModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button onClick={() => setAssModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="border-b pb-3">
              <h3 className="text-xl font-bold text-slate-900">Create & Publish Assessment</h3>
              <p className="text-xs text-slate-500 mt-0.5">Create manual questions or import questions directly using an Excel file.</p>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-6 text-sm">
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course *</label>
                  <select value={assCourseId} onChange={(e) => setAssCourseId(e.target.value)} className="w-full p-2.5 border rounded-xl bg-white text-slate-800">
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Quiz - Unit 1 & 2"
                    value={assTitle}
                    onChange={(e) => setAssTitle(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60 Minutes"
                    value={assDuration}
                    onChange={(e) => setAssDuration(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Date *</label>
                  <input
                    type="date"
                    required
                    value={assDate}
                    onChange={(e) => setAssDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Description</label>
                  <textarea
                    rows={2}
                    placeholder="General instructions for students before starting assessment..."
                    value={assInstructions}
                    onChange={(e) => setAssInstructions(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* 2 Creation Method Tabs */}
              <div className="space-y-4">
                <div className="flex border-b">
                  <button
                    type="button"
                    onClick={() => setAssCreationMethod('manual')}
                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                      assCreationMethod === 'manual'
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Method 1: Manual Question Creation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssCreationMethod('excel')}
                    className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                      assCreationMethod === 'excel'
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Method 2: Excel Import</span>
                  </button>
                </div>

                {/* METHOD A: MANUAL CREATION */}
                {assCreationMethod === 'manual' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl">
                      <span className="text-xs font-bold text-slate-700">
                        Total Questions: <span className="text-emerald-700">{assQuestionsList.length}</span> (1 mark per question)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddQuestionField}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                      {assQuestionsList.map((q, qIndex) => (
                        <div key={q.id || qIndex} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                              Question {qIndex + 1}
                            </span>
                            {assQuestionsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionField(qIndex)}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Question Text *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. What is HTML?"
                              value={q.question}
                              onChange={(e) => handleUpdateQuestionField(qIndex, 'question', e.target.value)}
                              className="w-full p-2 border rounded-lg bg-white text-slate-800 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option A *</label>
                              <input
                                type="text"
                                required
                                placeholder="Programming Language"
                                value={q.optionA}
                                onChange={(e) => handleUpdateQuestionField(qIndex, 'optionA', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white text-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option B *</label>
                              <input
                                type="text"
                                required
                                placeholder="Markup Language"
                                value={q.optionB}
                                onChange={(e) => handleUpdateQuestionField(qIndex, 'optionB', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white text-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option C *</label>
                              <input
                                type="text"
                                required
                                placeholder="Database"
                                value={q.optionC}
                                onChange={(e) => handleUpdateQuestionField(qIndex, 'optionC', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white text-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option D *</label>
                              <input
                                type="text"
                                required
                                placeholder="Operating System"
                                value={q.optionD}
                                onChange={(e) => handleUpdateQuestionField(qIndex, 'optionD', e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white text-slate-800 text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-emerald-800 mb-1">Correct Answer *</label>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => handleUpdateQuestionField(qIndex, 'correctAnswer', e.target.value as any)}
                              className="w-full p-2 border border-emerald-300 rounded-lg bg-emerald-50 text-emerald-900 font-semibold text-xs"
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* METHOD B: EXCEL IMPORT */}
                {assCreationMethod === 'excel' && (
                  <div className="space-y-4">
                    <div className="p-5 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 text-center space-y-3">
                      <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Upload Assessment Excel File</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Ensure columns follow: <strong>Question | Option A | Option B | Option C | Option D | Correct Answer</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => downloadAssessmentTemplate()}
                          className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Excel Template</span>
                        </button>

                        <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-4 h-4" />
                          <span>Choose Excel File</span>
                          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Error Validation Alerts */}
                    {excelErrors.length > 0 && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-800">
                        <div className="flex items-center gap-2 font-bold text-rose-900">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>Excel Validation Errors Found ({excelErrors.length})</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          {excelErrors.map((err, idx) => (
                            <li key={idx} className="font-medium">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Success Alert */}
                    {excelSuccessMsg && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{excelSuccessMsg} You can switch to the Manual tab to review or edit imported questions.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save & Publish Assessment ({assQuestionsList.length} Questions)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Assessment Submissions Modal (Faculty Result View - Requirement 6) */}
      {viewSubmissionsModal?.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewSubmissionsModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-900">Student Results View</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assessment: <strong>{viewSubmissionsModal.assessment?.title}</strong> ({viewSubmissionsModal.assessment?.courseName})
              </p>
            </div>

            {viewSubmissionsModal.submissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">No student submissions recorded for this assessment yet.</div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Assessment</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Correct</th>
                      <th className="p-3">Wrong</th>
                      <th className="p-3">Unanswered</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {viewSubmissionsModal.submissions.map((sub) => {
                      let payload: SubmissionAnswersPayload | null = null;
                      try {
                        payload = JSON.parse(sub.answers);
                      } catch {
                        payload = null;
                      }
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{sub.studentName}</td>
                          <td className="p-3 text-slate-600">{viewSubmissionsModal.assessment?.title}</td>
                          <td className="p-3 font-bold">{sub.score} / {sub.maxMarks}</td>
                          <td className="p-3 font-semibold">{sub.percentage}%</td>
                          <td className="p-3 text-emerald-600 font-semibold">{payload?.correctCount ?? sub.score}</td>
                          <td className="p-3 text-rose-600 font-semibold">{payload?.wrongCount ?? 0}</td>
                          <td className="p-3 text-slate-500 font-semibold">{payload?.unansweredCount ?? 0}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (payload?.status || (sub.percentage >= 40 ? 'PASS' : 'FAIL')) === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {payload?.status || (sub.percentage >= 40 ? 'PASS' : 'FAIL')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenSubmissionDetail(sub)}
                              className="px-3 py-1 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Student Question-wise Result Modal (Requirements 6 & 7) */}
      {viewDetailSubmissionModal?.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewDetailSubmissionModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                Detailed Result: {viewDetailSubmissionModal.submission?.studentName}
              </h3>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
                <span>
                  Score: <strong>{viewDetailSubmissionModal.submission?.score} / {viewDetailSubmissionModal.submission?.maxMarks}</strong>
                </span>
                <span>
                  Percentage: <strong>{viewDetailSubmissionModal.submission?.percentage}%</strong>
                </span>
                <span>
                  Status:{' '}
                  <strong className={viewDetailSubmissionModal.answersPayload?.status === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}>
                    {viewDetailSubmissionModal.answersPayload?.status || 'PASS'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Question-wise Breakdown */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Question-wise Breakdown</h4>

              {viewDetailSubmissionModal.answersPayload?.details?.map((detail, idx) => {
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

      {/* Objective Assignment Modal (Requirement 1: All 10 Fields) */}
      {asgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setAsgModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Objective Section
                </span>
                <span className="text-xs text-slate-400">Assignment Management</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {asgEditingId ? 'Edit Objective Assignment' : 'Create Objective Assignment'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide comprehensive objective assignment details across all 10 required fields.
              </p>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              {/* Field 1: Assignment Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2: Relational Schema & Normalization Objective Problem Set"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>

              {/* Field 2 & Field 3: Unit and Subject/Course Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Unit of Assignment <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={asgUnitNumber}
                    onChange={(e) => setAsgUnitNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                  >
                    <option value="1">Unit 1</option>
                    <option value="2">Unit 2</option>
                    <option value="3">Unit 3</option>
                    <option value="4">Unit 4</option>
                    <option value="5">Unit 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Subject / Course Selection <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={asgCourseId}
                    onChange={(e) => setAsgCourseId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4: Assignment Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Assignment Description (Summary) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Brief synopsis of what this objective assignment covers..."
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>

              {/* Field 5: Detailed Description (Rich Multiline Instructions) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  5. Detailed Description & Complete Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete step-by-step instructions, problem specifications, formatting guidelines, and evaluation rubrics..."
                  value={asgDetailedDesc}
                  onChange={(e) => setAsgDetailedDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 leading-relaxed font-sans"
                />
              </div>

              {/* Field 6: Assignment Resources (Upload / Attach PDF, DOC, DOCX, images, materials) */}
              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <label className="block font-bold text-purple-900">
                  6. Assignment Resources (Attach PDF, Documents, Reference Materials)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>{asgIsUploading ? 'Uploading...' : 'Choose / Upload File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg"
                      onChange={handleAsgFileUpload}
                      className="hidden"
                      disabled={asgIsUploading}
                    />
                  </label>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Or paste external resource URL (PDF, Drive, repository)..."
                      value={asgAttachmentUrl}
                      onChange={(e) => setAsgAttachmentUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {asgAttachmentUrl && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-purple-200 text-xs">
                    <span className="font-semibold text-purple-900 truncate">
                      📎 {asgAttachedFileName || asgAttachmentUrl} {asgAttachedFileSize && `(${asgAttachedFileSize})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAsgAttachmentUrl('');
                        setAsgAttachedFileName('');
                        setAsgAttachedFileSize('');
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-2 text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Field 7 & Field 8: Start Date & Time and Due Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    7. Assignment Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={asgStartDate}
                    onChange={(e) => setAsgStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    8. Assignment Due Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Field 9: Total Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    9. Total Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={asgMaxMarks}
                    onChange={(e) => setAsgMaxMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                  />
                </div>

                {/* Resubmission Toggle (Requirement 3: Prevent duplicate submissions unless explicitly enabled) */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={asgAllowResubmission}
                      onChange={(e) => setAsgAllowResubmission(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Allow Resubmission</span>
                      <span className="text-[10px] text-slate-500">Students can replace submission before due date</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Field 10: Additional Instructions (Optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  10. Additional Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Late submissions will incur a 10% penalty. Ensure all diagrams are clear."
                  value={asgAdditionalInstructions}
                  onChange={(e) => setAsgAdditionalInstructions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setAsgModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                >
                  {asgEditingId ? 'Update Objective Assignment' : 'Save & Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Submission Review & Grading Modal (Requirement 4: Review, marks, feedback, status change to Reviewed) */}
      {reviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Staff Evaluation
                </span>
                <span className="text-xs text-slate-400">{reviewModal.unitName}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">Review Student Submission</h3>
              <p className="text-xs text-slate-500">{reviewModal.assignmentTitle} • {reviewModal.courseName}</p>
            </div>

            {/* Student Info Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                <strong className="text-slate-900 text-sm">{reviewModal.studentName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Register Number</span>
                <strong className="text-indigo-700 font-mono text-sm">{reviewModal.studentRegisterNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Timestamp</span>
                <span className="text-slate-700 font-mono">
                  {reviewModal.submissionDate.includes('T')
                    ? reviewModal.submissionDate.split('T')[0] + ' ' + reviewModal.submissionDate.split('T')[1].slice(0, 5)
                    : reviewModal.submissionDate}
                </span>
                {reviewModal.isLate && (
                  <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Late Submission
                  </span>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Maximum Marks</span>
                <strong className="text-slate-900">{reviewModal.maxMarks} Marks</strong>
              </div>
            </div>

            {/* Uploaded File Link */}
            <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200 text-xs space-y-2">
              <span className="font-bold text-sky-900 block">Uploaded Submission File:</span>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-sky-200">
                <span className="font-mono text-slate-800 truncate font-semibold">
                  📄 {reviewModal.fileName || 'Assignment_Submission.pdf'}
                </span>
                <a
                  href={reviewModal.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Open File</span>
                </a>
              </div>
            </div>

            {/* Student Comments */}
            {reviewModal.comments && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Student Comments:</span>
                <p className="text-slate-700 italic">"{reviewModal.comments}"</p>
              </div>
            )}

            {/* Grading Form */}
            <form onSubmit={handleReviewSubmissionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Marks Awarded (Out of {reviewModal.maxMarks}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={reviewModal.maxMarks}
                  placeholder={`0 - ${reviewModal.maxMarks}`}
                  value={reviewModal.currentMarks}
                  onChange={(e) =>
                    setReviewModal({
                      ...reviewModal,
                      currentMarks: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Feedback & Evaluation Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter constructive feedback, solution remarks, and recommendations for the learner..."
                  value={reviewModal.currentFeedback}
                  onChange={(e) => setReviewModal({ ...reviewModal, currentFeedback: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saving marks and feedback will automatically update the submission status to <strong>Reviewed</strong>.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Save Evaluation & Mark as Reviewed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule & Live Class Modal */}
      {schModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button onClick={() => setSchModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 border-b pb-3">
              <Radio className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingScheduleId ? 'Edit Virtual Class / Schedule' : 'Schedule Live Virtual Class / Session'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingScheduleId ? 'Update meeting details, timings, or virtual link' : 'Set up Google Meet virtual classes or timetable sessions'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Course / Paper *</label>
                <select
                  value={schCourseId}
                  onChange={(e) => setSchCourseId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Lecture Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Advanced SQL & Query Optimization"
                  value={schSubject}
                  onChange={(e) => setSchSubject(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Type *</label>
                  <select
                    value={schClassType}
                    onChange={(e) => setSchClassType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Online Class">🌐 Online Virtual Class</option>
                    <option value="Regular Class">🏫 Regular Offline Class</option>
                    <option value="Lab">💻 Practical / Lab Session</option>
                    <option value="Examination">📝 Examination / Viva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Status *</label>
                  <select
                    value={schStatus}
                    onChange={(e) => setSchStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Upcoming">📅 Upcoming</option>
                    <option value="Live">🔴 Live Now</option>
                    <option value="Completed">✓ Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={schDate}
                    onChange={(e) => setSchDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={schStartTime}
                    onChange={(e) => setSchStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="11:30 AM"
                    value={schEndTime}
                    onChange={(e) => setSchEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Google Meet Virtual Hall or Lab 402"
                  value={schRoom}
                  onChange={(e) => setSchRoom(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Virtual Meeting Link (Google Meet / Zoom)</label>
                  <button
                    type="button"
                    onClick={handleGenerateMeetLink}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    + Generate Google Meet Link
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="https://meet.google.com/..."
                  value={schMeetingLink}
                  onChange={(e) => setSchMeetingLink(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                {editingScheduleId ? 'Update & Save Changes' : 'Schedule Class'}
              </button>
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
              <p className="text-xs text-slate-500 mt-1">Official Detailed Paper Syllabus</p>
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

      {/* Video & Resource Player Modal Overlay (On Same Page) */}
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
                <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase bg-amber-100 text-amber-800 rounded-md flex items-center gap-1">
                  <Video className="w-3 h-3 text-amber-600" /> Resource Preview
                </span>
                {videoPlayerModal.semesterName && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-100 text-indigo-800 rounded-md">
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

            {/* Video / Resource Player Box */}
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
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT CREATION MODAL */}
      {annModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setAnnModal({ ...annModal, open: false })} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                COURSE NOTICE
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">Publish Course Announcement</h3>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Lab Evaluation 2"
                  value={annModal.title}
                  onChange={(e) => setAnnModal({ ...annModal, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed instructions or message for students..."
                  value={annModal.description}
                  onChange={(e) => setAnnModal({ ...annModal, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="annImportant"
                  checked={annModal.isImportant}
                  onChange={(e) => setAnnModal({ ...annModal, isImportant: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <label htmlFor="annImportant" className="font-semibold text-slate-700">
                  Mark as High Priority / Urgent
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition-colors"
              >
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW DISCUSSION TOPIC MODAL */}
      {newDiscussionModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setNewDiscussionModal({ ...newDiscussionModal, open: false })} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800">
                CLASS FORUM
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">Start New Discussion Thread</h3>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Paper / Course *</label>
                <select
                  value={newDiscussionModal.courseId}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discussion Subject / Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Query Optimization Discussion"
                  value={newDiscussionModal.title}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details / Discussion Starter *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Pose a question or topic prompt for learners..."
                  value={newDiscussionModal.content}
                  onChange={(e) => setNewDiscussionModal({ ...newDiscussionModal, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition-colors"
              >
                Post Discussion Thread
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECORD ATTENDANCE MODAL */}
      {recordAttModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setRecordAttModal({ ...recordAttModal, open: false })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                ATTENDANCE ENTRY
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Record Student Attendance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark Present, Absent, or Late for students enrolled in your course session.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Course / Paper *</label>
                <select
                  value={recordAttModal.courseId}
                  onChange={(e) => setRecordAttModal({ ...recordAttModal, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Date *</label>
                <input
                  type="date"
                  value={recordAttModal.date}
                  onChange={(e) => setRecordAttModal({ ...recordAttModal, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                  students.forEach((s) => { updated[s.id] = 'Present'; });
                  setRecordAttModal({ ...recordAttModal, studentStatuses: updated });
                }}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
                  students.forEach((s) => { updated[s.id] = 'Absent'; });
                  setRecordAttModal({ ...recordAttModal, studentStatuses: updated });
                }}
                className="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Mark All Absent
              </button>
            </div>

            {/* Student Attendance Roster Table */}
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Student Name</th>
                    <th className="px-4 py-2.5 text-right">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const currentStatus = recordAttModal.studentStatuses[st.id] || 'Present';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{st.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRecordAttModal({
                                  ...recordAttModal,
                                  studentStatuses: { ...recordAttModal.studentStatuses, [st.id]: 'Present' },
                                });
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRecordAttModal({
                                  ...recordAttModal,
                                  studentStatuses: { ...recordAttModal.studentStatuses, [st.id]: 'Late' },
                                });
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-500 text-white shadow'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRecordAttModal({
                                  ...recordAttModal,
                                  studentStatuses: { ...recordAttModal.studentStatuses, [st.id]: 'Absent' },
                                });
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-400">
                        No students enrolled in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSaveAttendance}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-colors"
            >
              Save Attendance Record
            </button>
          </div>
        </div>
      )}

      {/* Student Viewers Modal */}
      {viewersModal?.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setViewersModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Student View Tracking & Analytics</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">{viewersModal.resourceTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unit {viewersModal.unitNumber || 1} • Complete list of students who have opened, watched, or studied this material.
              </p>
            </div>

            {/* Quick summary stat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  👁️
                </div>
                <div>
                  <div className="text-xl font-extrabold text-amber-950">{viewersModal.viewers.length}</div>
                  <div className="text-[11px] font-semibold text-amber-800">Total Unique Students Viewed</div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  🏷️
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Unit {viewersModal.unitNumber || 1}</div>
                  <div className="text-[11px] font-semibold text-slate-500">Material Unit Category</div>
                </div>
              </div>
            </div>

            {/* Table of students */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              {viewersModal.loading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading student viewing logs...</span>
                </div>
              ) : viewersModal.viewers.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">No students have viewed this resource yet.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">When enrolled students open or watch this material in their portal, their name and viewing timestamp will automatically appear here.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b uppercase text-[10px] font-bold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Reg No / ID</th>
                      <th className="py-2.5 px-3">Viewed Timestamp</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {viewersModal.viewers.map((viewer, idx) => (
                      <tr key={viewer.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{viewer.studentName}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                            {viewer.studentRegNo || viewer.studentId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {viewer.viewedAt ? new Date(viewer.viewedAt).toLocaleString() : 'Recently'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewersModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Remove Material Modal */}
      {quickRemoveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Remove Course Material</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select and remove uploaded videos, PDFs, or documents.</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickRemoveModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search materials to remove..."
                value={removeSearch}
                onChange={(e) => setRemoveSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {resources
                .filter(
                  (r) =>
                    !removeSearch.trim() ||
                    r.title.toLowerCase().includes(removeSearch.toLowerCase()) ||
                    r.paperName?.toLowerCase().includes(removeSearch.toLowerCase()) ||
                    r.courseName?.toLowerCase().includes(removeSearch.toLowerCase())
                )
                .map((res) => (
                  <div
                    key={res.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            res.fileType === 'Video Link'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {res.fileType}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">{res.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {res.paperName || res.courseName || res.subject} • Unit {res.unitNumber || 1} • {res.uploadedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to permanently remove "${res.title}"?`)) {
                          const del = await deleteLearningResourceAction(res.id);
                          if (del.success) {
                            setToast({ message: 'Material removed successfully.', type: 'success' });
                            loadAll();
                          } else {
                            setToast({ message: 'Failed to remove material.', type: 'error' });
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              {resources.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-6">No materials available to remove.</p>
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setQuickRemoveModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
