import { prisma } from './prisma';
import { UserRole, UserStatus } from './auth';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  qualification?: string | null;
  programme?: string | null;
  subject?: string | null;
  mobile?: string | null;
  studentId?: string | null;
  semester?: string | null;
  address?: string | null;
  academicInfo?: string | null;
  imageUrl?: string | null;
  mentorId?: string | null;
  mentorName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function extractUserImageUrl(academicInfo?: string | null): string | null {
  if (!academicInfo) return null;
  try {
    if (academicInfo.trim().startsWith('{')) {
      const parsed = JSON.parse(academicInfo);
      if (parsed.imageUrl) return parsed.imageUrl;
    }
  } catch {}
  if (academicInfo.startsWith('/uploads/') || academicInfo.startsWith('data:image/') || academicInfo.startsWith('http')) {
    return academicInfo;
  }
  return null;
}

export function extractUserAcademicDetails(academicInfo?: string | null): string {
  if (!academicInfo) return '';
  try {
    if (academicInfo.trim().startsWith('{')) {
      const parsed = JSON.parse(academicInfo);
      return parsed.details || '';
    }
  } catch {}
  return academicInfo;
}

export function formatAcademicInfoPayload(imageUrl?: string | null, details?: string | null): string | null {
  if (!imageUrl && !details) return null;
  if (!imageUrl) return details || null;
  return JSON.stringify({
    imageUrl: imageUrl,
    details: details || '',
  });
}

export function sanitizeUserRecord(user: any): UserRecord {
  if (!user) return user;
  const rawInfo = user.academicInfo;
  const imageUrl = extractUserImageUrl(rawInfo) || user.imageUrl || null;
  const academicDetails = extractUserAcademicDetails(rawInfo);
  return {
    ...user,
    imageUrl,
    academicInfo: academicDetails,
  };
}

export interface ProgramItem {
  id: string;
  name: string;
  code: string;
  department?: string | null;
  eligibility: string;
  medium: string;
  syllabusId?: string | null;
  syllabusName?: string | null;
  academicYear?: string | null;
  calendarYear?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CourseItem {
  id: string;
  name: string;
  code: string;
  programmeId: string;
  programmeName: string;
  semester: string;
  subject: string;
  facultyId: string;
  facultyName: string;
  assessment: string;
  status: 'ACTIVE' | 'INACTIVE';
  appSubmission?: boolean;
  verificationRequired?: boolean;
  admissionApproval?: boolean;
  lmsAccountCreation?: boolean;
}

export interface ApplicationItem {
  id: string;
  applicantName: string;
  email: string;
  mobile: string;
  programme: string;
  status: 'Submitted' | 'Under Verification' | 'Verified' | 'Rejected' | 'Pending Approval' | 'Approved' | 'Account Created';
  appliedDate: string;
  notes?: string;
}

export interface FacultyMapping {
  id: string;
  facultyId: string;
  facultyName: string;
  programmeId: string;
  programmeName: string;
  subject: string;
}

export interface StudentMapping {
  id: string;
  studentId: string;
  studentName: string;
  programmeId: string;
  programmeName: string;
  semester: string;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  subject: string;
  fileType: 'PDF' | 'Document' | 'Image' | 'Video Link' | 'Notes';
  fileUrl: string;
  notes?: string;
  uploadedAt: string;
  programmeId?: string;
  programmeName?: string;
  semesterName?: string;
  paperId?: string;
  paperName?: string;
  unitNumber?: number;
  unitName?: string;
  viewCount?: number;
  lastPosition?: number;
  duration?: number;
  percentage?: number;
  isCompleted?: boolean;
}

export interface ResourceViewItem {
  id: string;
  resourceId: string;
  studentId: string;
  studentName: string;
  studentRegNo?: string;
  lastPosition?: number;
  duration?: number;
  percentage?: number;
  isCompleted?: boolean;
  viewedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface QuestionAnswerDetail {
  questionId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

export interface SubmissionAnswersPayload {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  maxMarks: number;
  percentage: number;
  status: 'PASS' | 'FAIL';
  details: QuestionAnswerDetail[];
}

export interface AssessmentItem {
  id: string;
  title: string;
  description: string;
  programmeId?: string;
  programmeName?: string;
  semesterName?: string;
  paperId?: string;
  paperCode?: string;
  courseId: string;
  courseName: string;
  date: string;
  duration: string;
  maxMarks: number;
  instructions: string;
  questions: string;
  isPublished: boolean;
  status: 'Upcoming' | 'Available' | 'Completed';
}

export interface AssessmentSubmissionItem {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxMarks: number;
  percentage: number;
  answers: string;
  submittedAt: string;
}

export type SubmissionStatus = 'Not Submitted' | 'Submitted' | 'Late Submission' | 'Reviewed' | 'Evaluated' | 'Late';

export interface SubmissionItem {
  id?: string;
  assignmentId?: string;
  studentId: string;
  studentName: string;
  studentRegisterNumber?: string;
  studentEmail?: string;
  submissionDate: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  comments?: string;
  marks?: number;
  feedback?: string;
  status: SubmissionStatus;
}

export type AssignmentType = 'Objective' | 'Subjective' | 'Graded Discussion';

export interface AssignmentResource {
  name: string;
  url: string;
  type?: string;
  size?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  unitNumber?: number | string;
  unitName?: string;
  courseId: string;
  courseName: string;
  description: string;
  detailedDescription?: string;
  attachmentUrl?: string;
  resources?: AssignmentResource[];
  startDate?: string;
  dueDate: string;
  maxMarks: number;
  instructions: string;
  additionalInstructions?: string;
  allowResubmission?: boolean;
  assignmentType?: AssignmentType;
  scheduledDate?: string;
  presentationTopic?: string;
  submissions: SubmissionItem[];
}

export function parseAssignmentInstructions(rawInstructions?: string | null): {
  instructions: string;
  assignmentType: AssignmentType;
  unitNumber?: number | string;
  unitName?: string;
  startDate?: string;
  detailedDescription?: string;
  additionalInstructions?: string;
  allowResubmission?: boolean;
  resources?: AssignmentResource[];
  scheduledDate?: string;
  presentationTopic?: string;
} {
  if (!rawInstructions) {
    return {
      instructions: '',
      assignmentType: 'Objective',
      unitNumber: 1,
      unitName: 'Unit 1',
      allowResubmission: false,
    };
  }
  const match = rawInstructions.match(/<!--\s*ASG_META:\s*({[\s\S]*?})\s*-->/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      const cleanInstructions = rawInstructions.replace(match[0], '').trim();
      const unitNum = meta.unitNumber !== undefined ? meta.unitNumber : 1;
      return {
        instructions: cleanInstructions,
        assignmentType: (meta.type as AssignmentType) || 'Objective',
        unitNumber: unitNum,
        unitName: meta.unitName || (typeof unitNum === 'number' ? `Unit ${unitNum}` : `${unitNum}`),
        startDate: meta.startDate || undefined,
        detailedDescription: meta.detailedDescription || cleanInstructions,
        additionalInstructions: meta.additionalInstructions || undefined,
        allowResubmission: meta.allowResubmission ?? false,
        resources: Array.isArray(meta.resources) ? meta.resources : undefined,
        scheduledDate: meta.scheduledDate || undefined,
        presentationTopic: meta.presentationTopic || undefined,
      };
    } catch {}
  }
  const lower = rawInstructions.toLowerCase();
  let fallbackType: AssignmentType = 'Objective';
  if (lower.includes('graded discussion') || lower.includes('discussion-based') || lower.includes('presentation')) {
    fallbackType = 'Graded Discussion';
  } else if (lower.includes('subjective') || lower.includes('descriptive')) {
    fallbackType = 'Subjective';
  }
  return {
    instructions: rawInstructions,
    assignmentType: fallbackType,
    unitNumber: 1,
    unitName: 'Unit 1',
    detailedDescription: rawInstructions,
    allowResubmission: false,
  };
}

export function formatAssignmentInstructions(
  instructions?: string | null,
  meta?: {
    type?: AssignmentType;
    unitNumber?: number | string;
    unitName?: string;
    startDate?: string;
    detailedDescription?: string;
    additionalInstructions?: string;
    allowResubmission?: boolean;
    resources?: AssignmentResource[];
    scheduledDate?: string;
    presentationTopic?: string;
  } | AssignmentType,
  scheduledDate?: string,
  presentationTopic?: string
): string {
  let metaObj: any = {};
  if (typeof meta === 'string') {
    metaObj = {
      type: meta || 'Objective',
      unitNumber: 1,
      unitName: 'Unit 1',
      scheduledDate,
      presentationTopic,
    };
  } else if (meta && typeof meta === 'object') {
    metaObj = {
      type: meta.type || 'Objective',
      unitNumber: meta.unitNumber !== undefined ? meta.unitNumber : 1,
      unitName: meta.unitName || `Unit ${meta.unitNumber || 1}`,
      startDate: meta.startDate || undefined,
      detailedDescription: meta.detailedDescription || undefined,
      additionalInstructions: meta.additionalInstructions || undefined,
      allowResubmission: meta.allowResubmission ?? false,
      resources: meta.resources || undefined,
      scheduledDate: meta.scheduledDate || undefined,
      presentationTopic: meta.presentationTopic || undefined,
    };
  } else {
    metaObj = { type: 'Objective', unitNumber: 1, unitName: 'Unit 1' };
  }

  const metaString = `<!-- ASG_META: ${JSON.stringify(metaObj)} -->\n`;
  const clean = (instructions || '').replace(/<!--\s*ASG_META:\s*({[\s\S]*?})\s*-->\n?/, '').trim();
  return `${metaString}${clean}`;
}

export function parseSubmissionFeedback(rawFeedback?: string | null): {
  feedback?: string;
  comments?: string;
  fileName?: string;
  fileSize?: string;
} {
  if (!rawFeedback) return {};
  const match = rawFeedback.match(/<!--\s*SUB_META:\s*({[\s\S]*?})\s*-->/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      const cleanFeedback = rawFeedback.replace(match[0], '').trim();
      return {
        feedback: cleanFeedback || undefined,
        comments: meta.comments || undefined,
        fileName: meta.fileName || undefined,
        fileSize: meta.fileSize || undefined,
      };
    } catch {}
  }
  return { feedback: rawFeedback };
}

export function formatSubmissionFeedback(
  feedback?: string | null,
  meta?: { comments?: string; fileName?: string; fileSize?: string }
): string {
  const metaObj = {
    comments: meta?.comments || undefined,
    fileName: meta?.fileName || undefined,
    fileSize: meta?.fileSize || undefined,
  };
  const metaString = `<!-- SUB_META: ${JSON.stringify(metaObj)} -->\n`;
  const clean = (feedback || '').replace(/<!--\s*SUB_META:\s*({[\s\S]*?})\s*-->\n?/, '').trim();
  return `${metaString}${clean}`;
}

export interface InternalMarkItem {
  id: string;
  programmeId: string;
  programmeName: string;
  courseId: string;
  courseName: string;
  semester: string;
  studentId: string;
  studentName: string;
  marks: number;
  maxMarks: number;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  courseId: string;
  courseName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  facultyId: string;
  facultyName: string;
  classType: 'Regular Class' | 'Online Class' | 'Lab' | 'Examination';
  meetingLink?: string;
  status: 'Upcoming' | 'Live' | 'Completed';
}

export interface FeeActivityItem {
  id: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Partially Paid';
  paymentDate?: string;
  receiptUrl?: string;
}

export interface ReplyItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface ForumItem {
  id: string;
  courseId: string;
  courseName: string;
  subject: string;
  title: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  replies: ReplyItem[];
}

export interface CircularItem {
  id: string;
  title: string;
  description: string;
  date: string;
  attachmentUrl?: string;
  isImportant: boolean;
}

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  body: string;
  sentAt: string;
  isRead: boolean;
}

export interface MentoringItem {
  id: string;
  studentId: string;
  mentorId?: string | null;
  mentorName: string;
  mentorContact: string;
  mentorEmail?: string | null;
  programme: string;
  meetingInfo: string;
  history: string[];
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface CertificateItem {
  id: string;
  studentId: string;
  certificateName: string;
  courseOrProgramme: string;
  issueDate: string;
  certificateId: string;
  downloadUrl: string;
}

export interface TicketResponseItem {
  id: string;
  responderName: string;
  responderRole: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  category: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  attachmentUrl?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  responses: TicketResponseItem[];
}

export interface ContactDirectoryItem {
  id: string;
  name: string;
  role: string;
  programme: string;
  email: string;
  phone: string;
}

export interface SyllabusItem {
  id: string;
  name: string;
  regulation: string;
  programmeId: string;
  programmeName?: string | null;
  year?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface SemesterItem {
  id: string;
  name: string;
  number: number;
  programmeId: string;
  programmeName?: string | null;
  syllabusId?: string | null;
  createdAt?: string;
}

export interface PaperItem {
  id: string;
  name: string;
  code: string;
  programmeId: string;
  programmeName?: string | null;
  semesterId?: string | null;
  semesterName: string;
  syllabusId?: string | null;
  syllabusName?: string | null;
  credits: number;
  facultyId?: string | null;
  facultyName?: string | null;
  academicYear?: string | null;
  calendarYear?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  units?: PaperUnitItem[];
  createdAt?: string;
}

export interface FacultyAssignmentItem {
  id: string;
  facultyId: string;
  facultyName: string;
  facultyEmail?: string | null;
  paperId: string;
  paperName: string;
  paperCode?: string | null;
  programmeId: string;
  programmeName?: string | null;
  semesterId?: string | null;
  semesterName?: string | null;
  academicYear?: string | null;
  calendarYear?: string | null;
  assignedAt?: string;
}

export interface PaperUnitItem {
  id: string;
  paperId: string;
  unitNumber: number;
  title: string;
  textContent?: string | null;
  pdfUrl?: string | null;
  status: 'Not Added' | 'Text Added' | 'PDF Uploaded' | 'Completed';
  updatedAt?: string;
}

export interface StudyCentreItem {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  coordinatorName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface AcademicYearItem {
  id: string;
  year: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  isCurrent: boolean;
  createdAt?: string;
}

export interface AttendanceRecordItem {
  id: string;
  scheduleId?: string | null;
  courseId: string;
  courseName: string;
  paperId?: string | null;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string | null;
  recordedBy?: string | null;
  createdAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  resource: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

// ================= SEEDING DEFAULTS IF EMPTY =================
let isSeeded = false;

async function ensureDefaultDataSeeded() {
  if (isSeeded) return;

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
      const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);

      await prisma.user.createMany({
        data: [
          {
            id: '66f100000000000000000001',
            name: 'Hari (Admin)',
            email: 'admin@lms.edu',
            username: 'admin',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
            qualification: 'Ph.D. in Computer Science',
            programme: 'MCA',
            subject: 'Administration',
            mobile: '+91 9876543200',
          },
          {
            id: '66f100000000000000000002',
            name: 'Priya Sharma',
            email: 'priya@lms.edu',
            username: 'priya_coord',
            passwordHash: defaultPasswordHash,
            role: 'PROGRAM_COORDINATOR',
            status: 'ACTIVE',
            qualification: 'M.Tech, Ph.D.',
            programme: 'MCA',
            subject: 'Software Engineering',
            mobile: '+91 9876543210',
          },
          {
            id: '66f100000000000000000003',
            name: 'Arun Kumar',
            email: 'arun@lms.edu',
            username: 'arunkumar',
            passwordHash: defaultPasswordHash,
            role: 'FACULTY',
            status: 'ACTIVE',
            qualification: 'M.Sc, Ph.D.',
            programme: 'MCA',
            subject: 'Database Systems',
            mobile: '+91 9876543211',
          },
          {
            id: '66f100000000000000000004',
            name: 'Karthik Raja',
            email: 'karthik@lms.edu',
            username: 'karthik',
            passwordHash: defaultPasswordHash,
            role: 'STUDENT',
            status: 'ACTIVE',
            studentId: 'PU2026MCA01',
            programme: 'MCA',
            semester: 'Semester 3',
            mobile: '+91 9876543212',
            address: 'Salem, Tamil Nadu, India',
            academicInfo: 'CGPA 3.85 | Batch 2024-2026 | MCA Regular',
          },
          {
            id: '66f100000000000000000005',
            name: 'Ananya Roy',
            email: 'ananya@lms.edu',
            username: 'ananya',
            passwordHash: defaultPasswordHash,
            role: 'STUDENT',
            status: 'ACTIVE',
            studentId: 'PU2026MCA02',
            programme: 'MCA',
            semester: 'Semester 3',
            mobile: '+91 9876543213',
            address: 'Chennai, Tamil Nadu, India',
            academicInfo: 'CGPA 3.90 | Batch 2024-2026 | MCA Regular',
          },
        ],
      });
    }

