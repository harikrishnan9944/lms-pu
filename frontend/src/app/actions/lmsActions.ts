'use server';

import {
  getPrograms,
  saveProgram,
  deleteProgram,
  getCourses,
  saveCourse,
  deleteCourse,
  getApplications,
  updateApplicationStatus,
  getFacultyMappings,
  saveFacultyMapping,
  getStudentMappings,
  saveStudentMapping,
  getLearningResources,
  saveLearningResource,
  deleteLearningResource,
  recordResourceView,
  updateResourceVideoProgress,
  getStudentResourceViews,
  getResourceViews,
  getAssessments,
  getAssessmentById,
  saveAssessment,
  toggleAssessmentPublish,
  deleteAssessment,
  submitAssessmentResult,
  getAssessmentSubmissions,
  getStudentAssessmentSubmissions,
  getAssignments,
  saveAssignment,
  submitAssignmentSolution,
  gradeAssignmentSubmission,
  deleteAssignment,
  getInternalMarks,
  saveInternalMark,
  getSchedules,
  saveSchedule,
  deleteSchedule,
  getFeeActivities,
  getDiscussionForums,
  createDiscussion,
  replyToDiscussion,
  getCirculars,
  saveCircular,
  deleteCircular,

  getMessages,
  sendMessage,
  getMentoringInfo,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getCertificates,
  getSupportTickets,
  createSupportTicket,
  respondToTicket,
  getContactDirectory,
  updateUser,
  getSyllabuses,
  saveSyllabus,
  deleteSyllabus,
  mapProgramSyllabus,
  getSemesters,
  saveSemester,
  getPapers,
  savePaper,
  deletePaper,
  getFacultyAssignments,
  assignFacultyToPaper,
  deleteFacultyAssignment,
  getCoordinatorMetrics,
  getFacultyTeachingData,
  getPaperUnits,
  savePaperUnit,
  getPaperSyllabusProgress,
  getStudyCentres,
  saveStudyCentre,
  toggleStudyCentreStatus,
  deleteStudyCentre,
  getAcademicYears,
  saveAcademicYear,
  deleteAcademicYear,
  getAttendanceRecords,
  recordAttendance,
  getStudentAttendanceSummary,
  logAuditEvent,
  getAuditLogs,
  ProgramItem,
  CourseItem,
  ApplicationItem,
  LearningResourceItem,
  ResourceViewItem,
  AssessmentItem,
  AssessmentSubmissionItem,
  QuizQuestion,
  QuestionAnswerDetail,
  SubmissionAnswersPayload,
  AssignmentItem,
  InternalMarkItem,
  ScheduleItem,
  CircularItem,
  MessageItem,
  SupportTicketItem,
  SyllabusItem,
  SemesterItem,
  PaperItem,
  FacultyAssignmentItem,
  PaperUnitItem,
  StudyCentreItem,
  AcademicYearItem,
  AttendanceRecordItem,
  AuditLogItem,
} from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';


// Helper for session check
async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized session.');
  }
  return session;
}

// PROGRAM ACTIONS
export async function fetchProgramsAction() {
  return await getPrograms();
}

export async function saveProgramAction(prog: Omit<ProgramItem, 'id' | 'createdAt'> & { id?: string }) {
  await getAuthenticatedUser();
  if (!prog.name || !prog.name.trim()) return { success: false, error: 'Programme Name is required.' };
  if (!prog.code || !prog.code.trim()) return { success: false, error: 'Programme Code is required.' };
  const res = await saveProgram(prog);
  revalidatePath('/admin');
  return { success: true, program: res };
}

export async function deleteProgramAction(id: string) {
  await getAuthenticatedUser();
  await deleteProgram(id);
  revalidatePath('/admin');
  return { success: true };
}

// COURSE ACTIONS
export async function fetchCoursesAction() {
  const session = await getAuthenticatedUser();
  const allCourses = await getCourses();
  if (session.role === 'FACULTY') {
    return allCourses.filter(
      (c) => c.facultyId === session.id || c.facultyName === session.name
    );
  }
  return allCourses;
}

