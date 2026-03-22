// ─── Enums ────────────────────────────────────────────────────────────────────

export type AssignmentStatus = "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";

export type Difficulty = "EASY" | "MODERATE" | "HARD";

export type QuestionType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "NUMERICAL"
  | "DIAGRAM_BASED"
  | "TRUE_FALSE"
  | "FILL_IN_THE_BLANK";

// ─── Models ───────────────────────────────────────────────────────────────────

export interface Question {
  questionText: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  marks: number;
  imageUrl?: string;
  answerKey?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  status: AssignmentStatus;
  totalMarks: number;
  numberOfQuestions: number;
  marksPerQuestion: number;
  questionTypes: QuestionType[];
  sections?: Section[];
  pdfGenerated: boolean;
  pdfUrl?: string;
  jobId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  schoolName: string;
  subject: string;
  standardClass: string;
  timeAllowed: string;
}

export interface JobTracker {
  jobId: string;
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface Group {
  id: string;
  teacherEmail: string;
  name: string;
  subject: string;
  standardClass: string;
  studentEmails: string[];
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  teacherEmail: string;
  originalAssignmentId: string;
  title: string;
  subject: string;
  standardClass: string;
  description?: string;
  paperContent: Section[];
  savedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  institution?: string;
  roles: string[];
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  institution: string | null;
  roles: string[];
  isAuthenticated: boolean;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  teacherId: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  additionalInstructions?: string;
  schoolName?: string;
  subject: string;
  standardClass?: string;
  timeAllowed: string;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface JobStatusWsMessage {
  jobId: string;
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface QuestionTypeEntry {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface CreateAssignmentFormData {
  title: string;
  subject: string;
  standardClass: string;
  schoolName: string;
  dueDate: string;
  timeAllowed: string;
  description: string;
  additionalInstructions: string;
  questionTypes: QuestionTypeEntry[];
}
