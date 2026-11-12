'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatSubmissionFeedback } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session || session.status !== 'ACTIVE') {
    throw new Error('Unauthorized session.');
  }
  return session;
}

export interface IgnouSubmissionMetadata {
  acknowledgementNo: string;
  session: string;
  courseCode: string;
  courseName: string;
  enrolmentNumber: string;
  learnerName: string;
  email: string;
  studyCentreCode: string;
  regionalCentreCode: string;
  regionalCentreName: string;
  fileName: string;
  fileSize: string;
  pageCount?: number;
  hasCoverPage: boolean;
  hasIdCard: boolean;
  hasQuestionPaper: boolean;
  hasHandwrittenAnswers: boolean;
  hasSignatures: boolean;
  submittedAt: string;
  comments?: string;
  evaluationRemarks?: string;
}

export interface IgnouAssignmentRecord {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  semester?: string;
  status: 'Draft' | 'Ready for Submission' | 'Submitted' | 'Under Evaluation' | 'Evaluated';
  submissionDate?: string;
  acknowledgementNo?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  pageCount?: number;
  marks?: number;
  maxMarks?: number;
  feedback?: string;
  hasQuestionPaper?: boolean;
  questionPaperUrl?: string;
}

export async function submitIgnouAssignmentAction(data: {
  courseId: string;
  courseCode: string;
  courseName: string;
  enrolmentNumber: string;
  learnerName: string;
  email: string;
  studyCentreCode: string;
  regionalCentreCode: string;
  regionalCentreName: string;
  session?: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  acknowledgementNo: string;
  pageCount?: number;
  comments?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    if (user.role !== 'STUDENT') {
      return { success: false, error: 'Only enrolled students can submit assignments.' };
    }

    if (!data.fileUrl || !data.fileUrl.trim()) {
      return { success: false, error: 'Please compile and upload the completed single PDF file before submitting.' };
    }

    // 1. Find or create the assignment record for this course
    let assignment = await prisma.assignment.findFirst({
      where: {
        courseId: data.courseId,
        title: { contains: 'December 2026' },
      },
    });

    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          title: `TEE December 2026 Assignment — ${data.courseCode}`,
          description: `Official TEE December 2026 assignment submission for ${data.courseCode} (${data.courseName}) through IGNOU OAMS portal.`,
          courseId: data.courseId,
          courseName: data.courseName,
          dueDate: '2026-12-15T23:59:59',
          maxMarks: 100,
          instructions: `IGNOU OAMS TEE December 2026 Official Submission. Conforms to single PDF requirement with Cover Page, ID Card, Question Paper, and Signed Handwritten Responses.`,
        },
      });
    }

    // 2. Prepare structured IGNOU Metadata
    const submissionTimestamp = new Date().toISOString();
    const meta: IgnouSubmissionMetadata = {
      acknowledgementNo: data.acknowledgementNo,
      session: data.session || 'December 2026',
      courseCode: data.courseCode,
      courseName: data.courseName,
      enrolmentNumber: data.enrolmentNumber,
      learnerName: data.learnerName,
      email: data.email,
      studyCentreCode: data.studyCentreCode,
      regionalCentreCode: data.regionalCentreCode,
      regionalCentreName: data.regionalCentreName,
      fileName: data.fileName,
      fileSize: data.fileSize,
      pageCount: data.pageCount || 1,
      hasCoverPage: true,
      hasIdCard: true,
      hasQuestionPaper: true,
      hasHandwrittenAnswers: true,
      hasSignatures: true,
      submittedAt: submissionTimestamp,
      comments: data.comments,
    };

    const formattedFeedback = formatSubmissionFeedback('', {
      comments: data.comments,
      fileName: data.fileName,
      fileSize: data.fileSize,
    }) + `\n<!-- IGNOU_META: ${JSON.stringify(meta)} -->`;

    // 3. Upsert submission record
    const existing = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        studentId: user.id,
      },
    });

    if (existing) {
      await prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl: data.fileUrl,
          submissionDate: submissionTimestamp,
          status: 'Submitted',
          feedback: formattedFeedback,
        },
      });
    } else {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: user.id,
          studentName: data.learnerName || user.name,
          submissionDate: submissionTimestamp,
          fileUrl: data.fileUrl,
          status: 'Submitted',
          feedback: formattedFeedback,
        },
      });
    }

    revalidatePath('/student');
    revalidatePath('/faculty');
    revalidatePath('/admin');

    return {
      success: true,
      acknowledgementNo: data.acknowledgementNo,
      submissionDate: submissionTimestamp,
      fileName: data.fileName,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to submit assignment through OAMS.',
    };
  }
}

export async function fetchStudentIgnouSubmissionsAction(): Promise<{
  success: boolean;
  submissions: Record<string, IgnouSubmissionMetadata & { submissionId: string; status: string; marks?: number; fileUrl: string }>;
}> {
  try {
    const user = await getAuthenticatedUser();

    const studentSubs = await prisma.assignmentSubmission.findMany({
      where: { studentId: user.id },
      include: { assignment: true },
    });

    const result: Record<string, any> = {};

    studentSubs.forEach((sub: any) => {
      const match = sub.feedback?.match(/<!--\s*IGNOU_META:\s*({[\s\S]*?})\s*-->/);
      let ignouMeta: IgnouSubmissionMetadata | null = null;
      if (match) {
        try {
          ignouMeta = JSON.parse(match[1]);
        } catch {}
      }

      const courseKey = ignouMeta?.courseCode || sub.assignment?.courseId || sub.assignmentId;
      result[courseKey] = {
        submissionId: sub.id,
        status: sub.status || 'Submitted',
        marks: sub.marks !== null ? sub.marks : undefined,
        fileUrl: sub.fileUrl,
        submissionDate: sub.submissionDate,
        acknowledgementNo: ignouMeta?.acknowledgementNo || `ACK-${sub.id.slice(-6).toUpperCase()}`,
        session: ignouMeta?.session || 'December 2026',
        courseCode: ignouMeta?.courseCode || sub.assignment?.courseName || '',
        courseName: ignouMeta?.courseName || sub.assignment?.courseName || '',
        enrolmentNumber: ignouMeta?.enrolmentNumber || user.studentId || '',
        learnerName: ignouMeta?.learnerName || user.name,
        email: ignouMeta?.email || user.email,
        studyCentreCode: ignouMeta?.studyCentreCode || '2501',
        regionalCentreCode: ignouMeta?.regionalCentreCode || '25',
        regionalCentreName: ignouMeta?.regionalCentreName || 'Chennai',
        fileName: ignouMeta?.fileName || sub.fileUrl.split('/').pop() || 'submission.pdf',
        fileSize: ignouMeta?.fileSize || 'N/A',
        pageCount: ignouMeta?.pageCount || 1,
        hasCoverPage: ignouMeta?.hasCoverPage ?? true,
        hasIdCard: ignouMeta?.hasIdCard ?? true,
        hasQuestionPaper: ignouMeta?.hasQuestionPaper ?? true,
        hasHandwrittenAnswers: ignouMeta?.hasHandwrittenAnswers ?? true,
        hasSignatures: ignouMeta?.hasSignatures ?? true,
        submittedAt: ignouMeta?.submittedAt || sub.submissionDate,
        comments: ignouMeta?.comments,
      };
    });

    return { success: true, submissions: result };
  } catch (err: any) {
    return { success: false, submissions: {} };
  }
}
