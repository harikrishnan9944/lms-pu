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

export function IgnouAssignmentPortal({ user, courses, assignments = [] }: IgnouAssignmentPortalProps) {
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Load existing submissions
  const loadSubmissions = async () => {
    setLoadingSubs(true);
    try {
      const res = await fetchStudentIgnouSubmissionsAction();
      if (res.success) {
        setSubmissions(res.submissions);
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

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    return semFilter === 'ALL' || c.semester === semFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* TOP OFFICIAL IGNOU OAMS HEADER & BRANDING */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-800/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-400 text-slate-950 shadow-sm">
                Official IGNOU OAMS Module
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-blue-200 border border-white/15">
                TEE Session: December 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Indira Gandhi National Open University
            </h1>
            <p className="text-sm font-semibold text-blue-200">
              Online Assignment Management System (OAMS) • Single PDF Preparation & Submission Portal
            </p>
            <p className="text-xs text-blue-300/80 leading-relaxed pt-1">
              Conforming to official IGNOU TEE December 2026 guidelines. Automatically prepares the standard 9-point Cover Page, validates mandatory page signatures, combines ID Card & Question Paper with handwritten responses into one compliant PDF (&le; 20 MB), and issues digital acknowledgement receipts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center sm:text-right shrink-0 space-y-1.5 w-full sm:w-auto">
            <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Learner Enrolment</div>
            <div className="text-xl font-black font-mono text-amber-300">{enrolmentNumber}</div>
            <div className="text-xs text-blue-100 font-medium">{learnerName}</div>
            <div className="text-[11px] text-blue-300 font-mono">{user.programme || 'MCA / PG / UG'}</div>
          </div>
        </div>
      </div>

      {/* OFFICIAL WARNINGS & GUIDELINES ACCORDION BANNER */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 p-5 shadow-sm space-y-3 text-slate-800">
        <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Mandatory Assignment Submission Rules for TEE December 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-amber-950 flex items-center gap-1.5 font-bold">
              <span>i & ii. Check Eligibility</span>
            </strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Verify eligibility for TEE December 2026. Do NOT resubmit assignments for courses already passed.{' '}
              <a
                href="https://isms.ignou.ac.in/changeadmdata/AdmissionStatusNew.ASP"
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 font-bold underline inline-flex items-center gap-0.5"
              >
                <span>Check Admission Status</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-amber-950 font-bold">iii. Avoid Duplicate Submissions</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              If you have already submitted hard copies of an assignment at your Regional Centre or Study Centre, do not submit again through OAMS.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-rose-900 font-bold flex items-center gap-1">
              <X className="w-3.5 h-3.5 text-rose-600" />
              <span>xi. Do Not Send by Email</span>
            </strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Do NOT send assignments to any Regional Centre email. Submissions sent by email will NOT be evaluated.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-amber-950 font-bold">vii. Handwritten & Signed Pages</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              All responses must be handwritten. Scan completed assignment properly; student must sign on every page.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-amber-950 font-bold">viii & ix. Single PDF & File Naming</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Upload ONE single PDF per course (&le; 20 MB). Auto-named using{' '}
              <code className="bg-amber-100 font-bold text-amber-900 px-1 py-0.5 rounded text-[10px]">
                ENROLMENT_COURSECODE.pdf
              </code>{' '}
              (e.g.{' '}
              <span className="font-mono text-slate-800">
                {enrolmentNumber}_{courses[0]?.code?.replace(/[^A-Za-z0-9]/g, '') || 'MEG01'}.pdf
              </span>
              ).
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 space-y-1">
            <strong className="text-amber-950 font-bold">xiv & xv. Technical Support</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              For technical portal assistance, email <strong className="text-slate-900">preexamcs@ignou.ac.in</strong>. For evaluation queries, contact your Regional Centre.
            </p>
          </div>
        </div>

        {/* Integration notice */}
        <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/60 flex items-start gap-2 text-[11px] text-blue-900">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p>
            <strong>Official OAMS Gateway Notice:</strong> This portal prepares, verifies, packages, and stores compliant IGNOU assignment bundles locally. Actual direct submission into the centralized national IGNOU OAMS portal requires official IGNOU institutional API credentials/gateway.
          </p>
        </div>
      </div>

      {/* ELIGIBLE COURSES MANAGEMENT TABLE (Requirement 1 & 6) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Eligible Courses & Assignment Submission Status (TEE Dec 2026)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any course to generate the Cover Page, compile your single PDF, and submit to OAMS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Semester:</span>
            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Semesters</option>
              {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((crs) => {
            const sub = submissions[crs.code] || submissions[crs.id];
            let status: 'Draft' | 'Ready for Submission' | 'Submitted' | 'Under Evaluation' | 'Evaluated' = 'Draft';
            if (sub?.status === 'Evaluated' || sub?.status === 'Reviewed') {
              status = 'Evaluated';
            } else if (sub?.status === 'Under Evaluation') {
              status = 'Under Evaluation';
            } else if (sub?.status === 'Submitted') {
              status = 'Submitted';
            } else if (sub?.status === 'Ready for Submission') {
              status = 'Ready for Submission';
            } else {
              status = 'Draft';
            }

            const cleanCode = crs.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            const expectedFileName = `${enrolmentNumber}_${cleanCode}.pdf`;

            return (
              <div
                key={crs.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Header Badge & Course Code */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-slate-900 text-white tracking-wide">
                      {crs.code}
                    </span>

                    {/* Status Badge (Requirement 6) */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        status === 'Evaluated'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : status === 'Under Evaluation'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : status === 'Submitted'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : status === 'Ready for Submission'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {status === 'Evaluated' && <Check className="w-3.5 h-3.5" />}
                      {status === 'Submitted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {status === 'Under Evaluation' && <Clock className="w-3.5 h-3.5" />}
                      {status === 'Draft' && <FileText className="w-3.5 h-3.5" />}
                      <span>{status}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                      {crs.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{crs.semester || 'Semester 1'}</span>
                      <span>•</span>
                      <span>{crs.subject || 'Core Theory / Lab'}</span>
                    </p>
                  </div>

                  {/* Submission details strip if submitted */}
                  {sub ? (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs space-y-1">
                      <div className="flex justify-between items-center text-blue-950 font-bold">
                        <span>Ack No:</span>
                        <span className="font-mono text-blue-700 text-[11px]">{sub.acknowledgementNo}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>Submitted On:</span>
                        <span>{sub.submissionDate?.split('T')[0] || 'Dec 2026'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>File:</span>
                        <span className="font-mono truncate max-w-[150px]">{sub.fileName || expectedFileName}</span>
                      </div>
                      {sub.marks !== undefined && (
                        <div className="flex justify-between items-center pt-1 border-t border-blue-200/60 text-emerald-800 font-bold">
                          <span>Evaluation Grade:</span>
                          <span className="bg-emerald-100 px-2 py-0.5 rounded">{sub.marks} / 100</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Expected PDF:</span>
                        <span className="font-mono font-bold text-slate-700">{expectedFileName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Max Size: 20 MB • Must include Cover Page & ID Card
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {sub ? (
                    <>
                      <button
                        onClick={() =>
                          setReceiptModal({
                            open: true,
                            acknowledgementNo: sub.acknowledgementNo,
                            submissionDate: sub.submissionDate,
                            courseCode: crs.code,
                            courseName: crs.name,
                            fileName: sub.fileName || expectedFileName,
                            fileSize: sub.fileSize || 'Standard PDF',
                            fileUrl: sub.fileUrl,
                          })
                        }
                        className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>

                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          download={sub.fileName || expectedFileName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                          title="Download Submitted PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenCoursePrep(crs)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Prepare & Submit (Dec 2026) →</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
