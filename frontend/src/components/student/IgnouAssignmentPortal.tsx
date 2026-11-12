'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  FileCheck,
  Calendar,
  Building,
  User,
  Mail,
  Shield,
  Clock,
  Printer,
  X,
  ExternalLink,
  Info,
  Check,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileDown,
  RefreshCw,
  Trash2,
  ChevronRight,
  Send,
  GraduationCap,
  Menu,
  LayoutDashboard,
  Landmark,
  Search,
  Folder,
} from 'lucide-react';
import { Toast } from '../ui/Toast';
import {
  compileIgnouAssignmentPdf,
  generateIgnouFilename,
  generateAcknowledgementNumber,
  formatBytes,
  CompiledPdfResult,
} from '@/lib/ignouPdfBuilder';
import {
  submitIgnouAssignmentAction,
  fetchStudentIgnouSubmissionsAction,
} from '@/app/actions/ignouAssignmentActions';
import { CourseItem, AssignmentItem } from '@/lib/db';

export interface IgnouAssignmentPortalProps {
  user: {
    id: string;
    name: string;
    email: string;
    studentId?: string;
    programme?: string;
    semester?: string;
    imageUrl?: string;
  };
  courses: CourseItem[];
  assignments?: AssignmentItem[];
}

// Popular IGNOU Regional Centres for one-click selection
const IGNOU_REGIONAL_CENTRES = [
  { code: '25', name: 'Chennai Regional Centre' },
  { code: '07', name: 'Delhi-1 Regional Centre (South Delhi)' },
  { code: '38', name: 'Delhi-2 Regional Centre (North/East Delhi)' },
  { code: '28', name: 'Kolkata Regional Centre' },
  { code: '16', name: 'Pune Regional Centre' },
  { code: '26', name: 'Cochin Regional Centre' },
  { code: '23', name: 'Hyderabad Regional Centre' },
  { code: '05', name: 'Patna Regional Centre' },
  { code: '13', name: 'Karnal Regional Centre' },
  { code: '08', name: 'Shimla Regional Centre' },
  { code: '32', name: 'Varanasi Regional Centre' },
  { code: '14', name: 'Bhopal Regional Centre' },
  { code: '01', name: 'Bengaluru Regional Centre' },
  { code: '43', name: 'Madurai Regional Centre' },
];

// Default courses conforming to official IGNOU TEE Assignment Dashboard screenshot
const DEFAULT_IGNOU_COURSES: CourseItem[] = [
  {
    id: 'ignou_mco1',
    code: 'MCO1',
    name: 'ORGANIZATION THEORY AND BEHAVIOUR',
    programmeId: 'mcom_ignou',
    programmeName: 'Master of Commerce (M.Com)',
    semester: 'Semester 1',
    subject: 'Organization Theory and Behaviour',
    facultyId: '',
    facultyName: 'Dr. R. Sharma',
    assessment: 'Assignment 30%, Term-End 70%',
    status: 'ACTIVE',
  },
  {
    id: 'ignou_mco21',
    code: 'MCO21',
    name: 'Managerial Economics',
    programmeId: 'mcom_ignou',
    programmeName: 'Master of Commerce (M.Com)',
    semester: 'Semester 1',
    subject: 'Managerial Economics',
    facultyId: '',
    facultyName: 'Dr. P. Sen',
    assessment: 'Assignment 30%, Term-End 70%',
    status: 'ACTIVE',
  },
  {
    id: 'ignou_mco03',
    code: 'MCO03',
    name: 'Research Methodology and Statistical Analysis',
    programmeId: 'mcom_ignou',
    programmeName: 'Master of Commerce (M.Com)',
    semester: 'Semester 1',
    subject: 'Research Methodology and Statistical Analysis',
    facultyId: '',
    facultyName: 'Dr. V. K. Verma',
    assessment: 'Assignment 30%, Term-End 70%',
    status: 'ACTIVE',
  },
  {
    id: 'ignou_mco04',
    code: 'MCO04',
    name: 'Business Environment',
    programmeId: 'mcom_ignou',
    programmeName: 'Master of Commerce (M.Com)',
    semester: 'Semester 1',
    subject: 'Business Environment',
    facultyId: '',
    facultyName: 'Prof. Anjali Rao',
    assessment: 'Assignment 30%, Term-End 70%',
    status: 'ACTIVE',
  },
];