export async function saveCourseAction(crs: Omit<CourseItem, 'id'> & { id?: string }) {
  const session = await getAuthenticatedUser();
  if (!crs.name || !crs.name.trim()) return { success: false, error: 'Course Name is required.' };
  if (!crs.code || !crs.code.trim()) return { success: false, error: 'Course Code is required.' };
  const res = await saveCourse(crs);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: crs.id ? 'UPDATE_COURSE' : 'CREATE_COURSE',
    resource: 'Courses',
    details: `Course '${res.name}' (${res.code}) saved.`,
  });
  revalidatePath('/admin');
  revalidatePath('/faculty');
  return { success: true, course: res };
}

export async function deleteCourseAction(id: string) {
  const session = await getAuthenticatedUser();
  await deleteCourse(id);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'DELETE_COURSE',
    resource: 'Courses',
    details: `Course ID '${id}' deleted.`,
  });
  revalidatePath('/admin');
  return { success: true };
}

// APPLICATION ACTIONS
export async function fetchApplicationsAction() {
  return await getApplications();
}

export async function updateApplicationStatusAction(id: string, status: ApplicationItem['status']) {
  await getAuthenticatedUser();
  const res = await updateApplicationStatus(id, status);
  revalidatePath('/admin');
  return { success: true, application: res };
}

// COORDINATOR MAPPING ACTIONS
export async function fetchMappingsAction() {
  const [faculty, student] = await Promise.all([getFacultyMappings(), getStudentMappings()]);
  return { faculty, student };
}

export async function saveFacultyMappingAction(data: { facultyId: string; facultyName: string; programmeId: string; programmeName: string; subject: string }) {
  await getAuthenticatedUser();
  const res = await saveFacultyMapping(data);
  revalidatePath('/program-coordinator');
  return { success: true, mapping: res };
}

export async function saveStudentMappingAction(data: { studentId: string; studentName: string; programmeId: string; programmeName: string; semester: string }) {
  await getAuthenticatedUser();
  const res = await saveStudentMapping(data);
  revalidatePath('/program-coordinator');
  return { success: true, mapping: res };
}

// LEARNING RESOURCES ACTIONS
export async function fetchLearningResourcesAction() {
  const session = await getAuthenticatedUser();
  const allResources = await getLearningResources(session.role === 'STUDENT' ? session.id : undefined);
  return allResources;
}

export async function saveLearningResourceAction(res: Omit<LearningResourceItem, 'id' | 'uploadedAt'> & { id?: string }) {
  const session = await getAuthenticatedUser();
  if (!res.title || !res.title.trim()) return { success: false, error: 'Resource Title is required.' };
  if (!res.fileUrl || !res.fileUrl.trim()) return { success: false, error: 'File Link or URL is required.' };
  const item = await saveLearningResource(res);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: res.id ? 'UPDATE_RESOURCE' : 'UPLOAD_RESOURCE',
    resource: 'LearningResources',
    details: `Resource '${item.title}' (${item.fileType}) uploaded for Course '${item.courseName}'.`,
  });
  revalidatePath('/faculty');
  revalidatePath('/student');
  return { success: true, resource: item };
}

export async function deleteLearningResourceAction(id: string) {
  await getAuthenticatedUser();
  await deleteLearningResource(id);
  revalidatePath('/faculty');
  revalidatePath('/student');
  return { success: true };
}

export async function recordResourceViewAction(resourceId: string, extra?: { lastPosition?: number; duration?: number; percentage?: number; isCompleted?: boolean }) {
  const session = await getAuthenticatedUser();
  const studentRegNo = session.studentId || (session as any).username || session.id;
  const view = await recordResourceView({
    resourceId,
    studentId: session.id,
    studentName: session.name || 'Student',
    studentRegNo,
    lastPosition: extra?.lastPosition,
    duration: extra?.duration,
    percentage: extra?.percentage,
    isCompleted: extra?.isCompleted,
  });
  return { success: true, view };
}

export async function updateVideoProgressAction(data: {
  resourceId: string;
  lastPosition: number;
  duration: number;
  percentage: number;
  isCompleted?: boolean;
}) {
  const session = await getAuthenticatedUser();
  const studentRegNo = session.studentId || (session as any).username || session.id;
  const view = await updateResourceVideoProgress({
    resourceId: data.resourceId,
    studentId: session.id,
    studentName: session.name || 'Student',
    studentRegNo,
    lastPosition: data.lastPosition,
    duration: data.duration,
    percentage: data.percentage,
    isCompleted: data.isCompleted,
  });
  return { success: true, view };
}