    const progCount = await prisma.program.count();
    if (progCount === 0) {
      await prisma.program.createMany({
        data: [
          {
            id: '66f100000000000000000011',
            name: 'MCA (Master of Computer Applications)',
            code: '010',
            eligibility: 'Bachelor Degree with Mathematics at 10+2 or Graduation Level',
            medium: 'English',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000012',
            name: 'M.Sc. Computer Science',
            code: '020',
            eligibility: 'B.Sc. Computer Science / BCA / B.Sc. IT with 55%',
            medium: 'English',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000013',
            name: 'M.Sc. Data Science',
            code: '030',
            eligibility: 'Bachelor Degree in Statistics / Math / CS',
            medium: 'English',
            status: 'ACTIVE',
          },
        ],
      });
    }

    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      await prisma.course.createMany({
        data: [
          {
            id: '66f100000000000000000021',
            name: 'Advanced Software Engineering',
            code: 'MCA301',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA',
            semester: 'Semester 3',
            subject: 'Software Architecture & Agile Principles',
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            assessment: 'Midterm 30%, Lab 20%, Endterm 50%',
            status: 'ACTIVE',
            appSubmission: true,
            verificationRequired: true,
            admissionApproval: true,
            lmsAccountCreation: true,
          },
          {
            id: '66f100000000000000000022',
            name: 'Database Management Systems',
            code: 'MCA302',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA',
            semester: 'Semester 3',
            subject: 'Relational & NoSQL Databases',
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            assessment: 'Quizzes 20%, Assignment 30%, Exam 50%',
            status: 'ACTIVE',
            appSubmission: true,
            verificationRequired: true,
            admissionApproval: true,
            lmsAccountCreation: true,
          },
          {
            id: '66f100000000000000000023',
            name: 'Web Security & Cryptography',
            code: 'MCA303',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA',
            semester: 'Semester 3',
            subject: 'Applied Cryptography & Cyber Defense',
            facultyId: '66f100000000000000000002',
            facultyName: 'Priya Sharma',
            assessment: 'Internal 40%, External 60%',
            status: 'ACTIVE',
            appSubmission: true,
            verificationRequired: true,
            admissionApproval: true,
            lmsAccountCreation: true,
          },
        ],
      });
    }

    const feeCount = await prisma.feeActivity.count();
    if (feeCount === 0) {
      await prisma.feeActivity.createMany({
        data: [
          {
            id: '66f100000000000000000031',
            studentId: '66f100000000000000000004',
            feeType: 'Semester 3 Tuition Fee',
            amount: 28500,
            dueDate: '2026-08-31',
            status: 'Paid',
            paymentDate: '2026-08-25',
            receiptUrl: '#download-receipt-fee1.pdf',
          },
          {
            id: '66f100000000000000000032',
            studentId: '66f100000000000000000004',
            feeType: 'Exam & Laboratory Fee',
            amount: 3500,
            dueDate: '2026-10-15',
            status: 'Pending',
          },
          {
            id: '66f100000000000000000033',
            studentId: '66f100000000000000000005',
            feeType: 'Semester 3 Tuition Fee',
            amount: 28500,
            dueDate: '2026-08-31',
            status: 'Paid',
            paymentDate: '2026-08-28',
            receiptUrl: '#download-receipt-fee3.pdf',
          },
        ],
      });
    }

    const circCount = await prisma.circular.count();
    if (circCount === 0) {
      await prisma.circular.createMany({
        data: [
          {
            id: '66f100000000000000000041',
            title: 'End-Semester Examination Schedule for November 2026',
            description: 'Official schedule release for all PG degree courses under Periyar University.',
            date: '2026-09-20',
            attachmentUrl: '#download-circ-exam-schedule.pdf',
            isImportant: true,
          },
          {
            id: '66f100000000000000000042',
            title: 'National Level Technical Symposium Registration Open',
            description: 'Annual CSE Department Symposium - Project Expo, Hackathon, and Paper Presentation.',
            date: '2026-09-15',
            attachmentUrl: '#download-circ-symposium.pdf',
            isImportant: false,
          },
        ],
      });
    }

    const sylCount = await prisma.syllabus.count();
    if (sylCount === 0) {
      await prisma.syllabus.createMany({
        data: [
          {
            id: '66f100000000000000000051',
            name: '2025 Regulation (Outcome-Based Education)',
            regulation: '2025',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            year: '2025',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000052',
            name: '2024 Regulation (CBCS Scheme)',
            regulation: '2024',
            programmeId: '66f100000000000000000012',
            programmeName: 'M.Sc. Computer Science',
            year: '2024',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000053',
            name: '2025 Regulation (Data Science Specialization)',
            regulation: '2025',
            programmeId: '66f100000000000000000013',
            programmeName: 'M.Sc. Data Science',
            year: '2025',
            status: 'ACTIVE',
          },
        ],
      });
    }

    const semCount = await prisma.semester.count();
    if (semCount === 0) {
      await prisma.semester.createMany({
        data: [
          { id: '66f100000000000000000061', name: 'Semester 1', number: 1, programmeId: '66f100000000000000000011', programmeName: 'MCA (Master of Computer Applications)', syllabusId: '66f100000000000000000051' },
          { id: '66f100000000000000000062', name: 'Semester 2', number: 2, programmeId: '66f100000000000000000011', programmeName: 'MCA (Master of Computer Applications)', syllabusId: '66f100000000000000000051' },
          { id: '66f100000000000000000063', name: 'Semester 3', number: 3, programmeId: '66f100000000000000000011', programmeName: 'MCA (Master of Computer Applications)', syllabusId: '66f100000000000000000051' },
          { id: '66f100000000000000000064', name: 'Semester 4', number: 4, programmeId: '66f100000000000000000011', programmeName: 'MCA (Master of Computer Applications)', syllabusId: '66f100000000000000000051' },

          { id: '66f100000000000000000065', name: 'Semester 1', number: 1, programmeId: '66f100000000000000000012', programmeName: 'M.Sc. Computer Science', syllabusId: '66f100000000000000000052' },
          { id: '66f100000000000000000066', name: 'Semester 2', number: 2, programmeId: '66f100000000000000000012', programmeName: 'M.Sc. Computer Science', syllabusId: '66f100000000000000000052' },
          { id: '66f100000000000000000067', name: 'Semester 3', number: 3, programmeId: '66f100000000000000000012', programmeName: 'M.Sc. Computer Science', syllabusId: '66f100000000000000000052' },
          { id: '66f100000000000000000068', name: 'Semester 4', number: 4, programmeId: '66f100000000000000000012', programmeName: 'M.Sc. Computer Science', syllabusId: '66f100000000000000000052' },

          { id: '66f100000000000000000069', name: 'Semester 1', number: 1, programmeId: '66f100000000000000000013', programmeName: 'M.Sc. Data Science', syllabusId: '66f100000000000000000053' },
          { id: '66f10000000000000000006a', name: 'Semester 2', number: 2, programmeId: '66f100000000000000000013', programmeName: 'M.Sc. Data Science', syllabusId: '66f100000000000000000053' },
          { id: '66f10000000000000000006b', name: 'Semester 3', number: 3, programmeId: '66f100000000000000000013', programmeName: 'M.Sc. Data Science', syllabusId: '66f100000000000000000053' },
          { id: '66f10000000000000000006c', name: 'Semester 4', number: 4, programmeId: '66f100000000000000000013', programmeName: 'M.Sc. Data Science', syllabusId: '66f100000000000000000053' },
        ],
      });
    }

    const paperCount = await prisma.paper.count();
    if (paperCount === 0) {
      await prisma.paper.createMany({
        data: [
          {
            id: '66f100000000000000000071',
            name: 'Advanced Database Management',
            code: 'MCA302',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            semesterId: '66f100000000000000000063',
            semesterName: 'Semester 3',
            syllabusId: '66f100000000000000000051',
            syllabusName: '2025 Regulation (Outcome-Based Education)',
            credits: 4,
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000072',
            name: 'Software Engineering & Architecture',
            code: 'MCA301',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            semesterId: '66f100000000000000000063',
            semesterName: 'Semester 3',
            syllabusId: '66f100000000000000000051',
            syllabusName: '2025 Regulation (Outcome-Based Education)',
            credits: 4,
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000073',
            name: 'Web Security & Cryptography',
            code: 'MCA303',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            semesterId: '66f100000000000000000063',
            semesterName: 'Semester 3',
            syllabusId: '66f100000000000000000051',
            syllabusName: '2025 Regulation (Outcome-Based Education)',
            credits: 4,
            facultyId: '66f100000000000000000002',
            facultyName: 'Priya Sharma',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000074',
            name: 'Python & Data Analytics',
            code: 'MSC101',
            programmeId: '66f100000000000000000012',
            programmeName: 'M.Sc. Computer Science',
            semesterId: '66f100000000000000000065',
            semesterName: 'Semester 1',
            syllabusId: '66f100000000000000000052',
            syllabusName: '2024 Regulation (CBCS Scheme)',
            credits: 4,
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000075',
            name: 'Advanced Operating Systems',
            code: 'MSC102',
            programmeId: '66f100000000000000000012',
            programmeName: 'M.Sc. Computer Science',
            semesterId: '66f100000000000000000065',
            semesterName: 'Semester 1',
            syllabusId: '66f100000000000000000052',
            syllabusName: '2024 Regulation (CBCS Scheme)',
            credits: 4,
            facultyId: null,
            facultyName: null,
            status: 'ACTIVE',
          },
        ],
      });
    }

    const facAssignCount = await prisma.facultyAssignment.count();
    if (facAssignCount === 0) {
      await prisma.facultyAssignment.createMany({
        data: [
          {
            id: '66f100000000000000000081',
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            paperId: '66f100000000000000000071',
            paperName: 'Advanced Database Management',
            paperCode: 'MCA302',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            semesterId: '66f100000000000000000063',
            semesterName: 'Semester 3',
          },
          {
            id: '66f100000000000000000082',
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            paperId: '66f100000000000000000072',
            paperName: 'Software Engineering & Architecture',
            paperCode: 'MCA301',
            programmeId: '66f100000000000000000011',
            programmeName: 'MCA (Master of Computer Applications)',
            semesterId: '66f100000000000000000063',
            semesterName: 'Semester 3',
          },
          {
            id: '66f100000000000000000083',
            facultyId: '66f100000000000000000003',
            facultyName: 'Arun Kumar',
            paperId: '66f100000000000000000074',
            paperName: 'Python & Data Analytics',
            paperCode: 'MSC101',
            programmeId: '66f100000000000000000012',
            programmeName: 'M.Sc. Computer Science',
            semesterId: '66f100000000000000000065',
            semesterName: 'Semester 1',
          },
        ],
      });
    }

    const scCount = await prisma.studyCentre.count();
    if (scCount === 0) {
      await prisma.studyCentre.createMany({
        data: [
          {
            id: '66f100000000000000000091',
            code: 'PU-SC01',
            name: 'Salem University Main Campus Centre',
            city: 'Salem',
            state: 'Tamil Nadu',
            coordinatorName: 'Dr. K. Senthil',
            contactEmail: 'salem.centre@lms.edu',
            contactPhone: '+91 9443210001',
            address: 'Periyar Palkalai Nagar, Salem - 636011',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000092',
            code: 'PU-SC02',
            name: 'Coimbatore Regional Learning Support Centre',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            coordinatorName: 'Dr. M. Radhika',
            contactEmail: 'cbe.centre@lms.edu',
            contactPhone: '+91 9443210002',
            address: 'Gandhipuram, Coimbatore - 641012',
            status: 'ACTIVE',
          },
          {
            id: '66f100000000000000000093',
            code: 'PU-SC03',
            name: 'Dharmapuri ODL Study Support Centre',
            city: 'Dharmapuri',
            state: 'Tamil Nadu',
            coordinatorName: 'Prof. S. Venkatesh',
            contactEmail: 'dharmapuri.centre@lms.edu',
            contactPhone: '+91 9443210003',
            address: 'Collectorate Road, Dharmapuri - 636701',
            status: 'ACTIVE',
          },
        ],
      });
    }

    const ayCount = await prisma.academicYear.count();
    if (ayCount === 0) {
      await prisma.academicYear.createMany({
        data: [
          { id: '66f1000000000000000000a1', year: '2024-2025', status: 'ACTIVE', isCurrent: false },
          { id: '66f1000000000000000000a2', year: '2025-2026', status: 'ACTIVE', isCurrent: true },
          { id: '66f1000000000000000000a3', year: '2026-2027', status: 'UPCOMING', isCurrent: false },
        ],
      });
    }

    const attCount = await prisma.attendanceRecord.count();
    if (attCount === 0) {
      await prisma.attendanceRecord.createMany({
        data: [
          {
            id: '66f1000000000000000000b1',
            courseId: '66f100000000000000000021',
            courseName: 'Advanced Software Engineering',
            paperId: '66f100000000000000000072',
            studentId: '66f100000000000000000004',
            studentName: 'Karthik Raja',
            date: '2026-09-10',
            status: 'Present',
            remarks: 'Active participant in Agile workshop',
            recordedBy: 'Arun Kumar',
          },
          {
            id: '66f1000000000000000000b2',
            courseId: '66f100000000000000000022',
            courseName: 'Database Management Systems',
            paperId: '66f100000000000000000071',
            studentId: '66f100000000000000000004',
            studentName: 'Karthik Raja',
            date: '2026-09-12',
            status: 'Present',
            remarks: 'Completed lab queries',
            recordedBy: 'Arun Kumar',
          },
          {
            id: '66f1000000000000000000b3',
            courseId: '66f100000000000000000021',
            courseName: 'Advanced Software Engineering',
            paperId: '66f100000000000000000072',
            studentId: '66f100000000000000000005',
            studentName: 'Ananya Roy',
            date: '2026-09-10',
            status: 'Present',
            remarks: 'Submitted sprint report',
            recordedBy: 'Arun Kumar',
          },
        ],
      });
    }

    const logCount = await prisma.auditLog.count();
    if (logCount === 0) {
      await prisma.auditLog.createMany({
        data: [
          {
            id: '66f1000000000000000000c1',
            userId: '66f100000000000000000001',
            userName: 'Hari (Admin)',
            userRole: 'ADMIN',
            action: 'SYSTEM_INITIALIZE',
            resource: 'System',
            details: 'Periyar University LMS initialized with full ODL services, RBAC, and verified schemas.',
          },
          {
            id: '66f1000000000000000000c2',
            userId: '66f100000000000000000002',
            userName: 'Priya Sharma',
            userRole: 'PROGRAM_COORDINATOR',
            action: 'PAPER_ALLOCATION',
            resource: 'Papers',
            details: 'Allocated Advanced Database Management and Software Architecture papers to Faculty Arun Kumar.',
          },
        ],
      });
    }

    // Ensure default mentors exist in the database
    const mentorCount = await prisma.user.count({ where: { role: 'MENTOR' } });
    if (mentorCount === 0) {
      const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
      await prisma.user.create({
        data: {
          id: '66f100000000000000000006',
          name: 'Dr. Meenakshi Sundaram',
          email: 'mentor@lms.edu',
          username: 'mentor',
          passwordHash: defaultPasswordHash,
          role: 'MENTOR',
          status: 'ACTIVE',
          qualification: 'Ph.D. in Computer Science & Academic Mentorship Lead',
          programme: 'MCA',
          department: 'Computer Applications',
          subject: 'Academic Counseling & Research Guidance',
          mobile: '+91 9876543290',
          address: 'Periyar University Campus, Salem',
          academicInfo: 'Senior Mentor | 15+ Yrs Academic Advising | Coordinator of ODL Mentee Progress (Batch 1)',
        },
      });
      await prisma.user.create({
        data: {
          id: '66f100000000000000000007',
          name: 'Prof. R. Soundararajan',
          email: 'mentor2@lms.edu',
          username: 'mentor2',
          passwordHash: defaultPasswordHash,
          role: 'MENTOR',
          status: 'ACTIVE',
          qualification: 'M.Tech, Ph.D. in Information Technology',
          programme: 'MCA',
          department: 'Computer Science',
          subject: 'Software Systems & Career Mentorship',
          mobile: '+91 9876543291',
          address: 'Periyar University Campus, Salem',
          academicInfo: 'Senior Mentor (Batch 2) | Industry Liaison & Project Mentor',
        },
      });
    }