export function IgnouAssignmentPortal({ user, courses, assignments = [] }: IgnouAssignmentPortalProps) {
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter State matching official dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Not Started' | 'Submission Pending' | 'Submitted' | 'Evaluated' | 'Overdue'>('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'samarth'>('dashboard');
  const [samarthModalOpen, setSamarthModalOpen] = useState(false);
  const [viewAssignmentModal, setViewAssignmentModal] = useState<{
    open: boolean;
    course: CourseItem;
    submission?: any;
  } | null>(null);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  // Selected course for preparation
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Filter semester
  const [semFilter, setSemFilter] = useState('ALL');

  // Form State for Step 1 (Cover Page)
  const [learnerName, setLearnerName] = useState(user.name || '');
  const [enrolmentNumber, setEnrolmentNumber] = useState(user.studentId || '2026101452');
  const [studyCentreCode, setStudyCentreCode] = useState('2501');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [regionalCentreCode, setRegionalCentreCode] = useState('25');
  const [regionalCentreName, setRegionalCentreName] = useState('Chennai Regional Centre');
  const [email, setEmail] = useState(user.email || '');
  const examinationSession = 'December 2026';

  // Signature state
  const [signatureType, setSignatureType] = useState<'draw' | 'upload'>('draw');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Step 2: ID Card
  const [idCardDataUrl, setIdCardDataUrl] = useState<string>('');
  const [idCardIsPdf, setIdCardIsPdf] = useState(false);
  const [idCardName, setIdCardName] = useState<string>('');

  // Step 3: Question Paper
  const [questionPaperDataUrl, setQuestionPaperDataUrl] = useState<string>('');
  const [questionPaperIsPdf, setQuestionPaperIsPdf] = useState(false);
  const [questionPaperName, setQuestionPaperName] = useState<string>('');

  // Step 4: Handwritten Answers
  const [handwrittenPages, setHandwrittenPages] = useState<{
    id: string;
    name: string;
    dataUrl: string;
    isPdf: boolean;
    sizeFormatted: string;
  }[]>([]);
  const [confirmedSignedAllPages, setConfirmedSignedAllPages] = useState(false);

  // Step 5: Compiled PDF Result
  const [compiledPdf, setCompiledPdf] = useState<CompiledPdfResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState('');

  // Step 6: Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');

  // Step 7: Acknowledgement Receipt Modal
  const [receiptModal, setReceiptModal] = useState<{
    open: boolean;
    acknowledgementNo: string;
    submissionDate: string;
    courseCode: string;
    courseName: string;
    fileName: string;
    fileSize: string;
    fileUrl?: string;
  } | null>(null);

  // Load existing submissions and default seeds
  const loadSubmissions = async () => {
    setLoadingSubs(true);
    try {
      const res = await fetchStudentIgnouSubmissionsAction();
      if (res.success && res.submissions && Object.keys(res.submissions).length > 0) {
        setSubmissions(res.submissions);
      } else {
        // Seed default submitted assignments to match official IGNOU dashboard screenshot (3 submitted, 1 pending)
        const seed: Record<string, any> = {
          MCO1: {
            courseCode: 'MCO1',
            courseName: 'ORGANIZATION THEORY AND BEHAVIOUR',
            status: 'Submitted',
            submissionDate: '2026-11-12',
            dueDate: '20 November 2026',
            acknowledgementNo: 'IGNOU-2026-DEC-491024',
            fileName: `${user.studentId || '2026101452'}_MCO1.pdf`,
            fileSize: '4.8 MB',
            evaluationMarks: '--',
            progressPercent: 100,
          },
          MCO21: {
            courseCode: 'MCO21',
            courseName: 'Managerial Economics',
            status: 'Submitted',
            submissionDate: '2026-11-12',
            dueDate: '20 November 2026',
            acknowledgementNo: 'IGNOU-2026-DEC-491025',
            fileName: `${user.studentId || '2026101452'}_MCO21.pdf`,
            fileSize: '5.2 MB',
            evaluationMarks: '--',
            progressPercent: 100,
          },
          MCO03: {
            courseCode: 'MCO03',
            courseName: 'Research Methodology and Statistical Analysis',
            status: 'Submitted',
            submissionDate: '2026-11-12',
            dueDate: '20 November 2026',
            acknowledgementNo: 'IGNOU-2026-DEC-491026',
            fileName: `${user.studentId || '2026101452'}_MCO03.pdf`,
            fileSize: '6.1 MB',
            evaluationMarks: '--',
            progressPercent: 100,
          },
        };
        setSubmissions(seed);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Sync user details to cover form
  useEffect(() => {
    if (user) {
      setLearnerName(user.name || '');
      setEnrolmentNumber(user.studentId || '2026101452');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle open preparation modal for a course
  const handleOpenCoursePrep = (crs: CourseItem) => {
    setSelectedCourse(crs);
    setCourseCode(crs.code);
    setCourseName(crs.name);

    // Check if question paper is available from existing assignments
    const matchingAsg = assignments.find(
      (a) => a.courseId === crs.id || a.courseName === crs.name || a.courseName === crs.code
    );
    if (matchingAsg && matchingAsg.attachmentUrl) {
      setQuestionPaperDataUrl(matchingAsg.attachmentUrl);
      setQuestionPaperIsPdf(matchingAsg.attachmentUrl.toLowerCase().endsWith('.pdf'));
      setQuestionPaperName(matchingAsg.attachmentUrl.split('/').pop() || `${crs.code}_QP.pdf`);
    } else {
      setQuestionPaperDataUrl('');
      setQuestionPaperIsPdf(false);
      setQuestionPaperName('');
    }

    // Try loading saved draft from localStorage
    try {
      const draftKey = `ignou_draft_${user.id}_${crs.code}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.studyCentreCode) setStudyCentreCode(parsed.studyCentreCode);
        if (parsed.regionalCentreCode) setRegionalCentreCode(parsed.regionalCentreCode);
        if (parsed.regionalCentreName) setRegionalCentreName(parsed.regionalCentreName);
        if (parsed.confirmedSignedAllPages) setConfirmedSignedAllPages(parsed.confirmedSignedAllPages);
      }
    } catch {}

    setCompiledPdf(null);
    setActiveStep(1);
    setModalOpen(true);
  };

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f274a'; // Navy Blue Ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureDataUrl('');
  };

  // Upload signature image
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload ID Card
  const handleIdCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardName(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setIdCardIsPdf(isPdf);

    const reader = new FileReader();
    reader.onload = (event) => {
      setIdCardDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload Question Paper
  const handleQuestionPaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuestionPaperName(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setQuestionPaperIsPdf(isPdf);

    const reader = new FileReader();
    reader.onload = (event) => {
      setQuestionPaperDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload Handwritten Answer Pages (multiple)
  const handleHandwrittenPagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setHandwrittenPages((prev) => [
          ...prev,
          {
            id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            dataUrl,
            isPdf,
            sizeFormatted: formatBytes(file.size),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeHandwrittenPage = (id: string) => {
    setHandwrittenPages((prev) => prev.filter((p) => p.id !== id));
  };

  // Step 5: Compile into Single PDF
  const handleCompilePdf = async () => {
    if (!learnerName || !enrolmentNumber || !courseCode) {
      setToast({ message: 'Please ensure learner name, enrolment number, and course code are filled.', type: 'error' });
      setActiveStep(1);
      return;
    }

    if (handwrittenPages.length === 0) {
      setToast({ message: 'Please upload at least one scanned page of handwritten answers (Step 4).', type: 'error' });
      setActiveStep(4);
      return;
    }

    setIsCompiling(true);
    setCompileProgress('Initializing PDF engine & embedding Page 1 (Cover Page)...');

    try {
      setCompileProgress('Adding IGNOU Identity Card & Question Paper...');
      const result = await compileIgnouAssignmentPdf({
        coverData: {
          learnerName,
          enrolmentNumber,
          studyCentreCode,
          courseCode,
          courseName,
          regionalCentreCode,
          regionalCentreName,
          email,
          session: examinationSession,
          signatureDataUrl: signatureDataUrl || undefined,
        },
        idCardDataUrlOrBytes: idCardDataUrl || undefined,
        idCardIsPdf,
        questionPaperDataUrlOrBytes: questionPaperDataUrl || undefined,
        questionPaperIsPdf,
        handwrittenPages: handwrittenPages.map((p) => ({
          dataUrlOrBytes: p.dataUrl,
          isPdf: p.isPdf,
        })),
      });

      setCompiledPdf(result);

      if (!result.isValidSize) {
        setToast({
          message: `Warning: Compiled file size is ${result.fileSizeFormatted}, exceeding maximum limit of 20MB (Rule viii). Please compress images before final submission.`,
          type: 'error',
        });
      } else {
        setToast({
          message: `Single PDF "${result.fileName}" compiled successfully (${result.pageCount} pages, ${result.fileSizeFormatted}).`,
          type: 'success',
        });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error compiling PDF.', type: 'error' });
    } finally {
      setIsCompiling(false);
      setCompileProgress('');
    }
  };

  // Step 6: Submit to OAMS
  const handleSubmitAssignment = async () => {
    if (!compiledPdf) {
      setToast({ message: 'Please compile the single PDF before submission.', type: 'error' });
      return;
    }

    if (!compiledPdf.isValidSize) {
      setToast({ message: 'Cannot submit. File size exceeds 20MB limit (Rule viii).', type: 'error' });
      return;
    }

    if (!confirmedSignedAllPages) {
      setToast({ message: 'Please confirm that you have signed on every page of the assignment.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload compiled PDF blob to /api/upload
      const formData = new FormData();
      const file = new File([compiledPdf.blob], compiledPdf.fileName, { type: 'application/pdf' });
      formData.append('file', file);

      let uploadedUrl = '';
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          uploadedUrl = uploadData.url;
        }
      } catch {
        // fallback
      }

      if (!uploadedUrl) {
        // fallback to blob URL or data URL
        uploadedUrl = compiledPdf.blobUrl;
      }

      // 2. Generate unique Acknowledgement Number
      const ackNo = generateAcknowledgementNumber();

      // 3. Call server action to save record in MongoDB
      const res = await submitIgnouAssignmentAction({
        courseId: selectedCourse?.id || courseCode,
        courseCode,
        courseName,
        enrolmentNumber,
        learnerName,
        email,
        studyCentreCode,
        regionalCentreCode,
        regionalCentreName,
        session: examinationSession,
        fileUrl: uploadedUrl,
        fileName: compiledPdf.fileName,
        fileSize: compiledPdf.fileSizeFormatted,
        acknowledgementNo: ackNo,
        pageCount: compiledPdf.pageCount,
        comments: submissionComments,
      });

      if (res.success) {
        setToast({ message: `Assignment submitted successfully! Acknowledgement: ${ackNo}`, type: 'success' });
        setModalOpen(false);

        // Open official receipt modal
        setReceiptModal({
          open: true,
          acknowledgementNo: ackNo,
          submissionDate: res.submissionDate || new Date().toISOString(),
          courseCode,
          courseName,
          fileName: compiledPdf.fileName,
          fileSize: compiledPdf.fileSizeFormatted,
          fileUrl: uploadedUrl,
        });

        // Clear local draft
        try {
          localStorage.removeItem(`ignou_draft_${user.id}_${courseCode}`);
        } catch {}

        loadSubmissions();
      } else {
        setToast({ message: res.error || 'Submission failed.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effective courses (use provided or fallback to 4 official IGNOU courses matching the dashboard screenshot)
  const effectiveCourses = courses && courses.length >= 2 ? courses : DEFAULT_IGNOU_COURSES;

  // Real-time metric counts
  const eligibleCoursesCount = effectiveCourses.length;
  const totalAssignmentsCount = effectiveCourses.length;
  const submittedCount = effectiveCourses.filter((crs) => {
    const s = submissions[crs.code] || submissions[crs.id];
    return s && (s.status === 'Submitted' || s.status === 'Evaluated' || s.status === 'Reviewed');
  }).length;
  const pendingCount = Math.max(0, totalAssignmentsCount - submittedCount);

  // Filter courses by search and status pill
  const filteredCourses = effectiveCourses.filter((crs) => {
    const sub = submissions[crs.code] || submissions[crs.id];
    let crsStatus: 'Not Started' | 'Submission Pending' | 'Submitted' | 'Evaluated' | 'Overdue' = 'Not Started';
    if (sub?.status === 'Evaluated' || sub?.status === 'Reviewed') {
      crsStatus = 'Evaluated';
    } else if (sub?.status === 'Submitted' || sub) {
      crsStatus = 'Submitted';
    } else if (sub?.status === 'Draft' || sub?.status === 'Ready for Submission') {
      crsStatus = 'Submission Pending';
    } else if (sub?.status === 'Overdue') {
      crsStatus = 'Overdue';
    } else {
      crsStatus = 'Not Started';
    }

    if (statusFilter === 'Not Started' && crsStatus !== 'Not Started') return false;
    if (statusFilter === 'Submission Pending' && crsStatus !== 'Submission Pending') return false;
    if (statusFilter === 'Submitted' && crsStatus !== 'Submitted') return false;
    if (statusFilter === 'Evaluated' && crsStatus !== 'Evaluated') return false;
    if (statusFilter === 'Overdue' && crsStatus !== 'Overdue') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = crs.name.toLowerCase().includes(q);
      const matchCode = crs.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    return true;
  });

  const handleViewOrPrepare = (crs: CourseItem) => {
    const sub = submissions[crs.code] || submissions[crs.id];
    if (sub && (sub.status === 'Submitted' || sub.status === 'Evaluated')) {
      setViewAssignmentModal({
        open: true,
        course: crs,
        submission: sub,
      });
    } else {
      handleOpenCoursePrep(crs);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* TOP HEADER: Navy Blue bar matching the IGNOU OAMS screenshot */}
      <header className="bg-[#0e2942] text-white px-4 sm:px-6 py-3 rounded-2xl shadow-md flex items-center justify-between gap-4">
        {/* Left: IGNOU Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-start leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tighter text-white">ignou</span>
                <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center text-[10px] font-bold text-white">
                  <span>☯</span>
                </div>
              </div>
              <span className="text-[7px] tracking-wider uppercase font-semibold text-blue-200">
                THE PEOPLE'S UNIVERSITY
              </span>
            </div>
            <div className="h-6 w-[1px] bg-white/30 mx-1"></div>
            <div className="text-[10px] font-medium leading-tight text-white/90">
              <div className="font-bold">इग्नू</div>
              <div className="text-[7px] text-blue-200">जन-जन का विश्वविद्यालय</div>
            </div>
          </div>
        </div>

        {/* Center: System Title */}
        <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white text-center">
          Online Assignment Management System
        </h1>

        {/* Right: User Avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full bg-white text-[#0e2942] flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
            title={`${user.name} (${user.studentId || enrolmentNumber})`}
          >
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN CONTENT GRID */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT SIDEBAR: MENU */}
        <aside
          className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 w-full transition-all duration-200 ${
            sidebarOpen ? 'lg:w-60 shrink-0' : 'lg:w-16 shrink-0'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {sidebarOpen && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                MENU
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors ml-auto"
              title={sidebarOpen ? 'Collapse menu' : 'Expand menu'}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <nav className="mt-3 space-y-1.5">
            <button
              onClick={() => setActiveMenuTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeMenuTab === 'dashboard'
                  ? 'bg-[#0e4b77] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">Assignment Dashboard</span>}
            </button>

            <button
              onClick={() => setSamarthModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left"
            >
              <Landmark className="w-4 h-4 text-slate-600 shrink-0" />
              {sidebarOpen && <span className="truncate">Samarth Services</span>}
            </button>
          </nav>
        </aside>

        {/* RIGHT MAIN AREA */}
        <main className="flex-1 w-full space-y-5">
          {/* 4 SUMMARY STAT CARDS (Warm Orange, Blue, Red, Teal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Eligible Courses (Ochre / Orange) */}
            <div className="bg-[#d9822b] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <div className="italic text-xs font-medium text-white/90">Eligible Courses</div>
                <div className="text-3xl font-black mt-1 font-sans">{eligibleCoursesCount}</div>
              </div>
              <div className="text-white/80 p-2">
                <Folder className="w-8 h-8" />
              </div>
            </div>

            {/* Card 2: Total Assignments (Vibrant Blue) */}
            <div className="bg-[#1976d2] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <div className="italic text-xs font-medium text-white/90">Total Assignments</div>
                <div className="text-3xl font-black mt-1 font-sans">{totalAssignmentsCount}</div>
              </div>
              <div className="text-white/80 p-2">
                <FileText className="w-8 h-8" />
              </div>
            </div>

            {/* Card 3: Pending Assignment (Coral Red) */}
            <div className="bg-[#db5246] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <div className="italic text-xs font-medium text-white/90">Pending Assignment</div>
                <div className="text-3xl font-black mt-1 font-sans">{pendingCount}</div>
              </div>
              <div className="text-white/80 p-2">
                <Calendar className="w-8 h-8" />
              </div>
            </div>

            {/* Card 4: Submitted Assignments (Teal / Emerald) */}
            <div className="bg-[#178a75] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <div className="italic text-xs font-medium text-white/90">Submitted Assignments</div>
                <div className="text-3xl font-black mt-1 font-sans">{submittedCount}</div>
              </div>
              <div className="text-white/80 p-2">
                <FileCheck className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* MAIN ASSIGNMENTS CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header: Title, Search, and Status Legend */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">Assignments</h2>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Assignment"
                  className="w-full pl-4 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-blue-600 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Status Legend Pills (2x2 grid matching screenshot) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Assignment Not Attempted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>Submission Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Assignment Submitted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>Assignment Evaluated</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
              {[
                { key: 'All', label: 'All' },
                { key: 'Not Started', label: 'Not Started', border: 'border-rose-700 text-rose-700' },
                { key: 'Submission Pending', label: 'Submission Pending', border: 'border-amber-700 text-amber-700' },
                { key: 'Submitted', label: 'Submitted', border: 'border-emerald-700 text-emerald-700' },
                { key: 'Evaluated', label: 'Evaluated', border: 'border-blue-700 text-blue-700' },
                { key: 'Overdue', label: 'Overdue', border: 'border-slate-400 text-slate-600' },
              ].map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#0e4a77] text-white shadow-xs'
                        : `${tab.border || 'border-slate-300 text-slate-600'} bg-white border hover:bg-slate-50`
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 2-Column Grid of Assignment Cards (matching the screenshot exactly) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {filteredCourses.map((crs) => {
                const sub = submissions[crs.code] || submissions[crs.id];
                const isSubmitted = !!sub && (sub.status === 'Submitted' || sub.status === 'Evaluated');
                const isEvaluated = sub?.status === 'Evaluated' || sub?.status === 'Reviewed';
                const isDraft = sub?.status === 'Draft' || sub?.status === 'Ready for Submission';

                const statusLabel = isEvaluated
                  ? 'Assignment Evaluated'
                  : isSubmitted
                  ? 'Assignment Submitted'
                  : isDraft
                  ? 'Submission Pending'
                  : 'Assignment Not Attempted';

                const statusColor = isEvaluated
                  ? 'bg-blue-600'
                  : isSubmitted
                  ? 'bg-emerald-500'
                  : isDraft
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

                const progress = isSubmitted ? 100 : isDraft ? 50 : 0;
                const dueDate = sub?.dueDate || '20 November 2026';
                const submissionDate = sub?.submissionDate ? sub.submissionDate.split('T')[0] : '--';
                const evaluated = sub?.evaluationMarks || '--';

                return (
                  <div
                    key={crs.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    {/* Top Soft Blue Card Body */}
                    <div className="bg-[#edf4fb] p-5 pb-4 space-y-3">
                      {/* Top Right Status Badge */}
                      <div className="flex justify-end">
                        <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs">
                          <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                          <span>{statusLabel}</span>
                        </span>
                      </div>

                      {/* Icon + Course Name */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#004f9f] text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug uppercase tracking-tight">
                          {crs.name}
                        </h3>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2">
                        <div className="text-xs font-bold text-slate-800 mb-1">
                          {progress}% Completed
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress === 100 ? 'bg-[#22c55e]' : progress > 0 ? 'bg-amber-500' : 'bg-transparent'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Details 2-Column Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                        <div className="space-y-1">
                          <div>
                            <span className="font-bold text-slate-900">Course Code:</span>{' '}
                            <span className="font-medium text-slate-700">{crs.code}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">Evaluated:</span>{' '}
                            <span className="text-slate-600">{evaluated}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div>
                            <span className="font-bold text-slate-900">Due Date:</span>{' '}
                            <span className="font-medium text-slate-700">{dueDate}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">Submission Date:</span>{' '}
                            <span className="text-slate-600">{submissionDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                        <span>{statusLabel}</span>
                      </span>

                      <button
                        onClick={() => handleViewOrPrepare(crs)}
                        className="px-5 py-2 bg-[#004b99] hover:bg-[#003d7e] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        {isSubmitted ? 'View Assignment' : 'Prepare & Submit'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OFFICIAL GUIDELINES ACCORDION (Collapsible) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <button
              onClick={() => setGuidelinesOpen(!guidelinesOpen)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Official IGNOU Assignment Guidelines & Rules (TEE Dec 2026)</span>
              </div>
              <span className="text-xs text-blue-600 font-semibold underline">
                {guidelinesOpen ? 'Hide Guidelines ▲' : 'View Guidelines ▼'}
              </span>
            </button>

            {guidelinesOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 text-xs mt-2 border-t border-slate-200">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold">i & ii. Check Eligibility</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Verify eligibility for TEE December 2026. Do NOT resubmit assignments for courses already passed.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold">iii. Avoid Duplicate Submissions</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    If you have already submitted hard copies of an assignment at your Regional Centre or Study Centre, do not submit again through OAMS.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-rose-900 font-bold">xi. Do Not Send by Email</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Do NOT send assignments to any Regional Centre email. Submissions sent by email will NOT be evaluated.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold">vii. Handwritten & Signed Pages</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    All responses must be handwritten. The student must sign on every page before scanning.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold">viii & ix. Single PDF & File Naming</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Combine Cover Page, ID Card, QP and answers into ONE PDF per course (&le; 20 MB) named <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[10px]">ENROLMENT_COURSECODE.pdf</code>.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 font-bold">xiv & xv. Technical Support</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    For technical portal queries email <strong className="text-slate-900">preexamcs@ignou.ac.in</strong>. For evaluation, contact your Regional Centre.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW ASSIGNMENT DETAILS MODAL */}
      {viewAssignmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setViewAssignmentModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewAssignmentModal.course.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Course Code: {viewAssignmentModal.course.code}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Submission Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Assignment Submitted
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Session:</span>
                <span className="font-bold text-slate-800">December 2026</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Acknowledgement No:</span>
                <span className="font-mono font-bold text-blue-800">
                  {viewAssignmentModal.submission?.acknowledgementNo || 'IGNOU-2026-DEC-491024'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-semibold text-slate-800">
                  {viewAssignmentModal.submission?.submissionDate?.split('T')[0] || '2026-11-12'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500">Standard File Name:</span>
                <span className="font-mono font-bold text-slate-700">
                  {viewAssignmentModal.submission?.fileName || `${enrolmentNumber}_${viewAssignmentModal.course.code}.pdf`}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Evaluation Marks:</span>
                <span className="font-bold text-slate-700">{viewAssignmentModal.submission?.evaluationMarks || 'Pending Evaluation (--) '}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  const ack = viewAssignmentModal.submission?.acknowledgementNo || 'IGNOU-2026-DEC-491024';
                  const sDate = viewAssignmentModal.submission?.submissionDate || '2026-11-12';
                  const fName = viewAssignmentModal.submission?.fileName || `${enrolmentNumber}_${viewAssignmentModal.course.code}.pdf`;
                  const fSize = viewAssignmentModal.submission?.fileSize || '4.8 MB';
                  const fUrl = viewAssignmentModal.submission?.fileUrl;

                  setViewAssignmentModal(null);
                  setReceiptModal({
                    open: true,
                    acknowledgementNo: ack,
                    submissionDate: sDate,
                    courseCode: viewAssignmentModal.course.code,
                    courseName: viewAssignmentModal.course.name,
                    fileName: fName,
                    fileSize: fSize,
                    fileUrl: fUrl,
                  });
                }}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>View Receipt</span>
              </button>

              <button
                onClick={() => {
                  setViewAssignmentModal(null);
                  handleOpenCoursePrep(viewAssignmentModal.course);
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <FileCheck className="w-4 h-4" />
                <span>Re-Prepare / Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAMARTH SERVICES MODAL */}
      {samarthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <button
              onClick={() => setSamarthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">IGNOU Samarth eGov Services</h3>
                <p className="text-xs text-slate-500">Official University Student Portal & Verification Services</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <a
                href="https://ignou.samarth.edu.in"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-xl block space-y-1 transition-all group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Student Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500">Direct sign-in to your Samarth student dashboard.</p>
              </a>

              <a
                href="https://hall_ticket.ignou.ac.in"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-xl block space-y-1 transition-all group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Hall Ticket / Admit Card</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500">Download examination hall ticket for TEE Dec 2026.</p>
              </a>

              <a
                href="https://gradecard.ignou.ac.in"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-xl block space-y-1 transition-all group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Grade Card & Marks</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500">Inspect assignment and term-end examination marks.</p>
              </a>

              <a
                href="https://onlinerr.ignou.ac.in"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-xl block space-y-1 transition-all group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Re-Registration</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500">Apply for subsequent semester/year courses.</p>
              </a>
            </div>

            <button
              onClick={() => setSamarthModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MULTI-STEP ASSIGNMENT PREPARATION & PDF BUILDER MODAL */}
      {modalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold border border-blue-500/30">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                      {selectedCourse.code}
                    </span>
                    <h3 className="text-base sm:text-lg font-black">{selectedCourse.name}</h3>
                  </div>
                  <p className="text-xs text-blue-200/80 mt-0.5">
                    IGNOU OAMS PDF Preparation & Submission • TEE December 2026
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between overflow-x-auto gap-2">
              {[
                { step: 1, label: '1. Cover Page' },
                { step: 2, label: '2. IGNOU ID Card' },
                { step: 3, label: '3. Question Paper' },
                { step: 4, label: '4. Handwritten Answers' },
                { step: 5, label: '5. Single PDF Compile' },
                { step: 6, label: '6. Review & Submit' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    activeStep === s.step
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body: Active Step View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STEP 1: COVER PAGE GENERATOR */}
              {activeStep === 1 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-950">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Rule v: First Page of the Assignment (Mandatory Cover Page)</span>
                    </strong>
                    <p className="text-blue-800/90 text-[11px]">
                      The first page of each submitted assignment must contain the 8 details below plus the student's signature. This system automatically renders it onto standard A4 Page 1 of your single PDF.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        1. Learner's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={learnerName}
                        onChange={(e) => setLearnerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        2. Enrolment Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={enrolmentNumber}
                        onChange={(e) => setEnrolmentNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        3. Study Centre Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studyCentreCode}
                        onChange={(e) => setStudyCentreCode(e.target.value)}
                        placeholder="e.g. 2501"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        4. Course Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={courseCode}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        5 & 6. Regional Centre <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={regionalCentreCode}
                        onChange={(e) => {
                          const rc = IGNOU_REGIONAL_CENTRES.find((r) => r.code === e.target.value);
                          setRegionalCentreCode(e.target.value);
                          if (rc) setRegionalCentreName(rc.name);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {IGNOU_REGIONAL_CENTRES.map((rc) => (
                          <option key={rc.code} value={rc.code}>
                            Code: {rc.code} — {rc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        7. Student's Registered Email ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        8. Examination Session <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={examinationSession}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                      <input
                        type="text"
                        value={courseName}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Student Signature Canvas & Upload */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Student Signature (Mandatory on Cover Page & Every Response Page) <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Sign below using your finger or mouse, or upload a clear signature image.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setSignatureType('draw')}
                          className={`px-2.5 py-1 rounded-lg ${
                            signatureType === 'draw' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                          }`}
                        >
                          Draw on Screen
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureType('upload')}
                          className={`px-2.5 py-1 rounded-lg ${
                            signatureType === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                          }`}
                        >
                          Upload Image
                        </button>
                      </div>
                    </div>

                    {signatureType === 'draw' ? (
                      <div className="space-y-2">
                        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-1 flex justify-center">
                          <canvas
                            ref={sigCanvasRef}
                            width={450}
                            height={120}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="touch-none bg-white cursor-crosshair rounded-lg"
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 text-[11px]">Draw inside the dashed box</span>
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Clear Canvas
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureImageUpload}
                          className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {signatureDataUrl && (
                          <div className="p-2 bg-white rounded-lg border inline-block">
                            <img src={signatureDataUrl} alt="Signature preview" className="h-12 object-contain" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: IGNOU IDENTITY CARD */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-950">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Rule vi: Attach IGNOU Identity Card</span>
                    </strong>
                    <p className="text-blue-800/90 text-[11px]">
                      The IGNOU Identity Card must be included in the submitted single document, appearing directly after the Cover Page.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <GraduationCap className="w-7 h-7" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Upload Your IGNOU Identity Card</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Supports PDF or Image (PNG, JPG, JPEG)</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Choose ID Card File</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleIdCardUpload}
                          className="hidden"
                        />
                      </label>

                      {user.imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardDataUrl(user.imageUrl!);
                            setIdCardIsPdf(false);
                            setIdCardName('Student_Digital_ID_Card.png');
                            setToast({ message: 'Loaded your Digital ID card from profile.', type: 'success' });
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                        >
                          Use Student Portal Photo Card
                        </button>
                      )}
                    </div>

                    {idCardDataUrl && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>ID Card Attached: {idCardName || 'Identity_Card'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardDataUrl('');
                            setIdCardName('');
                          }}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: ASSIGNMENT QUESTION PAPER */}
              {activeStep === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-950">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Rule iv & vi: Relevant Assignment Question Paper</span>
                    </strong>
                    <p className="text-blue-800/90 text-[11px]">
                      Ensure the question paper is applicable to your programme, course ({selectedCourse.code}), and session (TEE December 2026). It will be embedded after the ID card.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Official Question Paper — {selectedCourse.code}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {selectedCourse.name} • Session: December 2026
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Question Paper PDF</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleQuestionPaperUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {questionPaperDataUrl ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Question Paper Attached: {questionPaperName || `${selectedCourse.code}_QP.pdf`}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionPaperDataUrl('');
                            setQuestionPaperName('');
                          }}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                        <p>No external question paper attached yet.</p>
                        <p className="text-[11px] text-slate-400">
                          Attach your downloaded IGNOU Question Paper PDF above so it can be combined with your answers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: HANDWRITTEN ANSWER SCANS */}
              {activeStep === 4 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Rule vii: All Responses Must Be Handwritten</span>
                    </strong>
                    <p className="text-amber-900/90 text-[11px] leading-relaxed">
                      All assignment answers must be written in your own handwriting. Scan the pages clearly and ensure that{' '}
                      <strong>you have signed on every single page of the assignment</strong>.
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Upload Handwritten Answer Sheets</h4>
                      <p className="text-xs text-slate-500">
                        Upload scanned pages (JPG, PNG) or complete scanned PDF
                      </p>
                    </div>

                    <label className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Select Scanned Answer Pages</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,image/*"
                        onChange={handleHandwrittenPagesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded Pages List */}
                  {handwrittenPages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>Attached Answer Pages ({handwrittenPages.length} Pages)</span>
                        <button
                          type="button"
                          onClick={() => setHandwrittenPages([])}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Clear All Pages
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {handwrittenPages.map((pg, idx) => (
                          <div
                            key={pg.id}
                            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 relative group"
                          >
                            <div className="aspect-[3/4] bg-white rounded-lg border overflow-hidden flex items-center justify-center">
                              {pg.isPdf ? (
                                <div className="text-center p-2 text-rose-600">
                                  <FileText className="w-8 h-8 mx-auto" />
                                  <span className="text-[10px] font-bold">PDF Doc</span>
                                </div>
                              ) : (
                                <img src={pg.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-1 text-[11px]">
                              <span className="font-bold text-slate-800">Page {idx + 1}</span>
                              <span className="text-slate-400 text-[10px]">{pg.sizeFormatted}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeHandwrittenPage(pg.id)}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Signed Checkbox */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="confirmSignedCheck"
                      checked={confirmedSignedAllPages}
                      onChange={(e) => setConfirmedSignedAllPages(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="confirmSignedCheck" className="text-xs text-slate-800 font-semibold cursor-pointer">
                      I solemnly verify and confirm that each and every page of my handwritten answers contains my original handwritten signature at the bottom as mandated by official IGNOU guidelines.
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: COMPILE SINGLE PDF */}
              {activeStep === 5 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
                    <strong className="font-bold flex items-center gap-1.5 text-blue-950">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Rule viii & ix: Compile One Single Validated PDF per Course</span>
                    </strong>
                    <p className="text-blue-800/90 text-[11px]">
                      The single PDF will assemble: Page 1 (Cover Page) &rarr; Page 2 (ID Card) &rarr; Question Paper &rarr; Handwritten Answer Sheets. Maximum file size: 20 MB. Auto-named:{' '}
                      <span className="font-mono font-bold">{generateIgnouFilename(enrolmentNumber, selectedCourse.code)}</span>.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                    <button
                      type="button"
                      disabled={isCompiling}
                      onClick={handleCompilePdf}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {isCompiling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Compiling PDF Package...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{compiledPdf ? 'Re-Compile Single PDF' : '⚡ Compile & Build Single PDF'}</span>
                        </>
                      )}
                    </button>

                    {compileProgress && (
                      <p className="text-xs text-blue-600 font-medium animate-pulse">{compileProgress}</p>
                    )}

                    {compiledPdf && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto text-left space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Compiled Document</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              compiledPdf.isValidSize ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {compiledPdf.isValidSize ? '✓ Valid Size (&le; 20MB)' : 'Exceeds 20MB limit'}
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5 font-medium text-slate-700">
                          <div className="flex justify-between">
                            <span>File Name:</span>
                            <span className="font-mono font-bold text-slate-900">{compiledPdf.fileName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Pages:</span>
                            <span className="font-bold text-slate-900">{compiledPdf.pageCount} Pages</span>
                          </div>
                          <div className="flex justify-between">
                            <span>File Size:</span>
                            <span className="font-bold text-slate-900">{compiledPdf.fileSizeFormatted}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <a
                            href={compiledPdf.blobUrl}
                            download={compiledPdf.fileName}
                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF Copy</span>
                          </a>

                          <a
                            href={compiledPdf.blobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open In Viewer</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & SUBMIT */}
              {activeStep === 6 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pre-Submission Verification Checklist</span>
                    </h4>

                    {/* 6 Mandatory Verification Checks */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          1. Required student details & Cover Page verified ({learnerName}, {enrolmentNumber}, {selectedCourse.code}, {studyCentreCode}, {regionalCentreName})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        {questionPaperDataUrl ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          2. Relevant Assignment Question Paper included ({questionPaperName || 'Question Paper Ready'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        {handwrittenPages.length > 0 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          3. Handwritten responses included ({handwrittenPages.length} Scanned Pages Attached)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        {confirmedSignedAllPages ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          4. Student signature present on every single page (Verified by student)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        {idCardDataUrl ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          5. IGNOU Identity Card included ({idCardName || 'Identity Card Attached'})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200">
                        {compiledPdf && compiledPdf.isValidSize ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">
                          6. Single PDF file size does not exceed 20 MB ({compiledPdf ? compiledPdf.fileSizeFormatted : 'Pending Compile'})
                        </span>
                      </div>
                    </div>

                    {/* Optional Submission Note */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Optional Submission Note / Query
                      </label>
                      <textarea
                        rows={2}
                        value={submissionComments}
                        onChange={(e) => setSubmissionComments(e.target.value)}
                        placeholder="Add optional notes for the Regional Centre evaluation committee..."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                  >
                    &larr; Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Continue to Step {activeStep + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || !compiledPdf || !compiledPdf.isValidSize || !confirmedSignedAllPages}
                    onClick={handleSubmitAssignment}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting to OAMS...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Assignment (OAMS TEE Dec 2026)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL SUBMISSION ACKNOWLEDGEMENT RECEIPT MODAL (Requirement 6 & Rule xii) */}
      {receiptModal && receiptModal.open && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setReceiptModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Receipt Header */}
            <div className="text-center space-y-1.5 border-b border-slate-200 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Official Submission Acknowledgement
              </span>
              <h3 className="text-lg font-black text-slate-900 pt-1">
                IGNOU Online Assignment Management System
              </h3>
              <p className="text-xs text-slate-500">Term-End Examination (TEE) — December 2026</p>
            </div>

            {/* Acknowledgement Certificate Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Acknowledgement Number</span>
                <span className="font-mono font-black text-sm text-blue-700 tracking-wider">
                  {receiptModal.acknowledgementNo}
                </span>
              </div>

              <div className="space-y-2 text-slate-700 font-medium">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Learner Name:</span>
                  <span className="font-bold text-slate-900">{learnerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Enrolment Number:</span>
                  <span className="font-mono font-bold text-slate-900">{enrolmentNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Course Code & Title:</span>
                  <span className="font-bold text-slate-900">
                    {receiptModal.courseCode} ({receiptModal.courseName})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Study Centre Code:</span>
                  <span className="font-bold text-slate-900">{studyCentreCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Regional Centre:</span>
                  <span className="font-bold text-slate-900">
                    {regionalCentreName} (Code: {regionalCentreCode})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Submission Timestamp:</span>
                  <span className="font-bold text-slate-900">
                    {receiptModal.submissionDate?.replace('T', ' ').slice(0, 19)} IST
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Submitted File:</span>
                  <span className="font-mono text-slate-900">{receiptModal.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission Status:</span>
                  <span className="font-bold text-emerald-700">SUBMITTED — UNDER EVALUATION</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              An online acknowledgement has been recorded in OAMS. Retain this acknowledgement receipt for all future correspondence regarding assignment evaluation.
            </div>

            {/* Receipt Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