export async function fetchStudentVideoProgressAction(): Promise<ResourceViewItem[]> {
  const session = await getAuthenticatedUser();
  return await getStudentResourceViews(session.id);
}

export async function fetchResourceViewsAction(resourceId: string): Promise<ResourceViewItem[]> {
  await getAuthenticatedUser();
  return await getResourceViews(resourceId);
}

// ASSESSMENT ACTIONS
export async function fetchAssessmentsAction() {
  const session = await getAuthenticatedUser();
  const all = await getAssessments();

  if (session.role === 'STUDENT') {
    // 1. Only published assessments
    const published = all.filter((a) => a.isPublished);
    // 2. Hide answer keys from student questions payload so unauthorized answer keys cannot be inspected
    return published.map((a) => {
      let questions: QuizQuestion[] = [];
      try {
        questions = JSON.parse(a.questions || '[]');
      } catch {
        questions = [];
      }
      const sanitized = questions.map((q) => ({
        ...q,
        correctAnswer: '' as any,
      }));
      return {
        ...a,
        questions: JSON.stringify(sanitized),
      };
    });
  }

  if (session.role === 'FACULTY') {
    const facultyCourses = await getCourses();
    const assignedCourseIds = new Set(
      facultyCourses.filter((c) => c.facultyId === session.id || c.facultyName === session.name).map((c) => c.id)
    );
    const facultyAssignments = await getFacultyAssignments({ facultyId: session.id });
    const assignedPaperIds = new Set(facultyAssignments.map((f) => f.paperId));

    return all.filter((a) => {
      const matchCourse = a.courseId && assignedCourseIds.has(a.courseId);
      const matchPaper = a.paperId && assignedPaperIds.has(a.paperId);
      return matchCourse || matchPaper || (!a.courseId && !a.paperId);
    });
  }

  return all;
}

export async function fetchAssessmentByIdAction(id: string) {
  const session = await getAuthenticatedUser();
  const ass = await getAssessmentById(id);
  if (!ass) return null;

  if (session.role === 'STUDENT') {
    if (!ass.isPublished) return null;
    let questions: QuizQuestion[] = [];
    try {
      questions = JSON.parse(ass.questions || '[]');
    } catch {
      questions = [];
    }
    const sanitized = questions.map((q) => ({
      ...q,
      correctAnswer: '' as any,
    }));
    return {
      ...ass,
      questions: JSON.stringify(sanitized),
    };
  }

  return ass;
}

export async function saveAssessmentAction(ass: Omit<AssessmentItem, 'id'> & { id?: string }) {
  const session = await getAuthenticatedUser();
  if (!ass.title || !ass.title.trim()) return { success: false, error: 'Assessment Title is required.' };
  if (!ass.maxMarks || ass.maxMarks <= 0) return { success: false, error: 'Maximum Marks must be greater than 0.' };
  const item = await saveAssessment(ass);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: ass.id ? 'UPDATE_ASSESSMENT' : 'CREATE_ASSESSMENT',
    resource: 'Assessments',
    details: `Assessment '${item.title}' (Max Marks: ${item.maxMarks}) was saved.`,
  });
  revalidatePath('/faculty');
  revalidatePath('/student');
  return { success: true, assessment: item };
}

export async function toggleAssessmentPublishAction(id: string) {
  const session = await getAuthenticatedUser();
  const item = await toggleAssessmentPublish(id);
  if (item) {
    await logAuditEvent({
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: item.isPublished ? 'PUBLISH_ASSESSMENT' : 'UNPUBLISH_ASSESSMENT',
      resource: 'Assessments',
      details: `Assessment '${item.title}' was ${item.isPublished ? 'published for student attendance' : 'unpublished'}.`,
    });
  }
  revalidatePath('/faculty');
  revalidatePath('/student');
  return { success: true, assessment: item };
}

export async function deleteAssessmentAction(id: string) {
  const session = await getAuthenticatedUser();
  await deleteAssessment(id);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'DELETE_ASSESSMENT',
    resource: 'Assessments',
    details: `Assessment ID '${id}' was deleted.`,
  });
  revalidatePath('/faculty');
  return { success: true };
}