    // Ensure we have at least 10 students so Mentor 1 has a full 10-student batch
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    if (studentCount < 10) {
      const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
      const sampleStudents = [
        { id: '66f100000000000000000008', name: 'Vignesh S', email: 'vignesh@lms.edu', username: 'vignesh', studentId: 'PU2026MCA03', mobile: '+91 9876543214', address: 'Coimbatore, Tamil Nadu', academicInfo: 'CGPA 3.75 | Batch 2024-2026' },
        { id: '66f100000000000000000009', name: 'Priya M', email: 'priyam@lms.edu', username: 'priyam', studentId: 'PU2026MCA04', mobile: '+91 9876543215', address: 'Madurai, Tamil Nadu', academicInfo: 'CGPA 3.92 | Batch 2024-2026' },
        { id: '66f10000000000000000000a', name: 'Suresh Kumar', email: 'suresh@lms.edu', username: 'sureshk', studentId: 'PU2026MCA05', mobile: '+91 9876543216', address: 'Trichy, Tamil Nadu', academicInfo: 'CGPA 3.60 | Batch 2024-2026' },
        { id: '66f10000000000000000000b', name: 'Divya Ramesh', email: 'divya@lms.edu', username: 'divyar', studentId: 'PU2026MCA06', mobile: '+91 9876543217', address: 'Erode, Tamil Nadu', academicInfo: 'CGPA 3.88 | Batch 2024-2026' },
        { id: '66f10000000000000000000c', name: 'Manoj Thangavel', email: 'manoj@lms.edu', username: 'manojt', studentId: 'PU2026MCA07', mobile: '+91 9876543218', address: 'Salem, Tamil Nadu', academicInfo: 'CGPA 3.70 | Batch 2024-2026' },
        { id: '66f10000000000000000000d', name: 'Swetha Parthiban', email: 'swetha@lms.edu', username: 'swethap', studentId: 'PU2026MCA08', mobile: '+91 9876543219', address: 'Namakkal, Tamil Nadu', academicInfo: 'CGPA 3.95 | Batch 2024-2026' },
      ];
      for (const s of sampleStudents) {
        const exists = await prisma.user.findFirst({ where: { email: s.email } });
        if (!exists) {
          await prisma.user.create({
            data: {
              ...s,
              passwordHash: defaultPasswordHash,
              role: 'STUDENT',
              status: 'ACTIVE',
              programme: 'MCA',
              semester: 'Semester 3',
            },
          });
        }
      }
    }

    // Auto-assign existing students to mentors (every 10 students per mentor in sequential order)
    await autoAssignStudentsToMentors();

    isSeeded = true;
  } catch (err) {
    console.error('Seeding warning:', err);
  }
}

// ================= USER MANAGEMENT =================
export async function findUserByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
  await ensureDefaultDataSeeded();
  const cleanId = identifier.trim().toLowerCase();
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanId } },
          { username: { equals: cleanId } },
        ],
      },
    });
    if (user) return sanitizeUserRecord(user);
  } catch (err) {
    console.error('Error finding user:', err);
  }
  return null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await ensureDefaultDataSeeded();
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) return sanitizeUserRecord(user);
  } catch (err) {
    console.error('Error finding user by ID:', err);
  }
  return null;
}

export async function getDashboardCounts() {
  await ensureDefaultDataSeeded();
  try {
    const [totalUsers, programCoordinators, faculty, mentors, students] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROGRAM_COORDINATOR' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);
    return { totalUsers, programCoordinators, faculty, mentors, students };
  } catch (err) {
    return { totalUsers: 0, programCoordinators: 0, faculty: 0, mentors: 0, students: 0 };
  }
}

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  programme?: string;
  semester?: string;
}

export async function getPaginatedUsers(options: GetUsersOptions) {
  await ensureDefaultDataSeeded();
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const search = options.search?.trim() || '';
  const role = options.role || 'ALL';
  const status = options.status || 'ALL';
  const programme = options.programme || 'ALL';
  const semester = options.semester || 'ALL';

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { username: { contains: search } },
      { studentId: { contains: search } },
      { programme: { contains: search } },
    ];
  }

  if (role !== 'ALL') {
    whereClause.role = role as UserRole;
  }

  if (status !== 'ALL') {
    whereClause.status = status as UserStatus;
  }

  if (programme !== 'ALL') {
    whereClause.programme = programme;
  }

  if (semester !== 'ALL') {
    whereClause.semester = semester;
  }

  try {
    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const sanitizedUsers = users.map(({ passwordHash, ...rest }) => sanitizeUserRecord(rest));

    return {
      users: sanitizedUsers as unknown as UserRecord[],
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
    };
  } catch (err) {
    console.error('Error fetching paginated users:', err);
    return { users: [], totalCount: 0, totalPages: 1, currentPage: page };
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  qualification?: string;
  programme?: string;
  subject?: string;
  mobile?: string;
  studentId?: string;
  semester?: string;
  address?: string;
  academicInfo?: string;
  imageUrl?: string;
}) {
  await ensureDefaultDataSeeded();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanUsername = data.username.trim().toLowerCase();

  const existingEmail = await prisma.user.findFirst({ where: { email: cleanEmail } });
  if (existingEmail) {
    throw new Error('An account with this email already exists.');
  }

  const existingUser = await prisma.user.findFirst({ where: { username: cleanUsername } });
  if (existingUser) {
    throw new Error('This username is already in use.');
  }

  // If user is a student, automatically determine their mentor (order-wise, every 10 students per mentor)
  let assignedMentorId = (data as any).mentorId;
  let assignedMentorName = (data as any).mentorName;

  if (data.role === 'STUDENT' && !assignedMentorId) {
    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (mentors.length > 0) {
      let chosenMentor = null;
      // Find the first mentor in order who currently has fewer than 10 students
      for (const m of mentors) {
        const menteeCount = await prisma.user.count({
          where: { role: 'STUDENT', mentorId: m.id },
        });
        if (menteeCount < 10) {
          chosenMentor = m;
          break;
        }
      }
      // If all mentors currently have 10, rollover to the next batch in round-robin/sequential order
      if (!chosenMentor) {
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const idx = Math.floor(totalStudents / 10) % mentors.length;
        chosenMentor = mentors[idx];
      }

      assignedMentorId = chosenMentor.id;
      assignedMentorName = chosenMentor.name;
    }
  }

  const finalAcademicInfo = formatAcademicInfoPayload(data.imageUrl, data.academicInfo);

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      passwordHash: data.passwordHash,
      role: data.role,
      status: data.status || 'ACTIVE',
      qualification: data.qualification,
      programme: data.programme,
      subject: data.subject,
      mobile: data.mobile,
      studentId: data.studentId,
      semester: data.semester,
      address: data.address,
      academicInfo: finalAcademicInfo,
      mentorId: assignedMentorId,
      mentorName: assignedMentorName,
    },
  });

  // If student was assigned to a mentor, create or update mentoring record
  if (data.role === 'STUDENT' && assignedMentorId) {
    try {
      await prisma.mentoring.upsert({
        where: { studentId: newUser.id },
        create: {
          studentId: newUser.id,
          mentorId: assignedMentorId,
          mentorName: assignedMentorName || 'Academic Mentor',
          mentorContact: '+91 9876543290',
          mentorEmail: 'mentor@lms.edu',
          programme: data.programme || 'MCA',
          meetingInfo: `Assigned Academic Mentor: ${assignedMentorName}. Scheduled monthly reviews and continuous evaluation.`,
          historyJson: JSON.stringify([
            `Auto-assigned to Mentor ${assignedMentorName} (Sequential 10-student batch)`,
            `Academic Orientation & Mentoring records established`,
          ]),
          notes: 'Initial enrollment complete. Mentor tracking active.',
        },
        update: {
          mentorId: assignedMentorId,
          mentorName: assignedMentorName || 'Academic Mentor',
        },
      });
    } catch (e) {
      console.warn('Mentoring upsert note:', e);
    }
  }

  return sanitizeUserRecord(newUser);
}

export async function updateUserStatus(id: string, status: UserStatus) {
  await ensureDefaultDataSeeded();
  const updated = await prisma.user.update({
    where: { id },
    data: { status },
  });
  return sanitizeUserRecord(updated);
}

export async function updateUser(id: string, data: Partial<UserRecord> & { imageUrl?: string }) {
  await ensureDefaultDataSeeded();
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.username !== undefined) updateData.username = data.username.trim().toLowerCase();
  if (data.role !== undefined) updateData.role = data.role;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.qualification !== undefined) updateData.qualification = data.qualification;
  if (data.programme !== undefined) updateData.programme = data.programme;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.mobile !== undefined) updateData.mobile = data.mobile;
  if (data.studentId !== undefined) updateData.studentId = data.studentId;
  if (data.semester !== undefined) updateData.semester = data.semester;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.mentorId !== undefined) updateData.mentorId = data.mentorId;
  if (data.mentorName !== undefined) updateData.mentorName = data.mentorName;

  if (data.imageUrl !== undefined || data.academicInfo !== undefined) {
    const existing = await prisma.user.findUnique({ where: { id } });
    const existingImage = extractUserImageUrl(existing?.academicInfo) || null;
    const existingDetails = extractUserAcademicDetails(existing?.academicInfo) || '';

    const newImage = data.imageUrl !== undefined ? data.imageUrl : existingImage;
    const newDetails = data.academicInfo !== undefined ? data.academicInfo : existingDetails;

    updateData.academicInfo = formatAcademicInfoPayload(newImage, newDetails);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  if (data.mentorId !== undefined && updated.role === 'STUDENT') {
    try {
      await prisma.mentoring.upsert({
        where: { studentId: updated.id },
        create: {
          studentId: updated.id,
          mentorId: data.mentorId,
          mentorName: data.mentorName || 'Academic Mentor',
          mentorContact: '+91 9876543290',
          mentorEmail: 'mentor@lms.edu',
          programme: updated.programme || 'MCA',
          meetingInfo: `Assigned Academic Mentor: ${data.mentorName || 'Mentor'}.`,
          historyJson: JSON.stringify([`Mentor updated to ${data.mentorName || 'Mentor'}`]),
          notes: 'Mentor updated by administrator.',
        },
        update: {
          mentorId: data.mentorId,
          mentorName: data.mentorName || 'Academic Mentor',
        },
      });
    } catch (e) {
      console.warn('Mentoring update error:', e);
    }
  }

  return sanitizeUserRecord(updated);
}

export async function resetUserPassword(id: string, passwordHash: string) {
  await ensureDefaultDataSeeded();
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
  return true;
}

export async function deleteUser(id: string) {
  await ensureDefaultDataSeeded();
  await prisma.user.delete({ where: { id } });
  return true;
}

// ================= PROGRAM MANAGEMENT =================
export async function getPrograms(): Promise<ProgramItem[]> {
  await ensureDefaultDataSeeded();
  const programs = await prisma.program.findMany({ orderBy: { createdAt: 'desc' } });
  return programs.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    department: p.department,
    eligibility: p.eligibility,
    medium: p.medium,
    syllabusId: p.syllabusId,
    syllabusName: p.syllabusName,
    academicYear: p.academicYear,
    calendarYear: p.calendarYear,
    status: p.status as 'ACTIVE' | 'INACTIVE',
    createdAt: p.createdAt.toISOString().split('T')[0],
  }));
}

export async function saveProgram(prog: Omit<ProgramItem, 'id' | 'createdAt'> & { id?: string }): Promise<ProgramItem> {
  await ensureDefaultDataSeeded();
  if (prog.id) {
    const updated = await prisma.program.update({
      where: { id: prog.id },
      data: {
        name: prog.name,
        code: prog.code,
        department: prog.department,
        eligibility: prog.eligibility,
        medium: prog.medium,
        syllabusId: prog.syllabusId,
        syllabusName: prog.syllabusName,
        academicYear: prog.academicYear,
        calendarYear: prog.calendarYear,
        status: prog.status,
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      department: updated.department,
      eligibility: updated.eligibility,
      medium: updated.medium,
      syllabusId: updated.syllabusId,
      syllabusName: updated.syllabusName,
      academicYear: updated.academicYear,
      calendarYear: updated.calendarYear,
      status: updated.status as 'ACTIVE' | 'INACTIVE',
      createdAt: updated.createdAt.toISOString().split('T')[0],
    };
  } else {
    const created = await prisma.program.create({
      data: {
        name: prog.name,
        code: prog.code,
        department: prog.department,
        eligibility: prog.eligibility,
        medium: prog.medium,
        syllabusId: prog.syllabusId,
        syllabusName: prog.syllabusName,
        academicYear: prog.academicYear,
        calendarYear: prog.calendarYear,
        status: prog.status || 'ACTIVE',
      },
    });
    return {
      id: created.id,
      name: created.name,
      code: created.code,
      department: created.department,
      eligibility: created.eligibility,
      medium: created.medium,
      syllabusId: created.syllabusId,
      syllabusName: created.syllabusName,
      academicYear: created.academicYear,
      calendarYear: created.calendarYear,
      status: created.status as 'ACTIVE' | 'INACTIVE',
      createdAt: created.createdAt.toISOString().split('T')[0],
    };
  }
}

export async function deleteProgram(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.program.delete({ where: { id } });
  return true;
}

// ================= COURSE MANAGEMENT =================
export async function getCourses(): Promise<CourseItem[]> {
  await ensureDefaultDataSeeded();
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    programmeId: c.programmeId,
    programmeName: c.programmeName,
    semester: c.semester,
    subject: c.subject,
    facultyId: c.facultyId,
    facultyName: c.facultyName,
    assessment: c.assessment,
    status: c.status as 'ACTIVE' | 'INACTIVE',
    appSubmission: c.appSubmission,
    verificationRequired: c.verificationRequired,
    admissionApproval: c.admissionApproval,
    lmsAccountCreation: c.lmsAccountCreation,
  }));
}

export async function saveCourse(crs: Omit<CourseItem, 'id'> & { id?: string }): Promise<CourseItem> {
  await ensureDefaultDataSeeded();
  if (crs.id) {
    const updated = await prisma.course.update({
      where: { id: crs.id },
      data: {
        name: crs.name,
        code: crs.code,
        programmeId: crs.programmeId,
        programmeName: crs.programmeName,
        semester: crs.semester,
        subject: crs.subject,
        facultyId: crs.facultyId,
        facultyName: crs.facultyName,
        assessment: crs.assessment,
        status: crs.status,
        appSubmission: crs.appSubmission ?? true,
        verificationRequired: crs.verificationRequired ?? true,
        admissionApproval: crs.admissionApproval ?? true,
        lmsAccountCreation: crs.lmsAccountCreation ?? true,
      },
    });
    return updated as CourseItem;
  } else {
    const created = await prisma.course.create({
      data: {
        name: crs.name,
        code: crs.code,
        programmeId: crs.programmeId,
        programmeName: crs.programmeName,
        semester: crs.semester,
        subject: crs.subject,
        facultyId: crs.facultyId,
        facultyName: crs.facultyName,
        assessment: crs.assessment,
        status: crs.status || 'ACTIVE',
        appSubmission: crs.appSubmission ?? true,
        verificationRequired: crs.verificationRequired ?? true,
        admissionApproval: crs.admissionApproval ?? true,
        lmsAccountCreation: crs.lmsAccountCreation ?? true,
      },
    });
    return created as CourseItem;
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.course.delete({ where: { id } });
  return true;
}

// ================= APPLICATION WORKFLOW =================
export async function getApplications(): Promise<ApplicationItem[]> {
  await ensureDefaultDataSeeded();
  const apps = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });
  return apps.map((a) => ({
    id: a.id,
    applicantName: a.applicantName,
    email: a.email,
    mobile: a.mobile,
    programme: a.programme,
    status: a.status as ApplicationItem['status'],
    appliedDate: a.appliedDate,
    notes: a.notes || undefined,
  }));
}