export async function submitAssessmentAction(
  assessmentId: string,
  selectedAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | null>
) {
  const session = await getAuthenticatedUser();
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    return { success: false, error: 'Assessment not found.' };
  }

  let questions: QuizQuestion[] = [];
  try {
    questions = JSON.parse(assessment.questions || '[]');
  } catch {
    questions = [];
  }

  if (questions.length === 0) {
    return { success: false, error: 'Assessment contains no valid questions.' };
  }

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const details: QuestionAnswerDetail[] = questions.map((q) => {
    const sel = selectedAnswers[q.id] ?? null;
    const isCorrect = sel !== null && sel.toUpperCase() === q.correctAnswer.toUpperCase();

    if (sel === null) {
      unansweredCount++;
    } else if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }

    return {
      questionId: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      selectedAnswer: sel as 'A' | 'B' | 'C' | 'D' | null,
      correctAnswer: q.correctAnswer as 'A' | 'B' | 'C' | 'D',
      isCorrect,
    };
  });

  const totalQuestions = questions.length;
  const score = correctCount;
  const maxMarks = totalQuestions;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const status: 'PASS' | 'FAIL' = percentage >= 40 ? 'PASS' : 'FAIL';

  const answersPayload: SubmissionAnswersPayload = {
    totalQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    score,
    maxMarks,
    percentage,
    status,
    details,
  };

  const submission = await submitAssessmentResult({
    assessmentId,
    studentId: String(session.id || ''),
    studentName: String(session.name || 'Student'),
    score,
    maxMarks,
    percentage,
    answers: JSON.stringify(answersPayload),
  });

  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'SUBMIT_ASSESSMENT',
    resource: 'Assessments',
    details: `Student '${session.name}' completed assessment '${assessment.title}' with score ${score}/${maxMarks} (${percentage}% - ${status}).`,
  });

  revalidatePath('/faculty');
  revalidatePath('/student');

  return { success: true, submission };
}

export async function fetchAssessmentSubmissionsAction(assessmentId?: string) {
  const session = await getAuthenticatedUser();
  if (session.role === 'STUDENT') {
    return await getStudentAssessmentSubmissions(String(session.id || ''));
  }
  return await getAssessmentSubmissions(assessmentId);
}


export async function fetchStudentSubmissionsAction() {
  const session = await getAuthenticatedUser();
  return await getStudentAssessmentSubmissions(String(session.id || ''));
}

// ASSIGNMENT ACTIONS
export async function fetchAssignmentsAction() {
  return await getAssignments();
}

export async function saveAssignmentAction(asg: Omit<AssignmentItem, 'id' | 'submissions'> & { id?: string }) {
  const user = await getAuthenticatedUser();
  if (user.role !== 'FACULTY' && user.role !== 'ADMIN' && user.role !== 'PROGRAM_COORDINATOR') {
    return { success: false, error: 'Unauthorized. Staff or Admin access required to manage assignments.' };
  }
  if (!asg.title || !asg.title.trim()) return { success: false, error: 'Assignment Title is required.' };
  if (!asg.courseId) return { success: false, error: 'Subject / Course selection is required.' };
  if (!asg.dueDate) return { success: false, error: 'Due Date & Time is required.' };

  const item = await saveAssignment(asg);
  revalidatePath('/faculty');
  revalidatePath('/student');
  revalidatePath('/program-coordinator');
  revalidatePath('/admin');
  return { success: true, assignment: item };
}

export async function submitAssignmentAction(
  assignmentId: string,
  fileUrl: string,
  comments?: string,
  fileName?: string,
  fileSize?: string
) {
  const user = await getAuthenticatedUser();
  if (user.role !== 'STUDENT') {
    return { success: false, error: 'Only enrolled students can submit completed assignments.' };
  }
  if (!fileUrl || !fileUrl.trim()) {
    return { success: false, error: 'Please upload a completed assignment file before submitting.' };
  }

  const result = await submitAssignmentSolution(
    assignmentId,
    user.id,
    user.name,
    fileUrl,
    comments,
    fileName,
    fileSize
  );

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to submit assignment.' };
  }

  revalidatePath('/student');
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  revalidatePath('/admin');
  return { success: true, assignment: result.assignment };
}

export async function gradeAssignmentAction(assignmentId: string, studentId: string, marks: number, feedback: string) {
  const user = await getAuthenticatedUser();
  if (user.role !== 'FACULTY' && user.role !== 'ADMIN' && user.role !== 'PROGRAM_COORDINATOR') {
    return { success: false, error: 'Unauthorized to evaluate and grade assignments.' };
  }
  if (marks < 0) return { success: false, error: 'Marks cannot be negative.' };
  const item = await gradeAssignmentSubmission(assignmentId, studentId, marks, feedback);
  revalidatePath('/faculty');
  revalidatePath('/student');
  revalidatePath('/program-coordinator');
  revalidatePath('/admin');
  return { success: true, assignment: item };
}

export async function deleteAssignmentAction(id: string) {
  const user = await getAuthenticatedUser();
  if (user.role !== 'FACULTY' && user.role !== 'ADMIN' && user.role !== 'PROGRAM_COORDINATOR') {
    return { success: false, error: 'Unauthorized to delete assignments.' };
  }
  await deleteAssignment(id);
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  revalidatePath('/admin');
  return { success: true };
}

// INTERNAL MARKS ACTIONS
export async function fetchInternalMarksAction() {
  return await getInternalMarks();
}

export async function saveInternalMarkAction(markData: Omit<InternalMarkItem, 'id' | 'updatedAt'> & { id?: string }) {
  await getAuthenticatedUser();
  if (markData.marks < 0 || markData.marks > markData.maxMarks) {
    return { success: false, error: `Marks must be between 0 and ${markData.maxMarks}.` };
  }
  const item = await saveInternalMark(markData);
  revalidatePath('/faculty');
  revalidatePath('/student');
  return { success: true, mark: item };
}

// SCHEDULE ACTIONS
export async function fetchSchedulesAction() {
  return await getSchedules();
}

export async function saveScheduleAction(sch: Omit<ScheduleItem, 'id'> & { id?: string }) {
  await getAuthenticatedUser();
  if (!sch.courseName || !sch.courseName.trim()) return { success: false, error: 'Course is required.' };
  if (!sch.date) return { success: false, error: 'Date is required.' };
  const item = await saveSchedule(sch);
  revalidatePath('/faculty');
  revalidatePath('/student');
  revalidatePath('/program-coordinator');
  return { success: true, schedule: item };
}

export async function deleteScheduleAction(id: string) {
  await getAuthenticatedUser();
  await deleteSchedule(id);
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  return { success: true };
}

// FEE ACTIVITIES ACTIONS
export async function fetchFeeActivitiesAction() {
  const user = await getAuthenticatedUser();
  return await getFeeActivities(user.role === 'STUDENT' ? user.id : undefined);
}

// DISCUSSION FORUMS ACTIONS
export async function fetchDiscussionsAction() {
  return await getDiscussionForums();
}

export async function createDiscussionAction(data: { courseId: string; courseName: string; subject: string; title: string; content: string }) {
  const user = await getAuthenticatedUser();
  if (!data.title || !data.title.trim()) return { success: false, error: 'Discussion Title is required.' };
  if (!data.content || !data.content.trim()) return { success: false, error: 'Discussion Body is required.' };
  const item = await createDiscussion({
    ...data,
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
  });
  revalidatePath('/student');
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  return { success: true, discussion: item };
}

export async function replyToDiscussionAction(forumId: string, content: string) {
  const user = await getAuthenticatedUser();
  if (!content || !content.trim()) return { success: false, error: 'Reply content cannot be empty.' };
  const item = await replyToDiscussion(forumId, {
    authorId: user.id,
    authorName: user.name,
    authorRole: user.role,
    content,
  });
  revalidatePath('/student');
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  return { success: true, discussion: item };
}

// CIRCULARS ACTIONS
export async function fetchCircularsAction() {
  return await getCirculars();
}

export async function saveCircularAction(circ: Omit<CircularItem, 'id'> & { id?: string }) {
  await getAuthenticatedUser();
  if (!circ.title || !circ.title.trim()) return { success: false, error: 'Circular Title is required.' };
  const item = await saveCircular(circ);
  revalidatePath('/admin');
  revalidatePath('/student');
  revalidatePath('/program-coordinator');
  return { success: true, circular: item };
}

export async function deleteCircularAction(id: string) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN' && session.role !== 'PROGRAM_COORDINATOR' && session.role !== 'FACULTY') {
    return { success: false, error: 'Unauthorized.' };
  }
  await deleteCircular(id);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'DELETE_ANNOUNCEMENT',
    resource: 'Announcements',
    details: `Announcement ID '${id}' deleted.`,
  });
  revalidatePath('/admin');
  revalidatePath('/student');
  revalidatePath('/faculty');
  revalidatePath('/program-coordinator');
  return { success: true };
}