export async function updateApplicationStatus(id: string, status: ApplicationItem['status']): Promise<ApplicationItem | null> {
  await ensureDefaultDataSeeded();
  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  if (status === 'Account Created') {
    try {
      const passwordHash = await bcrypt.hash('Password@123', 10);
      await createUser({
        name: updated.applicantName,
        email: updated.email,
        username: updated.email.split('@')[0],
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        programme: updated.programme,
        semester: 'Semester 1',
        mobile: updated.mobile,
        studentId: `PU2026${updated.programme.replace(/[^A-Z]/g, '')}${Math.floor(100 + Math.random() * 900)}`,
      });
    } catch {
      // Account may already exist
    }
  }

  return {
    id: updated.id,
    applicantName: updated.applicantName,
    email: updated.email,
    mobile: updated.mobile,
    programme: updated.programme,
    status: updated.status as ApplicationItem['status'],
    appliedDate: updated.appliedDate,
    notes: updated.notes || undefined,
  };
}

// ================= PROGRAM COORDINATOR MAPPINGS =================
export async function getFacultyMappings(): Promise<FacultyMapping[]> {
  await ensureDefaultDataSeeded();
  const maps = await prisma.facultyMapping.findMany();
  return maps;
}

export async function saveFacultyMapping(mapData: Omit<FacultyMapping, 'id'>): Promise<FacultyMapping> {
  await ensureDefaultDataSeeded();
  const created = await prisma.facultyMapping.create({ data: mapData });
  return created;
}

export async function getStudentMappings(): Promise<StudentMapping[]> {
  await ensureDefaultDataSeeded();
  const maps = await prisma.studentMapping.findMany();
  return maps;
}

export async function saveStudentMapping(mapData: Omit<StudentMapping, 'id'>): Promise<StudentMapping> {
  await ensureDefaultDataSeeded();
  const created = await prisma.studentMapping.create({ data: mapData });
  return created;
}

// ================= LEARNING RESOURCES =================
export async function getLearningResources(studentId?: string): Promise<LearningResourceItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.learningResource.findMany({ orderBy: { uploadedAt: 'desc' } });

  // Count views for each resource & student-specific watch progress
  let viewCountMap = new Map<string, number>();
  let studentViewsMap = new Map<string, any>();
  try {
    const views = await prisma.resourceView.findMany();
    views.forEach((v) => {
      viewCountMap.set(v.resourceId, (viewCountMap.get(v.resourceId) || 0) + 1);
      if (studentId && v.studentId === studentId) {
        studentViewsMap.set(v.resourceId, v);
      }
    });
  } catch {
    // If table not queried yet
  }

  return list.map((r) => {
    const sView = studentViewsMap.get(r.id);
    return {
      id: r.id,
      title: r.title,
      courseId: r.courseId,
      courseName: r.courseName,
      subject: r.subject,
      fileType: r.fileType as LearningResourceItem['fileType'],
      fileUrl: r.fileUrl,
      notes: r.notes || undefined,
      uploadedAt: r.uploadedAt,
      programmeId: r.programmeId || undefined,
      programmeName: r.programmeName || undefined,
      semesterName: r.semesterName || undefined,
      paperId: r.paperId || undefined,
      paperName: r.paperName || undefined,
      unitNumber: r.unitNumber || 1,
      unitName: r.unitName || (r.unitNumber ? `Unit ${r.unitNumber}` : 'Unit 1'),
      viewCount: viewCountMap.get(r.id) || 0,
      lastPosition: sView ? (sView.lastPosition ?? 0) : 0,
      duration: sView ? (sView.duration ?? 0) : 0,
      percentage: sView ? (sView.percentage ?? 0) : 0,
      isCompleted: sView ? (sView.isCompleted ?? false) : false,
    };
  });
}

export async function saveLearningResource(res: Omit<LearningResourceItem, 'id' | 'uploadedAt'> & { id?: string }): Promise<LearningResourceItem> {
  await ensureDefaultDataSeeded();
  const uploadedAt = new Date().toISOString().split('T')[0];
  const unitNum = Number(res.unitNumber) || 1;
  const unitNm = res.unitName || `Unit ${unitNum}`;

  if (res.id) {
    const updated = await prisma.learningResource.update({
      where: { id: res.id },
      data: {
        title: res.title,
        courseId: res.courseId,
        courseName: res.courseName,
        subject: res.subject,
        fileType: res.fileType,
        fileUrl: res.fileUrl,
        notes: res.notes,
        programmeId: res.programmeId,
        programmeName: res.programmeName,
        semesterName: res.semesterName,
        paperId: res.paperId,
        paperName: res.paperName,
        unitNumber: unitNum,
        unitName: unitNm,
      },
    });
    return {
      ...updated,
      fileType: updated.fileType as LearningResourceItem['fileType'],
      notes: updated.notes || undefined,
      programmeId: updated.programmeId || undefined,
      programmeName: updated.programmeName || undefined,
      semesterName: updated.semesterName || undefined,
      paperId: updated.paperId || undefined,
      paperName: updated.paperName || undefined,
      unitNumber: updated.unitNumber || unitNum,
      unitName: updated.unitName || unitNm,
    };
  } else {
    const created = await prisma.learningResource.create({
      data: {
        title: res.title,
        courseId: res.courseId,
        courseName: res.courseName,
        subject: res.subject,
        fileType: res.fileType,
        fileUrl: res.fileUrl,
        notes: res.notes,
        uploadedAt,
        programmeId: res.programmeId,
        programmeName: res.programmeName,
        semesterName: res.semesterName,
        paperId: res.paperId,
        paperName: res.paperName,
        unitNumber: unitNum,
        unitName: unitNm,
      },
    });
    return {
      ...created,
      fileType: created.fileType as LearningResourceItem['fileType'],
      notes: created.notes || undefined,
      programmeId: created.programmeId || undefined,
      programmeName: created.programmeName || undefined,
      semesterName: created.semesterName || undefined,
      paperId: created.paperId || undefined,
      paperName: created.paperName || undefined,
      unitNumber: created.unitNumber || unitNum,
      unitName: created.unitName || unitNm,
    };
  }
}

export async function deleteLearningResource(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  try {
    await prisma.resourceView.deleteMany({ where: { resourceId: id } });
  } catch {}
  await prisma.learningResource.delete({ where: { id } });
  return true;
}

export async function recordResourceView(data: {
  resourceId: string;
  studentId: string;
  studentName: string;
  studentRegNo?: string;
  lastPosition?: number;
  duration?: number;
  percentage?: number;
  isCompleted?: boolean;
}): Promise<ResourceViewItem> {
  await ensureDefaultDataSeeded();
  const existing = await prisma.resourceView.findFirst({
    where: {
      resourceId: data.resourceId,
      studentId: data.studentId,
    },
  });

  if (existing) {
    const isComp = data.isCompleted !== undefined ? data.isCompleted : existing.isCompleted;
    const maxPct = data.percentage !== undefined ? Math.max(existing.percentage || 0, data.percentage) : existing.percentage;
    const updated = await prisma.resourceView.update({
      where: { id: existing.id },
      data: {
        studentName: data.studentName,
        studentRegNo: data.studentRegNo || existing.studentRegNo,
        lastPosition: data.lastPosition !== undefined ? data.lastPosition : existing.lastPosition,
        duration: data.duration !== undefined ? data.duration : existing.duration,
        percentage: maxPct,
        isCompleted: isComp || (maxPct !== null && maxPct !== undefined && maxPct >= 90),
        viewedAt: new Date(),
      },
    });
    return {
      id: updated.id,
      resourceId: updated.resourceId,
      studentId: updated.studentId,
      studentName: updated.studentName,
      studentRegNo: updated.studentRegNo || undefined,
      lastPosition: updated.lastPosition ?? 0,
      duration: updated.duration ?? 0,
      percentage: updated.percentage ?? 0,
      isCompleted: updated.isCompleted ?? false,
      viewedAt: updated.viewedAt.toISOString(),
    };
  }

  const isComp = data.isCompleted || (data.percentage !== undefined && data.percentage >= 90);
  const created = await prisma.resourceView.create({
    data: {
      resourceId: data.resourceId,
      studentId: data.studentId,
      studentName: data.studentName,
      studentRegNo: data.studentRegNo || null,
      lastPosition: data.lastPosition ?? 0,
      duration: data.duration ?? 0,
      percentage: data.percentage ?? 0,
      isCompleted: isComp ?? false,
      viewedAt: new Date(),
    },
  });

  return {
    id: created.id,
    resourceId: created.resourceId,
    studentId: created.studentId,
    studentName: created.studentName,
    studentRegNo: created.studentRegNo || undefined,
    lastPosition: created.lastPosition ?? 0,
    duration: created.duration ?? 0,
    percentage: created.percentage ?? 0,
    isCompleted: created.isCompleted ?? false,
    viewedAt: created.viewedAt.toISOString(),
  };
}

export async function updateResourceVideoProgress(data: {
  resourceId: string;
  studentId: string;
  studentName?: string;
  studentRegNo?: string;
  lastPosition: number;
  duration: number;
  percentage: number;
  isCompleted?: boolean;
}): Promise<ResourceViewItem> {
  return await recordResourceView({
    resourceId: data.resourceId,
    studentId: data.studentId,
    studentName: data.studentName || 'Student',
    studentRegNo: data.studentRegNo,
    lastPosition: data.lastPosition,
    duration: data.duration,
    percentage: data.percentage,
    isCompleted: data.isCompleted || data.percentage >= 90,
  });
}

export async function getStudentResourceViews(studentId: string): Promise<ResourceViewItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.resourceView.findMany({
    where: { studentId },
    orderBy: { viewedAt: 'desc' },
  });
  return list.map((v) => ({
    id: v.id,
    resourceId: v.resourceId,
    studentId: v.studentId,
    studentName: v.studentName,
    studentRegNo: v.studentRegNo || undefined,
    lastPosition: v.lastPosition ?? 0,
    duration: v.duration ?? 0,
    percentage: v.percentage ?? 0,
    isCompleted: v.isCompleted ?? false,
    viewedAt: v.viewedAt.toISOString(),
  }));
}

export async function getResourceViews(resourceId: string): Promise<ResourceViewItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.resourceView.findMany({
    where: { resourceId },
    orderBy: { viewedAt: 'desc' },
  });
  return list.map((v) => ({
    id: v.id,
    resourceId: v.resourceId,
    studentId: v.studentId,
    studentName: v.studentName,
    studentRegNo: v.studentRegNo || undefined,
    lastPosition: v.lastPosition ?? 0,
    duration: v.duration ?? 0,
    percentage: v.percentage ?? 0,
    isCompleted: v.isCompleted ?? false,
    viewedAt: v.viewedAt.toISOString(),
  }));
}

// ================= ASSESSMENTS =================
export async function getAssessments(): Promise<AssessmentItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.assessment.findMany({ orderBy: { createdAt: 'desc' } });
  return list.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    programmeId: a.programmeId || undefined,
    programmeName: a.programmeName || undefined,
    semesterName: a.semesterName || undefined,
    paperId: a.paperId || undefined,
    paperCode: a.paperCode || undefined,
    courseId: a.courseId,
    courseName: a.courseName,
    date: a.date,
    duration: a.duration,
    maxMarks: a.maxMarks,
    instructions: a.instructions,
    questions: a.questions,
    isPublished: a.isPublished,
    status: a.status as AssessmentItem['status'],
  }));
}

export async function saveAssessment(ass: Omit<AssessmentItem, 'id'> & { id?: string }): Promise<AssessmentItem> {
  await ensureDefaultDataSeeded();
  if (ass.id) {
    const updated = await prisma.assessment.update({
      where: { id: ass.id },
      data: {
        title: ass.title,
        description: ass.description,
        programmeId: ass.programmeId,
        programmeName: ass.programmeName,
        semesterName: ass.semesterName,
        paperId: ass.paperId,
        paperCode: ass.paperCode,
        courseId: ass.courseId,
        courseName: ass.courseName,
        date: ass.date,
        duration: ass.duration,
        maxMarks: ass.maxMarks,
        instructions: ass.instructions,
        questions: ass.questions,
        isPublished: ass.isPublished,
        status: ass.status,
      },
    });
    return updated as unknown as AssessmentItem;
  } else {
    const created = await prisma.assessment.create({
      data: {
        title: ass.title,
        description: ass.description,
        programmeId: ass.programmeId,
        programmeName: ass.programmeName,
        semesterName: ass.semesterName,
        paperId: ass.paperId,
        paperCode: ass.paperCode,
        courseId: ass.courseId,
        courseName: ass.courseName,
        date: ass.date,
        duration: ass.duration,
        maxMarks: ass.maxMarks,
        instructions: ass.instructions,
        questions: ass.questions,
        isPublished: ass.isPublished ?? false,
        status: ass.status || 'Upcoming',
      },
    });
    return created as unknown as AssessmentItem;
  }
}


export async function toggleAssessmentPublish(id: string): Promise<AssessmentItem | null> {
  await ensureDefaultDataSeeded();
  const current = await prisma.assessment.findUnique({ where: { id } });
  if (!current) return null;
  const updated = await prisma.assessment.update({
    where: { id },
    data: { isPublished: !current.isPublished },
  });
  return updated as unknown as AssessmentItem;
}

export async function deleteAssessment(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.assessment.delete({ where: { id } });
  return true;
}

export async function getAssessmentById(id: string): Promise<AssessmentItem | null> {
  await ensureDefaultDataSeeded();
  const a = await prisma.assessment.findUnique({ where: { id } });
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    programmeId: a.programmeId || undefined,
    programmeName: a.programmeName || undefined,
    semesterName: a.semesterName || undefined,
    paperId: a.paperId || undefined,
    paperCode: a.paperCode || undefined,
    courseId: a.courseId,
    courseName: a.courseName,
    date: a.date,
    duration: a.duration,
    maxMarks: a.maxMarks,
    instructions: a.instructions,
    questions: a.questions,
    isPublished: a.isPublished,
    status: a.status as AssessmentItem['status'],
  };
}

export async function submitAssessmentResult(submission: {
  assessmentId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxMarks: number;
  percentage: number;
  answers: string;
}): Promise<AssessmentSubmissionItem> {
  await ensureDefaultDataSeeded();
  const created = await prisma.assessmentSubmission.create({
    data: {
      assessmentId: submission.assessmentId,
      studentId: submission.studentId,
      studentName: submission.studentName,
      score: submission.score,
      maxMarks: submission.maxMarks,
      percentage: submission.percentage,
      answers: submission.answers,
    },
  });
  return {
    id: created.id,
    assessmentId: created.assessmentId,
    studentId: created.studentId,
    studentName: created.studentName,
    score: created.score,
    maxMarks: created.maxMarks,
    percentage: created.percentage,
    answers: created.answers,
    submittedAt: created.submittedAt.toISOString(),
  };
}

export async function getAssessmentSubmissions(assessmentId?: string): Promise<AssessmentSubmissionItem[]> {
  await ensureDefaultDataSeeded();
  const where = assessmentId ? { assessmentId } : {};
  const list = await prisma.assessmentSubmission.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
  });
  return list.map((sub) => ({
    id: sub.id,
    assessmentId: sub.assessmentId,
    studentId: sub.studentId,
    studentName: sub.studentName,
    score: sub.score,
    maxMarks: sub.maxMarks,
    percentage: sub.percentage,
    answers: sub.answers,
    submittedAt: sub.submittedAt.toISOString(),
  }));
}

export async function getStudentAssessmentSubmissions(studentId: string): Promise<AssessmentSubmissionItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.assessmentSubmission.findMany({
    where: { studentId },
    orderBy: { submittedAt: 'desc' },
  });
  return list.map((sub) => ({
    id: sub.id,
    assessmentId: sub.assessmentId,
    studentId: sub.studentId,
    studentName: sub.studentName,
    score: sub.score,
    maxMarks: sub.maxMarks,
    percentage: sub.percentage,
    answers: sub.answers,
    submittedAt: sub.submittedAt.toISOString(),
  }));
}

// ================= ASSIGNMENTS =================
export async function getAssignments(): Promise<AssignmentItem[]> {
  await ensureDefaultDataSeeded();
  const [list, students] = await Promise.all([
    prisma.assignment.findMany({
      include: { submissions: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, username: true, studentId: true, email: true },
    }),
  ]);

  const studentMap = new Map<string, { registerNumber: string; email: string }>();
  students.forEach((s) => {
    studentMap.set(s.id, {
      registerNumber: s.studentId || s.username || s.id,
      email: s.email || '',
    });
  });

  return list.map((a) => {
    const meta = parseAssignmentInstructions(a.instructions);
    return {
      id: a.id,
      title: a.title,
      unitNumber: meta.unitNumber,
      unitName: meta.unitName,
      courseId: a.courseId,
      courseName: a.courseName,
      description: a.description,
      detailedDescription: meta.detailedDescription,
      attachmentUrl: a.attachmentUrl || undefined,
      resources: meta.resources,
      startDate: meta.startDate,
      dueDate: a.dueDate,
      maxMarks: a.maxMarks,
      instructions: meta.instructions,
      additionalInstructions: meta.additionalInstructions,
      allowResubmission: meta.allowResubmission,
      assignmentType: meta.assignmentType,
      scheduledDate: meta.scheduledDate,
      presentationTopic: meta.presentationTopic,
      submissions: a.submissions.map((s) => {
        const subMeta = parseSubmissionFeedback(s.feedback);
        const stuInfo = studentMap.get(s.studentId);
        let currentStatus: SubmissionStatus = 'Submitted';
        if (s.marks !== null && s.marks !== undefined) {
          currentStatus = 'Reviewed';
        } else if (s.status === 'Reviewed' || s.status === 'Evaluated') {
          currentStatus = 'Reviewed';
        } else if (s.status === 'Late Submission' || s.status === 'Late') {
          currentStatus = 'Late Submission';
        } else {
          currentStatus = 'Submitted';
        }

        return {
          id: s.id,
          assignmentId: s.assignmentId,
          studentId: s.studentId,
          studentName: s.studentName,
          studentRegisterNumber: stuInfo?.registerNumber || s.studentId,
          studentEmail: stuInfo?.email,
          submissionDate: s.submissionDate,
          fileUrl: s.fileUrl,
          fileName: subMeta.fileName,
          fileSize: subMeta.fileSize,
          comments: subMeta.comments,
          marks: s.marks ?? undefined,
          feedback: subMeta.feedback ?? undefined,
          status: currentStatus,
        };
      }),
    };
  });
}

export async function saveAssignment(asg: Omit<AssignmentItem, 'id' | 'submissions'> & { id?: string }): Promise<AssignmentItem> {
  await ensureDefaultDataSeeded();
  const formattedInstructions = formatAssignmentInstructions(
    asg.instructions || asg.detailedDescription,
    {
      type: asg.assignmentType || 'Objective',
      unitNumber: asg.unitNumber !== undefined ? asg.unitNumber : 1,
      unitName: asg.unitName || (asg.unitNumber ? `Unit ${asg.unitNumber}` : 'Unit 1'),
      startDate: asg.startDate,
      detailedDescription: asg.detailedDescription,
      additionalInstructions: asg.additionalInstructions,
      allowResubmission: asg.allowResubmission ?? false,
      resources: asg.resources,
      scheduledDate: asg.scheduledDate,
      presentationTopic: asg.presentationTopic,
    }
  );

  if (asg.id) {
    const updated = await prisma.assignment.update({
      where: { id: asg.id },
      data: {
        title: asg.title,
        description: asg.description,
        courseId: asg.courseId,
        courseName: asg.courseName,
        dueDate: asg.dueDate,
        maxMarks: asg.maxMarks,
        instructions: formattedInstructions,
        attachmentUrl: asg.attachmentUrl,
      },
      include: { submissions: true },
    });
    const meta = parseAssignmentInstructions(updated.instructions);
    return {
      ...updated,
      unitNumber: meta.unitNumber,
      unitName: meta.unitName,
      detailedDescription: meta.detailedDescription,
      resources: meta.resources,
      startDate: meta.startDate,
      additionalInstructions: meta.additionalInstructions,
      allowResubmission: meta.allowResubmission,
      instructions: meta.instructions,
      assignmentType: meta.assignmentType,
      scheduledDate: meta.scheduledDate,
      presentationTopic: meta.presentationTopic,
      attachmentUrl: updated.attachmentUrl || undefined,
      submissions: updated.submissions.map((s) => {
        const subMeta = parseSubmissionFeedback(s.feedback);
        return {
          id: s.id,
          assignmentId: s.assignmentId,
          studentId: s.studentId,
          studentName: s.studentName,
          submissionDate: s.submissionDate,
          fileUrl: s.fileUrl,
          fileName: subMeta.fileName,
          fileSize: subMeta.fileSize,
          comments: subMeta.comments,
          marks: s.marks ?? undefined,
          feedback: subMeta.feedback ?? undefined,
          status: (s.marks !== null && s.marks !== undefined) ? 'Reviewed' : (s.status as SubmissionStatus),
        };
      }),
    };
  } else {
    const created = await prisma.assignment.create({
      data: {
        title: asg.title,
        description: asg.description,
        courseId: asg.courseId,
        courseName: asg.courseName,
        dueDate: asg.dueDate,
        maxMarks: asg.maxMarks,
        instructions: formattedInstructions,
        attachmentUrl: asg.attachmentUrl,
      },
      include: { submissions: true },
    });
    const meta = parseAssignmentInstructions(created.instructions);
    return {
      ...created,
      unitNumber: meta.unitNumber,
      unitName: meta.unitName,
      detailedDescription: meta.detailedDescription,
      resources: meta.resources,
      startDate: meta.startDate,
      additionalInstructions: meta.additionalInstructions,
      allowResubmission: meta.allowResubmission,
      instructions: meta.instructions,
      assignmentType: meta.assignmentType,
      scheduledDate: meta.scheduledDate,
      presentationTopic: meta.presentationTopic,
      attachmentUrl: created.attachmentUrl || undefined,
      submissions: [],
    };
  }
}

export async function submitAssignmentSolution(
  assignmentId: string,
  studentId: string,
  studentName: string,
  fileUrl: string,
  comments?: string,
  fileName?: string,
  fileSize?: string
): Promise<{ success: boolean; error?: string; assignment?: AssignmentItem }> {
  await ensureDefaultDataSeeded();
  const asg = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { submissions: true },
  });

  if (!asg) return { success: false, error: 'Assignment not found.' };

  const meta = parseAssignmentInstructions(asg.instructions);
  const existing = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, studentId },
  });

  // Duplicate Submission Prevention:
  if (existing && meta.allowResubmission === false) {
    return {
      success: false,
      error: 'Resubmission is not enabled for this assignment. Duplicate submissions are prevented.',
    };
  }

  // Calculate Late Submission:
  const now = new Date();
  let isLate = false;
  if (asg.dueDate) {
    const d = new Date(asg.dueDate);
    if (!isNaN(d.getTime()) && now > d) {
      isLate = true;
    }
  }

  const subStatus: SubmissionStatus = isLate ? 'Late Submission' : 'Submitted';
  const submissionDate = now.toISOString();

  const formattedFeedback = formatSubmissionFeedback(existing?.feedback, {
    comments: comments || undefined,
    fileName: fileName || undefined,
    fileSize: fileSize || undefined,
  });

  if (existing) {
    await prisma.assignmentSubmission.update({
      where: { id: existing.id },
      data: {
        fileUrl,
        submissionDate,
        status: subStatus,
        feedback: formattedFeedback,
      },
    });
  } else {
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        studentName,
        submissionDate,
        fileUrl,
        status: subStatus,
        feedback: formattedFeedback,
      },
    });
  }

  const list = await getAssignments();
  const updatedAsg = list.find((a) => a.id === assignmentId);
  return { success: true, assignment: updatedAsg };
}

export async function gradeAssignmentSubmission(
  assignmentId: string,
  studentId: string,
  marks: number,
  facultyFeedback: string
): Promise<AssignmentItem | null> {
  await ensureDefaultDataSeeded();
  const sub = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, studentId },
  });

  if (sub) {
    const subMeta = parseSubmissionFeedback(sub.feedback);
    const updatedFeedback = formatSubmissionFeedback(facultyFeedback, {
      comments: subMeta.comments,
      fileName: subMeta.fileName,
      fileSize: subMeta.fileSize,
    });

    await prisma.assignmentSubmission.update({
      where: { id: sub.id },
      data: {
        marks,
        feedback: updatedFeedback,
        status: 'Reviewed',
      },
    });
  }

  const list = await getAssignments();
  return list.find((a) => a.id === assignmentId) || null;
}

export async function deleteAssignment(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.assignment.delete({ where: { id } });
  return true;
}

// ================= INTERNAL MARKS =================
export async function getInternalMarks(): Promise<InternalMarkItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.internalMark.findMany();
  return list;
}

export async function saveInternalMark(markData: Omit<InternalMarkItem, 'id' | 'updatedAt'> & { id?: string }): Promise<InternalMarkItem> {
  await ensureDefaultDataSeeded();
  const updatedAt = new Date().toISOString().split('T')[0];
  if (markData.id) {
    const updated = await prisma.internalMark.update({
      where: { id: markData.id },
      data: {
        programmeId: markData.programmeId,
        programmeName: markData.programmeName,
        courseId: markData.courseId,
        courseName: markData.courseName,
        semester: markData.semester,
        studentId: markData.studentId,
        studentName: markData.studentName,
        marks: markData.marks,
        maxMarks: markData.maxMarks,
        updatedAt,
      },
    });
    return updated;
  } else {
    const created = await prisma.internalMark.create({
      data: {
        programmeId: markData.programmeId,
        programmeName: markData.programmeName,
        courseId: markData.courseId,
        courseName: markData.courseName,
        semester: markData.semester,
        studentId: markData.studentId,
        studentName: markData.studentName,
        marks: markData.marks,
        maxMarks: markData.maxMarks,
        updatedAt,
      },
    });
    return created;
  }
}

// ================= SCHEDULE / LIVE CLASSES =================
export async function getSchedules(): Promise<ScheduleItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.schedule.findMany({ orderBy: { createdAt: 'desc' } });
  return list.map((s) => ({
    id: s.id,
    courseId: s.courseId,
    courseName: s.courseName,
    subject: s.subject,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    facultyId: s.facultyId,
    facultyName: s.facultyName,
    classType: s.classType as ScheduleItem['classType'],
    meetingLink: s.meetingLink || undefined,
    status: s.status as ScheduleItem['status'],
  }));
}

export async function saveSchedule(sch: Omit<ScheduleItem, 'id'> & { id?: string }): Promise<ScheduleItem> {
  await ensureDefaultDataSeeded();
  if (sch.id) {
    const updated = await prisma.schedule.update({
      where: { id: sch.id },
      data: {
        courseId: sch.courseId,
        courseName: sch.courseName,
        subject: sch.subject,
        date: sch.date,
        startTime: sch.startTime,
        endTime: sch.endTime,
        room: sch.room,
        facultyId: sch.facultyId,
        facultyName: sch.facultyName,
        classType: sch.classType,
        meetingLink: sch.meetingLink,
        status: sch.status,
      },
    });
    return {
      ...updated,
      classType: updated.classType as ScheduleItem['classType'],
      meetingLink: updated.meetingLink || undefined,
      status: updated.status as ScheduleItem['status'],
    };
  } else {
    const created = await prisma.schedule.create({
      data: {
        courseId: sch.courseId,
        courseName: sch.courseName,
        subject: sch.subject,
        date: sch.date,
        startTime: sch.startTime,
        endTime: sch.endTime,
        room: sch.room,
        facultyId: sch.facultyId,
        facultyName: sch.facultyName,
        classType: sch.classType,
        meetingLink: sch.meetingLink,
        status: sch.status || 'Upcoming',
      },
    });
    return {
      ...created,
      classType: created.classType as ScheduleItem['classType'],
      meetingLink: created.meetingLink || undefined,
      status: created.status as ScheduleItem['status'],
    };
  }
}

export async function deleteSchedule(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.schedule.delete({ where: { id } });
  return true;
}

// ================= FEE ACTIVITY =================
export async function getFeeActivities(studentId?: string): Promise<FeeActivityItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.feeActivity.findMany({
    where: studentId ? { studentId } : undefined,
  });
  return list.map((f) => ({
    id: f.id,
    studentId: f.studentId,
    feeType: f.feeType,
    amount: f.amount,
    dueDate: f.dueDate,
    status: f.status as FeeActivityItem['status'],
    paymentDate: f.paymentDate || undefined,
    receiptUrl: f.receiptUrl || undefined,
  }));
}

// ================= DISCUSSION FORUMS =================
export async function getDiscussionForums(): Promise<ForumItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.forum.findMany({
    include: { replies: true },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((f) => ({
    id: f.id,
    courseId: f.courseId,
    courseName: f.courseName,
    subject: f.subject,
    title: f.title,
    authorId: f.authorId,
    authorName: f.authorName,
    authorRole: f.authorRole,
    content: f.content,
    createdAt: f.createdAt,
    replies: f.replies.map((r) => ({
      id: r.id,
      authorId: r.authorId,
      authorName: r.authorName,
      authorRole: r.authorRole,
      content: r.content,
      createdAt: r.createdAt,
    })),
  }));
}

export async function createDiscussion(forumData: Omit<ForumItem, 'id' | 'createdAt' | 'replies'>): Promise<ForumItem> {
  await ensureDefaultDataSeeded();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const created = await prisma.forum.create({
    data: {
      courseId: forumData.courseId,
      courseName: forumData.courseName,
      subject: forumData.subject,
      title: forumData.title,
      authorId: forumData.authorId,
      authorName: forumData.authorName,
      authorRole: forumData.authorRole,
      content: forumData.content,
      createdAt,
    },
    include: { replies: true },
  });
  return {
    ...created,
    replies: [],
  };
}

export async function replyToDiscussion(forumId: string, reply: Omit<ReplyItem, 'id' | 'createdAt'>): Promise<ForumItem | null> {
  await ensureDefaultDataSeeded();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  await prisma.forumReply.create({
    data: {
      forumId,
      authorId: reply.authorId,
      authorName: reply.authorName,
      authorRole: reply.authorRole,
      content: reply.content,
      createdAt,
    },
  });

  const updatedForum = await prisma.forum.findUnique({
    where: { id: forumId },
    include: { replies: true },
  });

  if (!updatedForum) return null;
  return {
    id: updatedForum.id,
    courseId: updatedForum.courseId,
    courseName: updatedForum.courseName,
    subject: updatedForum.subject,
    title: updatedForum.title,
    authorId: updatedForum.authorId,
    authorName: updatedForum.authorName,
    authorRole: updatedForum.authorRole,
    content: updatedForum.content,
    createdAt: updatedForum.createdAt,
    replies: updatedForum.replies.map((r) => ({
      id: r.id,
      authorId: r.authorId,
      authorName: r.authorName,
      authorRole: r.authorRole,
      content: r.content,
      createdAt: r.createdAt,
    })),
  };
}

// ================= CIRCULARS =================
export async function getCirculars(): Promise<CircularItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.circular.findMany({ orderBy: { createdAt: 'desc' } });
  return list.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    date: c.date,
    attachmentUrl: c.attachmentUrl || undefined,
    isImportant: c.isImportant,
  }));
}

export async function saveCircular(circ: Omit<CircularItem, 'id'> & { id?: string }): Promise<CircularItem> {
  await ensureDefaultDataSeeded();
  if (circ.id) {
    const updated = await prisma.circular.update({
      where: { id: circ.id },
      data: {
        title: circ.title,
        description: circ.description,
        date: circ.date,
        attachmentUrl: circ.attachmentUrl,
        isImportant: circ.isImportant,
      },
    });
    return { ...updated, attachmentUrl: updated.attachmentUrl || undefined };
  } else {
    const created = await prisma.circular.create({
      data: {
        title: circ.title,
        description: circ.description,
        date: circ.date,
        attachmentUrl: circ.attachmentUrl,
        isImportant: circ.isImportant ?? false,
      },
    });
    return { ...created, attachmentUrl: created.attachmentUrl || undefined };
  }
}