// MESSAGES ACTIONS
export async function fetchMessagesAction() {
  const user = await getAuthenticatedUser();
  return await getMessages(user.id);
}

export async function sendMessageAction(receiverId: string, receiverName: string, subject: string, body: string) {
  const user = await getAuthenticatedUser();
  if (!subject || !subject.trim()) return { success: false, error: 'Subject is required.' };
  if (!body || !body.trim()) return { success: false, error: 'Message body cannot be empty.' };
  const item = await sendMessage({
    senderId: user.id,
    senderName: user.name,
    receiverId,
    receiverName,
    subject,
    body,
  });
  return { success: true, message: item };
}

// MENTORING ACTIONS
export async function fetchMentoringInfoAction() {
  const user = await getAuthenticatedUser();
  return await getMentoringInfo(user.id);
}

// NOTIFICATIONS ACTIONS
export async function fetchNotificationsAction() {
  const user = await getAuthenticatedUser();
  return await getNotifications(user.id);
}

export async function markNotificationAsReadAction(id: string) {
  await markNotificationAsRead(id);
  return { success: true };
}

export async function markAllNotificationsAsReadAction() {
  const user = await getAuthenticatedUser();
  await markAllNotificationsAsRead(user.id);
  return { success: true };
}

// CERTIFICATES ACTIONS
export async function fetchCertificatesAction() {
  const user = await getAuthenticatedUser();
  return await getCertificates(user.role === 'STUDENT' ? user.id : undefined);
}

// SUPPORT TICKETS ACTIONS
export async function fetchSupportTicketsAction() {
  const user = await getAuthenticatedUser();
  return await getSupportTickets(user.role === 'STUDENT' ? user.id : undefined);
}

export async function createSupportTicketAction(subject: string, category: string, description: string, priority: 'Low' | 'Medium' | 'High' | 'Urgent', attachmentUrl?: string) {
  const user = await getAuthenticatedUser();
  if (!subject || !subject.trim()) return { success: false, error: 'Ticket Subject is required.' };
  if (!description || !description.trim()) return { success: false, error: 'Ticket Description is required.' };
  const item = await createSupportTicket({
    studentId: user.id,
    studentName: user.name,
    subject,
    category,
    description,
    priority,
    attachmentUrl,
  });
  return { success: true, ticket: item };
}

export async function respondToTicketAction(ticketId: string, message: string, newStatus?: SupportTicketItem['status']) {
  const user = await getAuthenticatedUser();
  if (!message || !message.trim()) return { success: false, error: 'Response message cannot be empty.' };
  const item = await respondToTicket(ticketId, user.name, user.role, message, newStatus);
  return { success: true, ticket: item };
}

// CONTACT DIRECTORY ACTION
export async function fetchContactDirectoryAction() {
  return await getContactDirectory();
}

// PROFILE UPDATE ACTION (Students can only update address and mobile; photos are managed exclusively by Admin)
export async function updateSelfProfileAction(data: { address?: string; mobile?: string }) {
  const user = await getAuthenticatedUser();
  if (data.mobile && data.mobile.trim() && !/^[+0-9\s-]{8,15}$/.test(data.mobile.trim())) {
    return { success: false, error: 'Please enter a valid mobile number.' };
  }
  await updateUser(user.id, {
    address: data.address,
    mobile: data.mobile,
  });
  return { success: true };
}

// ACADEMIC MANAGEMENT ACTIONS (PROGRAM COORDINATOR MODULE)

export async function fetchSyllabusesAction(programmeId?: string) {
  return await getSyllabuses(programmeId);
}

export async function saveSyllabusAction(data: Omit<SyllabusItem, 'id'> & { id?: string }) {
  await getAuthenticatedUser();
  if (!data.name || !data.name.trim()) return { success: false, error: 'Syllabus Title is required.' };
  if (!data.regulation || !data.regulation.trim()) return { success: false, error: 'Regulation year is required.' };
  const syl = await saveSyllabus(data);
  revalidatePath('/program-coordinator');
  return { success: true, syllabus: syl };
}

export async function deleteSyllabusAction(id: string) {
  await getAuthenticatedUser();
  await deleteSyllabus(id);
  revalidatePath('/program-coordinator');
  return { success: true };
}