export async function deleteCircular(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.circular.delete({ where: { id } });
  return true;
}

// ================= MESSAGES =================

export async function getMessages(userId?: string): Promise<MessageItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.message.findMany({
    where: userId ? { OR: [{ senderId: userId }, { receiverId: userId }] } : undefined,
    orderBy: { sentAt: 'desc' },
  });
  return list;
}

export async function sendMessage(msg: Omit<MessageItem, 'id' | 'sentAt' | 'isRead'>): Promise<MessageItem> {
  await ensureDefaultDataSeeded();
  const sentAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const created = await prisma.message.create({
    data: {
      senderId: msg.senderId,
      senderName: msg.senderName,
      receiverId: msg.receiverId,
      receiverName: msg.receiverName,
      subject: msg.subject,
      body: msg.body,
      sentAt,
      isRead: false,
    },
  });
  return created;
}

// ================= MENTORING & MENTEE ACTIVITY MONITORING =================

export async function getMentoringInfo(studentId: string): Promise<MentoringItem | null> {
  await ensureDefaultDataSeeded();
  const item = await prisma.mentoring.findFirst({ where: { studentId } });
  if (item) {
    return {
      id: item.id,
      studentId: item.studentId,
      mentorId: item.mentorId,
      mentorName: item.mentorName,
      mentorContact: item.mentorContact,
      mentorEmail: item.mentorEmail,
      programme: item.programme,
      meetingInfo: item.meetingInfo,
      history: JSON.parse(item.historyJson || '[]'),
      notes: item.notes || undefined,
    };
  }
  return null;
}

/**
 * Auto-assign students to mentors in sequential order:
 * Every 10 students gets assigned to 1 mentor!
 * Students 1 to 10 -> Mentor 1
 * Students 11 to 20 -> Mentor 2
 * Students 21 to 30 -> Mentor 3
 */
export async function autoAssignStudentsToMentors() {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (mentors.length === 0) {
      return { success: false, message: 'No active mentors found to assign students to.' };
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (students.length === 0) {
      return { success: false, message: 'No active students found.' };
    }

    let assignedCount = 0;
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      // Every 10 students assigned to 1 mentor in sequential order
      const mentorIndex = Math.floor(i / 10) % mentors.length;
      const mentor = mentors[mentorIndex];
      const batchNumber = Math.floor(i / 10) + 1;
      const menteeNumber = (i % 10) + 1;

      await prisma.user.update({
        where: { id: student.id },
        data: {
          mentorId: mentor.id,
          mentorName: mentor.name,
        },
      });

      const existingMentoring = await prisma.mentoring.findFirst({
        where: { studentId: student.id },
      });

      const meetingInfo = `Academic Mentor: ${mentor.name} (${mentor.qualification || 'Lead Mentor'}). Contact: ${mentor.email} / ${mentor.mobile || '+91 9876543290'}. Allocated for continuous evaluation, academic guidance, and project counseling.`;
      const historyItems = [
        `Assigned to Mentor ${mentor.name} (Batch #${batchNumber}, Mentee #${menteeNumber} of 10)`,
        `Orientation & Mentee Academic Tracking Initialized`,
      ];

      if (existingMentoring) {
        await prisma.mentoring.update({
          where: { id: existingMentoring.id },
          data: {
            mentorId: mentor.id,
            mentorName: mentor.name,
            mentorContact: mentor.mobile || mentor.email,
            mentorEmail: mentor.email,
            programme: student.programme || 'MCA',
            meetingInfo,
          },
        });
      } else {
        await prisma.mentoring.create({
          data: {
            studentId: student.id,
            mentorId: mentor.id,
            mentorName: mentor.name,
            mentorContact: mentor.mobile || mentor.email,
            mentorEmail: mentor.email,
            programme: student.programme || 'MCA',
            meetingInfo,
            historyJson: JSON.stringify(historyItems),
            notes: `Batch ${batchNumber} - Mentee #${menteeNumber} of 10. Monitoring academic activities, submissions, and course completion.`,
          },
        });
      }

      assignedCount++;
    }

    return {
      success: true,
      message: `Successfully mapped ${assignedCount} students across ${mentors.length} mentor(s) (10 students per mentor in sequential order).`,
      totalStudents: students.length,
      totalMentors: mentors.length,
    };
  } catch (err: any) {
    console.error('Error auto-assigning mentors:', err);
    return { success: false, message: err.message || 'Auto-assignment failed.' };
  }
}

/**
 * Fetch all students assigned to a specific mentor, with summary activity stats
 */
export async function getMentorMentees(mentorId: string) {
  await ensureDefaultDataSeeded();

  // Find mentor
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor) return [];

  // Find students assigned to this mentor
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      OR: [
        { mentorId: mentor.id },
        { mentorName: mentor.name },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  const studentSummaries = await Promise.all(
    students.map(async (student, index) => {
      // 1. Attendance stats
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
      });
      const totalClasses = attendanceRecords.length;
      const attendedClasses = attendanceRecords.filter((a) => a.status === 'Present').length;
      const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

      // 2. Assessments
      const assessments = await prisma.assessmentSubmission.findMany({
        where: { studentId: student.id },
      });
      const assessmentsCompleted = assessments.length;
      const averageScore = assessments.length > 0
        ? Math.round(assessments.reduce((acc, curr) => acc + curr.percentage, 0) / assessments.length)
        : 85;

      // 3. Assignments
      const assignments = await prisma.assignmentSubmission.findMany({
        where: { studentId: student.id },
      });
      const assignmentsSubmitted = assignments.length;

      // 4. Resource Views
      const resourcesViewed = await prisma.resourceView.count({
        where: { studentId: student.id },
      });

      // 5. Mentoring notes
      const mentoringItem = await prisma.mentoring.findFirst({
        where: { studentId: student.id },
      });

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        username: student.username,
        studentId: student.studentId || `PU2026MCA${String(index + 1).padStart(2, '0')}`,
        programme: student.programme || 'MCA',
        semester: student.semester || 'Semester 3',
        mobile: student.mobile || '+91 9876543200',
        academicInfo: student.academicInfo || 'CGPA 3.85 | Regular Batch',
        address: student.address || 'Salem, Tamil Nadu',
        status: student.status,
        batchIndex: index + 1, // Mentee #1 to 10
        totalClasses,
        attendedClasses,
        attendanceRate,
        assessmentsCompleted,
        averageScore,
        assignmentsSubmitted,
        resourcesViewed,
        mentorNotes: mentoringItem?.notes || 'Regular mentee check-in active.',
        lastActive: 'Today',
      };
    })
  );

  return studentSummaries;
}

/**
 * Fetch full comprehensive activity details for a single mentee
 */
export async function getMenteeDetailedActivity(studentId: string) {
  await ensureDefaultDataSeeded();

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });
  if (!student) return null;

  // 1. Attendance History
  const attendance = await prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 100;

  // 2. Assessments Taken with details
  const submissions = await prisma.assessmentSubmission.findMany({
    where: { studentId },
    include: { assessment: true },
    orderBy: { submittedAt: 'desc' },
  });
  const assessments = submissions.map((s) => ({
    id: s.id,
    title: s.assessment.title,
    courseName: s.assessment.courseName,
    score: s.score,
    maxMarks: s.maxMarks,
    percentage: s.percentage,
    submittedAt: s.submittedAt,
  }));

  // 3. Assignments Submitted
  const assignmentSubs = await prisma.assignmentSubmission.findMany({
    where: { studentId },
    include: { assignment: true },
    orderBy: { submissionDate: 'desc' },
  });
  const assignments = assignmentSubs.map((a) => ({
    id: a.id,
    title: a.assignment.title,
    courseName: a.assignment.courseName,
    submissionDate: a.submissionDate,
    status: a.status,
    marks: a.marks,
    feedback: a.feedback,
    fileUrl: a.fileUrl,
  }));

  // 4. Learning Resources Viewed
  const views = await prisma.resourceView.findMany({
    where: { studentId },
    orderBy: { viewedAt: 'desc' },
  });
  const resourceViews = await Promise.all(
    views.map(async (v) => {
      const res = await prisma.learningResource.findUnique({ where: { id: v.resourceId } });
      return {
        id: v.id,
        title: res?.title || 'Learning Module',
        courseName: res?.courseName || 'Computer Applications',
        subject: res?.subject || 'Software Engineering',
        fileType: res?.fileType || 'PDF',
        viewedAt: v.viewedAt,
      };
    })
  );

  // 5. Internal Marks
  const internalMarks = await prisma.internalMark.findMany({
    where: { studentId },
  });

  // 6. Discussion Forum activity
  const forumReplies = await prisma.forumReply.findMany({
    where: { authorId: studentId },
    orderBy: { createdAt: 'desc' },
  });
  const forumPosts = await prisma.forum.findMany({
    where: { authorId: studentId },
    orderBy: { createdAt: 'desc' },
  });

  // 7. Fee Activities
  const feeActivities = await prisma.feeActivity.findMany({
    where: { studentId },
  });

  // 8. Support Tickets
  const supportTickets = await prisma.supportTicket.findMany({
    where: { studentId },
    include: { responses: true },
    orderBy: { createdAt: 'desc' },
  });

  // 9. Mentoring Info
  const mentoring = await prisma.mentoring.findFirst({
    where: { studentId },
  });

  return {
    student,
    attendance,
    attendanceStats: {
      total: attendance.length,
      present: presentCount,
      percentage: attendanceRate,
    },
    assessments,
    assignments,
    resourceViews,
    internalMarks,
    forumActivity: [
      ...forumPosts.map((p) => ({
        id: p.id,
        type: 'post' as const,
        title: p.title,
        content: p.content,
        createdAt: p.createdAt,
      })),
      ...forumReplies.map((r) => ({
        id: r.id,
        type: 'reply' as const,
        title: 'Discussion Forum Response',
        content: r.content,
        createdAt: r.createdAt,
      })),
    ],
    feeActivities,
    supportTickets,
    mentoring: mentoring
      ? {
          id: mentoring.id,
          studentId: mentoring.studentId,
          mentorName: mentoring.mentorName,
          mentorContact: mentoring.mentorContact,
          mentorEmail: mentoring.mentorEmail,
          programme: mentoring.programme,
          meetingInfo: mentoring.meetingInfo,
          history: JSON.parse(mentoring.historyJson || '[]'),
          notes: mentoring.notes,
        }
      : null,
  };
}

/**
 * Fetch aggregated recent activities across all mentees of a mentor
 */
export async function getMentorRecentActivities(mentorId: string) {
  await ensureDefaultDataSeeded();

  const mentees = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      OR: [{ mentorId }, { mentorName: { not: null } }],
    },
    select: { id: true, name: true, studentId: true },
  });

  const menteeIds = mentees.map((m) => m.id);
  const menteeNameMap = new Map(mentees.map((m) => [m.id, m.name]));

  const [assessmentSubs, assignmentSubs, attendanceList, resourceViews] = await Promise.all([
    prisma.assessmentSubmission.findMany({
      where: { studentId: { in: menteeIds } },
      include: { assessment: true },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    }),
    prisma.assignmentSubmission.findMany({
      where: { studentId: { in: menteeIds } },
      include: { assignment: true },
      orderBy: { submissionDate: 'desc' },
      take: 10,
    }),
    prisma.attendanceRecord.findMany({
      where: { studentId: { in: menteeIds } },
      orderBy: { date: 'desc' },
      take: 10,
    }),
    prisma.resourceView.findMany({
      where: { studentId: { in: menteeIds } },
      orderBy: { viewedAt: 'desc' },
      take: 10,
    }),
  ]);

  const activityFeed: Array<{
    id: string;
    studentName: string;
    type: 'assessment' | 'assignment' | 'attendance' | 'resource';
    title: string;
    description: string;
    timestamp: string;
    statusBadge?: string;
  }> = [];

  assessmentSubs.forEach((a) => {
    activityFeed.push({
      id: `act_as_${a.id}`,
      studentName: a.studentName || menteeNameMap.get(a.studentId) || 'Student',
      type: 'assessment',
      title: `Completed Assessment: ${a.assessment.title}`,
      description: `Scored ${a.score}/${a.maxMarks} (${a.percentage}%) in ${a.assessment.courseName}`,
      timestamp: new Date(a.submittedAt).toLocaleDateString(),
      statusBadge: `${a.percentage}%`,
    });
  });

  assignmentSubs.forEach((asg) => {
    activityFeed.push({
      id: `act_asg_${asg.id}`,
      studentName: asg.studentName || menteeNameMap.get(asg.studentId) || 'Student',
      type: 'assignment',
      title: `Submitted Assignment: ${asg.assignment.title}`,
      description: `Status: ${asg.status} | Course: ${asg.assignment.courseName}`,
      timestamp: asg.submissionDate,
      statusBadge: asg.status,
    });
  });

  attendanceList.forEach((att) => {
    activityFeed.push({
      id: `act_att_${att.id}`,
      studentName: att.studentName || menteeNameMap.get(att.studentId) || 'Student',
      type: 'attendance',
      title: `Attended Class: ${att.courseName}`,
      description: `Status: ${att.status} ${att.remarks ? `(${att.remarks})` : ''}`,
      timestamp: att.date,
      statusBadge: att.status,
    });
  });

  resourceViews.forEach((rv) => {
    activityFeed.push({
      id: `act_res_${rv.id}`,
      studentName: rv.studentName || menteeNameMap.get(rv.studentId) || 'Student',
      type: 'resource',
      title: 'Accessed Study Material',
      description: 'Learner reviewed module lecture notes and study material',
      timestamp: new Date(rv.viewedAt).toLocaleDateString(),
      statusBadge: 'Viewed',
    });
  });

  return activityFeed.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20);
}

/**
 * Save / Update mentoring session notes and schedule a meeting
 */
export async function saveMentoringMeeting(data: {
  studentId: string;
  meetingInfo: string;
  notes?: string;
  historyEntry?: string;
}) {
  await ensureDefaultDataSeeded();

  const existing = await prisma.mentoring.findFirst({
    where: { studentId: data.studentId },
  });

  const student = await prisma.user.findUnique({ where: { id: data.studentId } });
  const history = existing ? JSON.parse(existing.historyJson || '[]') : [];

  if (data.historyEntry) {
    history.unshift(`${new Date().toLocaleDateString()}: ${data.historyEntry}`);
  }

  if (existing) {
    const updated = await prisma.mentoring.update({
      where: { id: existing.id },
      data: {
        meetingInfo: data.meetingInfo,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        historyJson: JSON.stringify(history),
      },
    });
    return updated;
  } else {
    const created = await prisma.mentoring.create({
      data: {
        studentId: data.studentId,
        mentorName: student?.mentorName || 'Academic Mentor',
        mentorContact: '+91 9876543290',
        mentorEmail: 'mentor@lms.edu',
        programme: student?.programme || 'MCA',
        meetingInfo: data.meetingInfo,
        notes: data.notes || '',
        historyJson: JSON.stringify(history),
      },
    });
    return created;
  }
}

// ================= NOTIFICATIONS =================
export async function getNotifications(userId?: string): Promise<NotificationItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.notification.findMany({
    where: userId ? { OR: [{ userId }, { userId: 'ALL' }] } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return list;
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.notification.updateMany({
    where: { OR: [{ userId }, { userId: 'ALL' }] },
    data: { isRead: true },
  });
  return true;
}

// ================= CERTIFICATES =================
export async function getCertificates(studentId?: string): Promise<CertificateItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.certificate.findMany({
    where: studentId ? { studentId } : undefined,
  });
  return list;
}