export async function mapProgramSyllabusAction(programmeId: string, syllabusId: string) {
  await getAuthenticatedUser();
  await mapProgramSyllabus(programmeId, syllabusId);
  revalidatePath('/program-coordinator');
  return { success: true };
}

export async function fetchSemestersAction(programmeId?: string) {
  return await getSemesters(programmeId);
}

export async function saveSemesterAction(data: Omit<SemesterItem, 'id'> & { id?: string }) {
  await getAuthenticatedUser();
  const sem = await saveSemester(data);
  revalidatePath('/program-coordinator');
  return { success: true, semester: sem };
}

export async function fetchPapersAction(options?: { programmeId?: string; semesterName?: string; facultyId?: string }) {
  return await getPapers(options);
}

export async function savePaperAction(data: Omit<PaperItem, 'id'> & { id?: string }) {
  await getAuthenticatedUser();
  if (!data.name || !data.name.trim()) return { success: false, error: 'Paper Name is required.' };
  if (!data.code || !data.code.trim()) return { success: false, error: 'Paper Code is required.' };
  const paper = await savePaper(data);
  revalidatePath('/program-coordinator');
  revalidatePath('/faculty');
  return { success: true, paper };
}

export async function deletePaperAction(id: string) {
  await getAuthenticatedUser();
  await deletePaper(id);
  revalidatePath('/program-coordinator');
  return { success: true };
}

export async function fetchFacultyAssignmentsAction(options?: { facultyId?: string; programmeId?: string }) {
  return await getFacultyAssignments(options);
}

export async function assignFacultyToPaperAction(data: { facultyId: string; paperId: string; academicYear?: string; calendarYear?: string }) {
  await getAuthenticatedUser();
  if (!data.facultyId) return { success: false, error: 'Faculty selection is required.' };
  if (!data.paperId) return { success: false, error: 'Paper selection is required.' };
  try {
    const assignment = await assignFacultyToPaper(data);
    revalidatePath('/program-coordinator');
    revalidatePath('/faculty');
    return { success: true, assignment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign faculty to paper.' };
  }
}

export async function deleteFacultyAssignmentAction(id: string) {
  await getAuthenticatedUser();
  await deleteFacultyAssignment(id);
  revalidatePath('/program-coordinator');
  revalidatePath('/faculty');
  return { success: true };
}

export async function fetchCoordinatorMetricsAction() {
  await getAuthenticatedUser();
  return await getCoordinatorMetrics();
}

export async function fetchFacultyTeachingAction(facultyIdOverride?: string) {
  try {
    const user = await getAuthenticatedUser();
    const targetFacultyId = facultyIdOverride || (user.role === 'FACULTY' ? user.id : undefined);
    if (!targetFacultyId) {
      return [];
    }
    return await getFacultyTeachingData(targetFacultyId);
  } catch {
    if (facultyIdOverride) {
      return await getFacultyTeachingData(facultyIdOverride);
    }
    return [];
  }
}

export async function fetchPaperUnitsAction(paperId: string) {
  return await getPaperUnits(paperId);
}

export async function savePaperUnitAction(data: {
  paperId: string;
  unitNumber: number;
  title?: string;
  textContent?: string;
  pdfUrl?: string;
}) {
  const user = await getAuthenticatedUser();
  if (user.role !== 'ADMIN' && user.role !== 'PROGRAM_COORDINATOR') {
    return { success: false, error: 'Unauthorized. Only Programme Coordinator or Admin can edit syllabus units.' };
  }
  try {
    const unit = await savePaperUnit(data);
    revalidatePath('/program-coordinator');
    revalidatePath('/faculty');
    revalidatePath('/student');
    return { success: true, unit };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save paper unit.' };
  }
}

export async function fetchPaperSyllabusProgressAction(paperId: string) {
  return await getPaperSyllabusProgress(paperId);
}

// STUDY CENTRES ACTIONS
export async function fetchStudyCentresAction() {
  await getAuthenticatedUser();
  return await getStudyCentres();
}

export async function saveStudyCentreAction(
  centre: Omit<StudyCentreItem, 'id' | 'createdAt'> & { id?: string }
) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }
  if (!centre.name || !centre.name.trim()) return { success: false, error: 'Study centre name is required.' };
  if (!centre.code || !centre.code.trim()) return { success: false, error: 'Centre code is required.' };

  const res = await saveStudyCentre(centre);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: centre.id ? 'UPDATE_STUDY_CENTRE' : 'CREATE_STUDY_CENTRE',
    resource: 'StudyCentres',
    details: `Study centre '${res.name}' (${res.code}) saved.`,
  });
  revalidatePath('/admin');
  return { success: true, centre: res };
}

export async function toggleStudyCentreStatusAction(id: string) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }
  const res = await toggleStudyCentreStatus(id);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'TOGGLE_STUDY_CENTRE_STATUS',
    resource: 'StudyCentres',
    details: `Study centre ID '${id}' status changed to ${res?.status}.`,
  });
  revalidatePath('/admin');
  return { success: true, centre: res };
}

export async function deleteStudyCentreAction(id: string) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }
  await deleteStudyCentre(id);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'DELETE_STUDY_CENTRE',
    resource: 'StudyCentres',
    details: `Study centre ID '${id}' deleted.`,
  });
  revalidatePath('/admin');
  return { success: true };
}

// ACADEMIC YEARS ACTIONS
export async function fetchAcademicYearsAction() {
  await getAuthenticatedUser();
  return await getAcademicYears();
}

export async function saveAcademicYearAction(
  ay: Omit<AcademicYearItem, 'id' | 'createdAt'> & { id?: string }
) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN' && session.role !== 'PROGRAM_COORDINATOR') {
    return { success: false, error: 'Unauthorized.' };
  }
  if (!ay.year || !ay.year.trim()) return { success: false, error: 'Academic Year is required (e.g. 2025-2026).' };

  const res = await saveAcademicYear(ay);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: ay.id ? 'UPDATE_ACADEMIC_YEAR' : 'CREATE_ACADEMIC_YEAR',
    resource: 'AcademicYears',
    details: `Academic year '${res.year}' (${res.status}) saved.`,
  });
  revalidatePath('/admin');
  revalidatePath('/program-coordinator');
  return { success: true, academicYear: res };
}

export async function deleteAcademicYearAction(id: string) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }
  await deleteAcademicYear(id);
  revalidatePath('/admin');
  return { success: true };
}

// ATTENDANCE & PARTICIPATION ACTIONS
export async function fetchAttendanceRecordsAction(filters?: {
  courseId?: string;
  studentId?: string;
  date?: string;
  paperId?: string;
}) {
  await getAuthenticatedUser();
  return await getAttendanceRecords(filters);
}

export async function recordAttendanceAction(
  records: Array<Omit<AttendanceRecordItem, 'id' | 'createdAt'>>
) {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN' && session.role !== 'PROGRAM_COORDINATOR' && session.role !== 'FACULTY') {
    return { success: false, error: 'Unauthorized. Staff role required to record attendance.' };
  }
  await recordAttendance(records);
  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'RECORD_ATTENDANCE',
    resource: 'Attendance',
    details: `Recorded attendance for ${records.length} students on date ${records[0]?.date || 'today'}.`,
  });
  revalidatePath('/faculty');
  revalidatePath('/student');
  revalidatePath('/program-coordinator');
  return { success: true };
}

export async function fetchStudentAttendanceSummaryAction() {
  const session = await getAuthenticatedUser();
  return await getStudentAttendanceSummary(session.id);
}

// AUDIT LOGS ACTIONS
export async function fetchAuditLogsAction() {
  const session = await getAuthenticatedUser();
  if (session.role !== 'ADMIN') {
    return [];
  }
  return await getAuditLogs(100);
}

// FACULTY ANNOUNCEMENT ACTION
export async function saveFacultyAnnouncementAction(announcement: {
  title: string;
  description: string;
  isImportant?: boolean;
}) {
  const session = await getAuthenticatedUser();
  if (!announcement.title || !announcement.title.trim()) {
    return { success: false, error: 'Announcement title is required.' };
  }
  const dateStr = new Date().toISOString().split('T')[0];
  const item = await saveCircular({
    title: announcement.title,
    description: announcement.description,
    date: dateStr,
    isImportant: announcement.isImportant || false,
  });

  await logAuditEvent({
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: 'POST_ANNOUNCEMENT',
    resource: 'Announcements',
    details: `Announcement '${item.title}' posted by ${session.name}.`,
  });

  revalidatePath('/faculty');
  revalidatePath('/student');
  revalidatePath('/admin');
  return { success: true, circular: item };
}