// ================= SUPPORT TICKETS =================
export async function getSupportTickets(studentId?: string): Promise<SupportTicketItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.supportTicket.findMany({
    where: studentId ? { studentId } : undefined,
    include: { responses: true },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((t) => ({
    id: t.id,
    studentId: t.studentId,
    studentName: t.studentName,
    subject: t.subject,
    category: t.category,
    description: t.description,
    priority: t.priority as SupportTicketItem['priority'],
    attachmentUrl: t.attachmentUrl || undefined,
    status: t.status as SupportTicketItem['status'],
    createdAt: t.createdAt,
    responses: t.responses.map((r) => ({
      id: r.id,
      responderName: r.responderName,
      responderRole: r.responderRole,
      message: r.message,
      createdAt: r.createdAt,
    })),
  }));
}

export async function createSupportTicket(ticketData: Omit<SupportTicketItem, 'id' | 'status' | 'createdAt' | 'responses'>): Promise<SupportTicketItem> {
  await ensureDefaultDataSeeded();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const created = await prisma.supportTicket.create({
    data: {
      studentId: ticketData.studentId,
      studentName: ticketData.studentName,
      subject: ticketData.subject,
      category: ticketData.category,
      description: ticketData.description,
      priority: ticketData.priority || 'Medium',
      attachmentUrl: ticketData.attachmentUrl,
      status: 'Open',
      createdAt,
    },
    include: { responses: true },
  });
  return {
    id: created.id,
    studentId: created.studentId,
    studentName: created.studentName,
    subject: created.subject,
    category: created.category,
    description: created.description,
    priority: created.priority as SupportTicketItem['priority'],
    attachmentUrl: created.attachmentUrl || undefined,
    status: created.status as SupportTicketItem['status'],
    createdAt: created.createdAt,
    responses: [],
  };
}

export async function respondToTicket(
  ticketId: string,
  responderName: string,
  responderRole: string,
  message: string,
  newStatus?: SupportTicketItem['status']
): Promise<SupportTicketItem | null> {
  await ensureDefaultDataSeeded();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  await prisma.ticketResponse.create({
    data: {
      ticketId,
      responderName,
      responderRole,
      message,
      createdAt,
    },
  });

  if (newStatus) {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });
  }

  const updated = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { responses: true },
  });

  if (!updated) return null;
  return {
    id: updated.id,
    studentId: updated.studentId,
    studentName: updated.studentName,
    subject: updated.subject,
    category: updated.category,
    description: updated.description,
    priority: updated.priority as SupportTicketItem['priority'],
    attachmentUrl: updated.attachmentUrl || undefined,
    status: updated.status as SupportTicketItem['status'],
    createdAt: updated.createdAt,
    responses: updated.responses.map((r) => ({
      id: r.id,
      responderName: r.responderName,
      responderRole: r.responderRole,
      message: r.message,
      createdAt: r.createdAt,
    })),
  };
}

// ================= CONTACT DIRECTORY =================
export async function getContactDirectory(): Promise<ContactDirectoryItem[]> {
  await ensureDefaultDataSeeded();
  const staffUsers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'PROGRAM_COORDINATOR', 'FACULTY'] },
    },
  });
  return staffUsers.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role === 'ADMIN' ? 'University Admin' : u.role === 'PROGRAM_COORDINATOR' ? 'Programme Coordinator' : 'Faculty',
    programme: u.programme || 'MCA Department',
    email: u.email,
    phone: u.mobile || '+91 9876543200',
  }));
}

// ================= ACADEMIC MANAGEMENT (SYLLABUS, SEMESTERS, PAPERS, ASSIGNMENTS) =================

export async function getSyllabuses(programmeId?: string): Promise<SyllabusItem[]> {
  await ensureDefaultDataSeeded();
  const where: any = {};
  if (programmeId) where.programmeId = programmeId;
  const list = await prisma.syllabus.findMany({ where, orderBy: { createdAt: 'desc' } });
  return list.map((s) => ({
    id: s.id,
    name: s.name,
    regulation: s.regulation,
    programmeId: s.programmeId,
    programmeName: s.programmeName,
    year: s.year,
    status: s.status as 'ACTIVE' | 'INACTIVE',
    createdAt: s.createdAt.toISOString().split('T')[0],
  }));
}

export async function saveSyllabus(data: Omit<SyllabusItem, 'id'> & { id?: string }): Promise<SyllabusItem> {
  await ensureDefaultDataSeeded();
  if (data.id) {
    const updated = await prisma.syllabus.update({
      where: { id: data.id },
      data: {
        name: data.name,
        regulation: data.regulation,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        year: data.year,
        status: data.status || 'ACTIVE',
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      regulation: updated.regulation,
      programmeId: updated.programmeId,
      programmeName: updated.programmeName,
      year: updated.year,
      status: updated.status as 'ACTIVE' | 'INACTIVE',
    };
  } else {
    const created = await prisma.syllabus.create({
      data: {
        name: data.name,
        regulation: data.regulation,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        year: data.year,
        status: data.status || 'ACTIVE',
      },
    });
    return {
      id: created.id,
      name: created.name,
      regulation: created.regulation,
      programmeId: created.programmeId,
      programmeName: created.programmeName,
      year: created.year,
      status: created.status as 'ACTIVE' | 'INACTIVE',
    };
  }
}

export async function deleteSyllabus(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.syllabus.delete({ where: { id } });
  return true;
}

export async function mapProgramSyllabus(programmeId: string, syllabusId: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  const syl = await prisma.syllabus.findUnique({ where: { id: syllabusId } });
  if (!syl) throw new Error('Syllabus not found.');
  await prisma.program.update({
    where: { id: programmeId },
    data: {
      syllabusId: syl.id,
      syllabusName: syl.name,
    },
  });
  return true;
}

export async function getSemesters(programmeId?: string): Promise<SemesterItem[]> {
  await ensureDefaultDataSeeded();
  const where: any = {};
  if (programmeId) where.programmeId = programmeId;
  const list = await prisma.semester.findMany({ where, orderBy: { number: 'asc' } });
  return list.map((s) => ({
    id: s.id,
    name: s.name,
    number: s.number,
    programmeId: s.programmeId,
    programmeName: s.programmeName,
    syllabusId: s.syllabusId,
  }));
}

export async function saveSemester(data: Omit<SemesterItem, 'id'> & { id?: string }): Promise<SemesterItem> {
  await ensureDefaultDataSeeded();
  if (data.id) {
    const updated = await prisma.semester.update({
      where: { id: data.id },
      data: {
        name: data.name,
        number: data.number,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        syllabusId: data.syllabusId,
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      number: updated.number,
      programmeId: updated.programmeId,
      programmeName: updated.programmeName,
      syllabusId: updated.syllabusId,
    };
  } else {
    const created = await prisma.semester.create({
      data: {
        name: data.name,
        number: data.number,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        syllabusId: data.syllabusId,
      },
    });
    return {
      id: created.id,
      name: created.name,
      number: created.number,
      programmeId: created.programmeId,
      programmeName: created.programmeName,
      syllabusId: created.syllabusId,
    };
  }
}

export async function getPapers(options?: { programmeId?: string; semesterName?: string; facultyId?: string }): Promise<PaperItem[]> {
  await ensureDefaultDataSeeded();
  const where: any = {};
  if (options?.programmeId) where.programmeId = options.programmeId;
  if (options?.semesterName) where.semesterName = options.semesterName;
  if (options?.facultyId) where.facultyId = options.facultyId;

  const list = await prisma.paper.findMany({ where, orderBy: { createdAt: 'desc' } });
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    programmeId: p.programmeId,
    programmeName: p.programmeName,
    semesterId: p.semesterId,
    semesterName: p.semesterName,
    syllabusId: p.syllabusId,
    syllabusName: p.syllabusName,
    credits: p.credits,
    facultyId: p.facultyId,
    facultyName: p.facultyName,
    status: p.status as 'ACTIVE' | 'INACTIVE',
  }));
}

export async function savePaper(data: Omit<PaperItem, 'id'> & { id?: string }): Promise<PaperItem> {
  await ensureDefaultDataSeeded();
  if (data.id) {
    const updated = await prisma.paper.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        semesterId: data.semesterId,
        semesterName: data.semesterName,
        syllabusId: data.syllabusId,
        syllabusName: data.syllabusName,
        credits: data.credits || 4,
        facultyId: data.facultyId,
        facultyName: data.facultyName,
        status: data.status || 'ACTIVE',
      },
    });

    const course = await prisma.course.findFirst({ where: { code: data.code } });
    if (course) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          name: data.name,
          programmeId: data.programmeId,
          programmeName: data.programmeName || course.programmeName,
          semester: data.semesterName,
          facultyId: data.facultyId || course.facultyId,
          facultyName: data.facultyName || course.facultyName,
        },
      });
    }

    return updated as unknown as PaperItem;
  } else {
    const created = await prisma.paper.create({
      data: {
        name: data.name,
        code: data.code,
        programmeId: data.programmeId,
        programmeName: data.programmeName,
        semesterId: data.semesterId,
        semesterName: data.semesterName,
        syllabusId: data.syllabusId,
        syllabusName: data.syllabusName,
        credits: data.credits || 4,
        facultyId: data.facultyId,
        facultyName: data.facultyName,
        status: data.status || 'ACTIVE',
      },
    });

    try {
      const existingCourse = await prisma.course.findFirst({ where: { code: data.code } });
      if (!existingCourse) {
        await prisma.course.create({
          data: {
            name: data.name,
            code: data.code,
            programmeId: data.programmeId,
            programmeName: data.programmeName || 'Academic Degree',
            semester: data.semesterName,
            subject: data.name,
            facultyId: data.facultyId || '66f100000000000000000003',
            facultyName: data.facultyName || 'Unassigned Faculty',
            assessment: 'Internal 40%, External 60%',
            status: 'ACTIVE',
          },
        });
      }
    } catch {
      // Ignore duplicates
    }

    return created as unknown as PaperItem;
  }
}

export async function deletePaper(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.paper.delete({ where: { id } });
  return true;
}

export async function getFacultyAssignments(options?: { facultyId?: string; programmeId?: string }): Promise<FacultyAssignmentItem[]> {
  await ensureDefaultDataSeeded();
  const where: any = {};
  if (options?.facultyId) where.facultyId = options.facultyId;
  if (options?.programmeId) where.programmeId = options.programmeId;

  const list = await prisma.facultyAssignment.findMany({ where, orderBy: { assignedAt: 'desc' } });
  return list.map((fa) => ({
    id: fa.id,
    facultyId: fa.facultyId,
    facultyName: fa.facultyName,
    paperId: fa.paperId,
    paperName: fa.paperName,
    paperCode: fa.paperCode,
    programmeId: fa.programmeId,
    programmeName: fa.programmeName,
    semesterId: fa.semesterId,
    semesterName: fa.semesterName,
    academicYear: fa.academicYear,
    calendarYear: fa.calendarYear,
    assignedAt: fa.assignedAt.toISOString().split('T')[0],
  }));
}

export async function assignFacultyToPaper(data: {
  facultyId: string;
  paperId: string;
  academicYear?: string;
  calendarYear?: string;
}): Promise<FacultyAssignmentItem> {
  await ensureDefaultDataSeeded();

  const faculty = await prisma.user.findUnique({ where: { id: data.facultyId } });
  if (!faculty || faculty.role !== 'FACULTY') {
    throw new Error('Only valid faculty users can be assigned to papers.');
  }

  const paper = await prisma.paper.findUnique({ where: { id: data.paperId } });
  if (!paper) {
    throw new Error('Paper not found.');
  }

  const program = await prisma.program.findUnique({ where: { id: paper.programmeId } });

  const finalAcadYear = data.academicYear || paper.academicYear || program?.academicYear || '2025-2026';
  const finalCalYear = data.calendarYear || paper.calendarYear || program?.calendarYear || '2026';

  const existingForPaper = await prisma.facultyAssignment.findFirst({
    where: { paperId: paper.id },
  });

  if (existingForPaper) {
    const updatedAssignment = await prisma.facultyAssignment.update({
      where: { id: existingForPaper.id },
      data: {
        facultyId: faculty.id,
        facultyName: faculty.name,
        academicYear: finalAcadYear,
        calendarYear: finalCalYear,
      },
    });

    await prisma.paper.update({
      where: { id: paper.id },
      data: {
        facultyId: faculty.id,
        facultyName: faculty.name,
        academicYear: finalAcadYear,
        calendarYear: finalCalYear,
      },
    });

    const course = await prisma.course.findFirst({ where: { code: paper.code } });
    if (course) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          facultyId: faculty.id,
          facultyName: faculty.name,
        },
      });
    }

    return {
      id: updatedAssignment.id,
      facultyId: updatedAssignment.facultyId,
      facultyName: updatedAssignment.facultyName,
      paperId: updatedAssignment.paperId,
      paperName: updatedAssignment.paperName,
      paperCode: updatedAssignment.paperCode,
      programmeId: updatedAssignment.programmeId,
      programmeName: updatedAssignment.programmeName,
      semesterId: updatedAssignment.semesterId,
      semesterName: updatedAssignment.semesterName,
      academicYear: updatedAssignment.academicYear,
      calendarYear: updatedAssignment.calendarYear,
      assignedAt: updatedAssignment.assignedAt.toISOString().split('T')[0],
    };
  }

  const created = await prisma.facultyAssignment.create({
    data: {
      facultyId: faculty.id,
      facultyName: faculty.name,
      paperId: paper.id,
      paperName: paper.name,
      paperCode: paper.code,
      programmeId: paper.programmeId,
      programmeName: paper.programmeName,
      semesterId: paper.semesterId,
      semesterName: paper.semesterName,
      academicYear: finalAcadYear,
      calendarYear: finalCalYear,
    },
  });

  await prisma.paper.update({
    where: { id: paper.id },
    data: {
      facultyId: faculty.id,
      facultyName: faculty.name,
      academicYear: finalAcadYear,
      calendarYear: finalCalYear,
    },
  });

  const course = await prisma.course.findFirst({ where: { code: paper.code } });
  if (course) {
    await prisma.course.update({
      where: { id: course.id },
      data: {
        facultyId: faculty.id,
        facultyName: faculty.name,
      },
    });
  } else {
    await prisma.course.create({
      data: {
        name: paper.name,
        code: paper.code,
        programmeId: paper.programmeId,
        programmeName: paper.programmeName || 'Academic Degree',
        semester: paper.semesterName,
        subject: paper.name,
        facultyId: faculty.id,
        facultyName: faculty.name,
        assessment: 'Internal 40%, External 60%',
        status: 'ACTIVE',
      },
    });
  }

  return created as unknown as FacultyAssignmentItem;
}

export async function deleteFacultyAssignment(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  const assignment = await prisma.facultyAssignment.findUnique({ where: { id } });
  if (assignment) {
    await prisma.paper.update({
      where: { id: assignment.paperId },
      data: { facultyId: null, facultyName: null },
    }).catch(() => {});
    await prisma.facultyAssignment.delete({ where: { id } });
  }
  return true;
}

export async function getCoordinatorMetrics() {
  await ensureDefaultDataSeeded();
  const [totalPrograms, totalStudents, totalFaculty, totalSyllabuses, totalPapers, facultyAssignments] = await Promise.all([
    prisma.program.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'FACULTY' } }),
    prisma.syllabus.count(),
    prisma.paper.count(),
    prisma.facultyAssignment.count(),
  ]);

  return {
    totalPrograms,
    totalStudents,
    totalFaculty,
    totalSyllabuses,
    totalPapers,
    facultyAssignments,
  };
}

export async function getFacultyTeachingData(facultyId: string) {
  await ensureDefaultDataSeeded();

  const userRec = await prisma.user.findFirst({
    where: {
      OR: [{ id: facultyId }, { email: facultyId }, { username: facultyId }],
    },
  });

  const targetFacultyId = userRec ? userRec.id : facultyId;
  const targetFacultyName = userRec ? userRec.name : undefined;

  const [assignments, papers, courses, allProgs] = await Promise.all([
    prisma.facultyAssignment.findMany({
      where: {
        OR: [
          { facultyId: targetFacultyId },
          ...(targetFacultyName ? [{ facultyName: targetFacultyName }] : []),
        ],
      },
    }),
    prisma.paper.findMany({
      where: {
        OR: [
          { facultyId: targetFacultyId },
          ...(targetFacultyName ? [{ facultyName: targetFacultyName }] : []),
        ],
      },
    }),
    prisma.course.findMany({
      where: {
        OR: [
          { facultyId: targetFacultyId },
          ...(targetFacultyName ? [{ facultyName: targetFacultyName }] : []),
        ],
      },
    }),
    prisma.program.findMany(),
  ]);

  const progNameMap = new Map(allProgs.map((p) => [p.id, p.name]));

  const paperMap = new Map<string, { id: string; name: string; code: string; programmeId: string; programmeName: string; semesterName: string; credits?: number; academicYear?: string; calendarYear?: string }>();

  papers.forEach((p) => {
    paperMap.set(p.id, {
      id: p.id,
      name: p.name,
      code: p.code,
      programmeId: p.programmeId,
      programmeName: p.programmeName || progNameMap.get(p.programmeId) || 'Academic Program',
      semesterName: p.semesterName || 'Semester 1',
      credits: p.credits,
      academicYear: p.academicYear || undefined,
      calendarYear: p.calendarYear || undefined,
    });
  });

  assignments.forEach((a) => {
    if (!paperMap.has(a.paperId)) {
      paperMap.set(a.paperId, {
        id: a.paperId,
        name: a.paperName,
        code: a.paperCode || '',
        programmeId: a.programmeId,
        programmeName: a.programmeName || progNameMap.get(a.programmeId) || 'Academic Program',
        semesterName: a.semesterName || 'Semester 1',
        academicYear: a.academicYear || undefined,
        calendarYear: a.calendarYear || undefined,
      });
    }
  });

  courses.forEach((c) => {
    if (!paperMap.has(c.id)) {
      paperMap.set(c.id, {
        id: c.id,
        name: c.name,
        code: c.code,
        programmeId: c.programmeId,
        programmeName: c.programmeName || progNameMap.get(c.programmeId) || 'Academic Program',
        semesterName: c.semester || 'Semester 1',
      });
    }
  });

  const programMap = new Map<string, {
    programId: string;
    programName: string;
    semesters: Map<string, { semesterName: string; papers: Array<any> }>;
  }>();

  for (const paper of paperMap.values()) {
    const progId = paper.programmeId || 'general_prog';
    const progName = paper.programmeName || progNameMap.get(progId) || 'Academic Program';

    if (!programMap.has(progId)) {
      programMap.set(progId, {
        programId: progId,
        programName: progName,
        semesters: new Map(),
      });
    }

    const progGroup = programMap.get(progId)!;
    const semName = paper.semesterName || 'Semester 1';
    if (!progGroup.semesters.has(semName)) {
      progGroup.semesters.set(semName, {
        semesterName: semName,
        papers: [],
      });
    }

    progGroup.semesters.get(semName)!.papers.push(paper);
  }

  const groupedTeaching = Array.from(programMap.values()).map((p) => ({
    programId: p.programId,
    programName: p.programName,
    semesters: Array.from(p.semesters.values()).map((s) => ({
      semesterName: s.semesterName,
      papers: s.papers,
    })),
  }));

  return groupedTeaching;
}

// ================= 5-UNIT SYLLABUS MANAGEMENT =================

export async function getPaperUnits(paperId: string): Promise<PaperUnitItem[]> {
  await ensureDefaultDataSeeded();

  const existingUnits = await prisma.paperUnit.findMany({
    where: { paperId },
    orderBy: { unitNumber: 'asc' },
  });

  const unitMap = new Map<number, any>();
  existingUnits.forEach((u) => unitMap.set(u.unitNumber, u));

  const defaultTitles = [
    'Database Concepts & Architecture',
    'Relational Data Models & Normalization',
    'SQL Queries & Optimization',
    'Transaction Processing & Concurrency',
    'Distributed Databases & Security',
  ];

  const resultUnits: PaperUnitItem[] = [];

  for (let uNum = 1; uNum <= 5; uNum++) {
    if (!unitMap.has(uNum)) {
      const created = await prisma.paperUnit.create({
        data: {
          paperId,
          unitNumber: uNum,
          title: `Unit ${uNum}: ${defaultTitles[uNum - 1] || 'Syllabus Topic'}`,
          textContent: null,
          pdfUrl: null,
          status: 'Not Added',
        },
      });
      resultUnits.push({
        id: created.id,
        paperId: created.paperId,
        unitNumber: created.unitNumber,
        title: created.title,
        textContent: created.textContent,
        pdfUrl: created.pdfUrl,
        status: created.status as PaperUnitItem['status'],
        updatedAt: created.updatedAt.toISOString().split('T')[0],
      });
    } else {
      const u = unitMap.get(uNum);
      let status: PaperUnitItem['status'] = 'Not Added';
      const hasText = Boolean(u.textContent && u.textContent.trim());
      const hasPdf = Boolean(u.pdfUrl && u.pdfUrl.trim());

      if (hasText && hasPdf) status = 'Completed';
      else if (hasPdf) status = 'PDF Uploaded';
      else if (hasText) status = 'Text Added';

      resultUnits.push({
        id: u.id,
        paperId: u.paperId,
        unitNumber: u.unitNumber,
        title: u.title || `Unit ${uNum}`,
        textContent: u.textContent,
        pdfUrl: u.pdfUrl,
        status,
        updatedAt: u.updatedAt ? u.updatedAt.toISOString().split('T')[0] : undefined,
      });
    }
  }

  return resultUnits;
}

export async function savePaperUnit(data: {
  paperId: string;
  unitNumber: number;
  title?: string;
  textContent?: string;
  pdfUrl?: string;
}): Promise<PaperUnitItem> {
  await ensureDefaultDataSeeded();

  if (data.unitNumber < 1 || data.unitNumber > 5) {
    throw new Error('Unit number must be between 1 and 5.');
  }

  const existing = await prisma.paperUnit.findUnique({
    where: {
      paperId_unitNumber: {
        paperId: data.paperId,
        unitNumber: data.unitNumber,
      },
    },
  });

  const textContent = data.textContent !== undefined ? data.textContent : existing?.textContent;
  const pdfUrl = data.pdfUrl !== undefined ? data.pdfUrl : existing?.pdfUrl;

  const hasText = Boolean(textContent && textContent.trim());
  const hasPdf = Boolean(pdfUrl && pdfUrl.trim());

  let status: PaperUnitItem['status'] = 'Not Added';
  if (hasText && hasPdf) status = 'Completed';
  else if (hasPdf) status = 'PDF Uploaded';
  else if (hasText) status = 'Text Added';

  const updated = await prisma.paperUnit.upsert({
    where: {
      paperId_unitNumber: {
        paperId: data.paperId,
        unitNumber: data.unitNumber,
      },
    },
    update: {
      title: data.title !== undefined ? data.title : undefined,
      textContent: textContent,
      pdfUrl: pdfUrl,
      status,
    },
    create: {
      paperId: data.paperId,
      unitNumber: data.unitNumber,
      title: data.title || `Unit ${data.unitNumber}`,
      textContent: textContent,
      pdfUrl: pdfUrl,
      status,
    },
  });

  return {
    id: updated.id,
    paperId: updated.paperId,
    unitNumber: updated.unitNumber,
    title: updated.title,
    textContent: updated.textContent,
    pdfUrl: updated.pdfUrl,
    status: status,
    updatedAt: updated.updatedAt.toISOString().split('T')[0],
  };
}

export async function getPaperSyllabusProgress(paperId: string) {
  await ensureDefaultDataSeeded();
  const units = await getPaperUnits(paperId);
  const completedUnits = units.filter((u) => u.status !== 'Not Added').length;
  const isFullyCompleted = completedUnits === 5;

  return {
    paperId,
    completedUnits,
    totalUnits: 5,
    progressText: `${completedUnits} / 5 Units Completed`,
    isFullyCompleted,
    statusText: isFullyCompleted ? '✓ Completed' : `${completedUnits} / 5 Units`,
  };
}

// ================= STUDY CENTRES =================
export async function getStudyCentres(): Promise<StudyCentreItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.studyCentre.findMany({ orderBy: { createdAt: 'desc' } });
  return list.map((sc) => ({
    id: sc.id,
    code: sc.code,
    name: sc.name,
    city: sc.city,
    state: sc.state,
    coordinatorName: sc.coordinatorName,
    contactEmail: sc.contactEmail,
    contactPhone: sc.contactPhone,
    address: sc.address,
    status: sc.status as 'ACTIVE' | 'INACTIVE',
    createdAt: sc.createdAt.toISOString().split('T')[0],
  }));
}

export async function saveStudyCentre(
  centre: Omit<StudyCentreItem, 'id' | 'createdAt'> & { id?: string }
): Promise<StudyCentreItem> {
  await ensureDefaultDataSeeded();
  if (centre.id) {
    const updated = await prisma.studyCentre.update({
      where: { id: centre.id },
      data: {
        code: centre.code,
        name: centre.name,
        city: centre.city,
        state: centre.state,
        coordinatorName: centre.coordinatorName,
        contactEmail: centre.contactEmail,
        contactPhone: centre.contactPhone,
        address: centre.address,
        status: centre.status,
      },
    });
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      city: updated.city,
      state: updated.state,
      coordinatorName: updated.coordinatorName,
      contactEmail: updated.contactEmail,
      contactPhone: updated.contactPhone,
      address: updated.address,
      status: updated.status as 'ACTIVE' | 'INACTIVE',
      createdAt: updated.createdAt.toISOString().split('T')[0],
    };
  } else {
    const created = await prisma.studyCentre.create({
      data: {
        code: centre.code,
        name: centre.name,
        city: centre.city,
        state: centre.state || 'Tamil Nadu',
        coordinatorName: centre.coordinatorName,
        contactEmail: centre.contactEmail,
        contactPhone: centre.contactPhone,
        address: centre.address,
        status: centre.status || 'ACTIVE',
      },
    });
    return {
      id: created.id,
      code: created.code,
      name: created.name,
      city: created.city,
      state: created.state,
      coordinatorName: created.coordinatorName,
      contactEmail: created.contactEmail,
      contactPhone: created.contactPhone,
      address: created.address,
      status: created.status as 'ACTIVE' | 'INACTIVE',
      createdAt: created.createdAt.toISOString().split('T')[0],
    };
  }
}

export async function toggleStudyCentreStatus(id: string): Promise<StudyCentreItem | null> {
  await ensureDefaultDataSeeded();
  const current = await prisma.studyCentre.findUnique({ where: { id } });
  if (!current) return null;
  const newStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const updated = await prisma.studyCentre.update({
    where: { id },
    data: { status: newStatus },
  });
  return {
    id: updated.id,
    code: updated.code,
    name: updated.name,
    city: updated.city,
    state: updated.state,
    coordinatorName: updated.coordinatorName,
    contactEmail: updated.contactEmail,
    contactPhone: updated.contactPhone,
    address: updated.address,
    status: updated.status as 'ACTIVE' | 'INACTIVE',
    createdAt: updated.createdAt.toISOString().split('T')[0],
  };
}

export async function deleteStudyCentre(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.studyCentre.delete({ where: { id } });
  return true;
}

// ================= ACADEMIC YEARS =================
export async function getAcademicYears(): Promise<AcademicYearItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
  return list.map((ay) => ({
    id: ay.id,
    year: ay.year,
    status: ay.status as 'ACTIVE' | 'UPCOMING' | 'ARCHIVED',
    isCurrent: ay.isCurrent,
    createdAt: ay.createdAt.toISOString().split('T')[0],
  }));
}

export async function saveAcademicYear(
  ay: Omit<AcademicYearItem, 'id' | 'createdAt'> & { id?: string }
): Promise<AcademicYearItem> {
  await ensureDefaultDataSeeded();
  if (ay.isCurrent) {
    // If setting as current, reset others
    await prisma.academicYear.updateMany({
      where: {},
      data: { isCurrent: false },
    });
  }

  if (ay.id) {
    const updated = await prisma.academicYear.update({
      where: { id: ay.id },
      data: {
        year: ay.year,
        status: ay.status,
        isCurrent: ay.isCurrent,
      },
    });
    return {
      id: updated.id,
      year: updated.year,
      status: updated.status as 'ACTIVE' | 'UPCOMING' | 'ARCHIVED',
      isCurrent: updated.isCurrent,
      createdAt: updated.createdAt.toISOString().split('T')[0],
    };
  } else {
    const created = await prisma.academicYear.create({
      data: {
        year: ay.year,
        status: ay.status || 'ACTIVE',
        isCurrent: Boolean(ay.isCurrent),
      },
    });
    return {
      id: created.id,
      year: created.year,
      status: created.status as 'ACTIVE' | 'UPCOMING' | 'ARCHIVED',
      isCurrent: created.isCurrent,
      createdAt: created.createdAt.toISOString().split('T')[0],
    };
  }
}

export async function deleteAcademicYear(id: string): Promise<boolean> {
  await ensureDefaultDataSeeded();
  await prisma.academicYear.delete({ where: { id } });
  return true;
}

// ================= ATTENDANCE RECORDS =================
export async function getAttendanceRecords(filters?: {
  courseId?: string;
  studentId?: string;
  date?: string;
  paperId?: string;
}): Promise<AttendanceRecordItem[]> {
  await ensureDefaultDataSeeded();
  const where: any = {};
  if (filters?.courseId) where.courseId = filters.courseId;
  if (filters?.studentId) where.studentId = filters.studentId;
  if (filters?.date) where.date = filters.date;
  if (filters?.paperId) where.paperId = filters.paperId;

  const list = await prisma.attendanceRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return list.map((r) => ({
    id: r.id,
    scheduleId: r.scheduleId,
    courseId: r.courseId,
    courseName: r.courseName,
    paperId: r.paperId,
    studentId: r.studentId,
    studentName: r.studentName,
    date: r.date,
    status: r.status as AttendanceRecordItem['status'],
    remarks: r.remarks,
    recordedBy: r.recordedBy,
    createdAt: r.createdAt.toISOString().split('T')[0],
  }));
}

export async function recordAttendance(
  records: Array<Omit<AttendanceRecordItem, 'id' | 'createdAt'>>
): Promise<boolean> {
  await ensureDefaultDataSeeded();
  for (const r of records) {
    await prisma.attendanceRecord.create({
      data: {
        scheduleId: r.scheduleId,
        courseId: r.courseId,
        courseName: r.courseName,
        paperId: r.paperId,
        studentId: r.studentId,
        studentName: r.studentName,
        date: r.date,
        status: r.status,
        remarks: r.remarks,
        recordedBy: r.recordedBy,
      },
    });
  }
  return true;
}

export async function getStudentAttendanceSummary(studentId: string) {
  await ensureDefaultDataSeeded();
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
  });

  const totalSessions = records.length;
  const attendedSessions = records.filter((r) => r.status === 'Present').length;
  const percentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 100;

  return {
    totalSessions,
    attendedSessions,
    percentage,
    records: records.map((r) => ({
      id: r.id,
      scheduleId: r.scheduleId,
      courseId: r.courseId,
      courseName: r.courseName,
      paperId: r.paperId,
      studentId: r.studentId,
      studentName: r.studentName,
      date: r.date,
      status: r.status as AttendanceRecordItem['status'],
      remarks: r.remarks,
      recordedBy: r.recordedBy,
      createdAt: r.createdAt.toISOString().split('T')[0],
    })),
  };
}

// ================= AUDIT LOGS =================
export async function logAuditEvent(event: {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
}): Promise<AuditLogItem> {
  await ensureDefaultDataSeeded();
  const item = await prisma.auditLog.create({
    data: {
      userId: event.userId,
      userName: event.userName,
      userRole: event.userRole,
      action: event.action,
      resource: event.resource,
      details: event.details,
      ipAddress: event.ipAddress || '127.0.0.1',
    },
  });

  return {
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    userRole: item.userRole,
    action: item.action,
    resource: item.resource,
    details: item.details,
    ipAddress: item.ipAddress,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getAuditLogs(limit = 100): Promise<AuditLogItem[]> {
  await ensureDefaultDataSeeded();
  const list = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return list.map((l) => ({
    id: l.id,
    userId: l.userId,
    userName: l.userName,
    userRole: l.userRole,
    action: l.action,
    resource: l.resource,
    details: l.details,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString().replace('T', ' ').substring(0, 19),
  }));
}
